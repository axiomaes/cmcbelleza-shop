import { query } from './index.js';

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'x';

export async function initDatabase() {
  const sql = `
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
  await query(sql);
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
