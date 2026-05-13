import { query } from './index.js';

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'x';

export async function initDatabase() {
  const sqlLogs = `
    CREATE TABLE IF NOT EXISTS registro_social_media (
      id SERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL,
      product_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT DEFAULT 'published',
      published_at TIMESTAMP DEFAULT NOW(),
      external_post_id TEXT,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(product_id, platform)
    );
  `;
  
  const sqlTokens = `
    CREATE TABLE IF NOT EXISTS meta_tokens (
      id SERIAL PRIMARY KEY,
      token_type VARCHAR(50) NOT NULL,
      access_token TEXT NOT NULL,
      expires_at TIMESTAMP,
      page_id VARCHAR(100),
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await query(sqlLogs);
  await query(sqlTokens);
}

export interface MetaTokenRecord {
  id?: number;
  token_type: string;
  access_token: string;
  expires_at: Date | null;
  page_id: string | null;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function getActiveMetaToken(): Promise<MetaTokenRecord | null> {
  const sql = `
    SELECT * FROM meta_tokens 
    WHERE status != 'EXPIRED'
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const result = await query(sql);
  if ((result.rowCount ?? 0) > 0) {
    return result.rows[0] as MetaTokenRecord;
  }
  return null;
}

export async function saveMetaToken(token: MetaTokenRecord) {
  // Marcamos los tokens previos como desactivados/reemplazados
  await query("UPDATE meta_tokens SET status = 'REPLACED', updated_at = NOW() WHERE status = 'ACTIVE'");

  const sql = `
    INSERT INTO meta_tokens (token_type, access_token, expires_at, page_id, status)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await query(sql, [
    token.token_type,
    token.access_token,
    token.expires_at,
    token.page_id,
    token.status || 'ACTIVE'
  ]);
}

export async function markTokenAsExpiringSoon(tokenId: number) {
  const sql = `UPDATE meta_tokens SET status = 'EXPIRING_SOON', updated_at = NOW() WHERE id = $1`;
  await query(sql, [tokenId]);
}

export async function checkExistingPublication(productId: number | string, platform: SocialPlatform): Promise<boolean> {
  const sql = `
    SELECT 1 FROM registro_social_media 
    WHERE product_id = $1 AND platform = $2 AND status = 'published'
    LIMIT 1
  `;
  const result = await query(sql, [productId, platform]);
  return (result.rowCount ?? 0) > 0;
}

export interface SavePublicationParams {
  productId: number | string;
  productName: string;
  platform: SocialPlatform;
  status: 'published' | 'failed';
  externalPostId?: string;
  errorMessage?: string;
}

export async function recordPublication(data: SavePublicationParams) {
  const sql = `
    INSERT INTO registro_social_media 
    (product_id, product_name, platform, status, external_post_id, error_message, published_at)
    VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $4 = 'published' THEN NOW() ELSE NULL END)
    ON CONFLICT (product_id, platform) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      external_post_id = EXCLUDED.external_post_id,
      error_message = EXCLUDED.error_message,
      published_at = EXCLUDED.published_at
  `;
  
  await query(sql, [
    data.productId,
    data.productName,
    data.platform,
    data.status,
    data.externalPostId || null,
    data.errorMessage || null
  ]);
}
