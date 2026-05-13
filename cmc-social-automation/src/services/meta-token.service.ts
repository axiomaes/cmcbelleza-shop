import axios from 'axios';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getActiveMetaToken, saveMetaToken, markTokenAsExpiringSoon, MetaTokenRecord } from '../db/queries.js';

// Validaciones Zod para las respuestas de Meta Graph API
const LongLivedTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(), // En segundos si aplica
});

const PageAccountSchema = z.object({
  access_token: z.string(),
  id: z.string(),
  name: z.string(),
});

const PageAccountsResponseSchema = z.object({
  data: z.array(PageAccountSchema),
});

export class MetaTokenService {
  private static readonly BASE_URL = 'https://graph.facebook.com/v19.0';

  /**
   * Paso 1: Intercambiar Short-lived User Token por Long-lived User Access Token (60 días)
   */
  private async getLongLivedUserToken(shortLivedToken: string): Promise<{ token: string; expiresAt: Date | null }> {
    console.log('[MetaTokenService] Solicitando intercambio de token a larga duración (Meta)...');
    
    const res = await axios.get(`${MetaTokenService.BASE_URL}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });

    const data = LongLivedTokenSchema.parse(res.data);
    
    let expiresAt: Date | null = null;
    if (data.expires_in) {
      expiresAt = new Date(Date.now() + data.expires_in * 1000);
    }

    return { token: data.access_token, expiresAt };
  }

  /**
   * Paso 2: Obtener el Page Access Token permanente a partir del User Token de 60 días
   */
  private async getPageAccessToken(longLivedUserToken: string): Promise<string> {
    console.log(`[MetaTokenService] Solicitando listado de páginas para ID: ${env.META_PAGE_ID}`);
    
    const res = await axios.get(`${MetaTokenService.BASE_URL}/me/accounts`, {
      params: {
        access_token: longLivedUserToken,
      },
    });

    const parsed = PageAccountsResponseSchema.parse(res.data);
    const targetPage = parsed.data.find((p) => p.id === env.META_PAGE_ID);
    
    if (!targetPage) {
      throw new Error(`Autorización fallida: La página de Facebook con ID ${env.META_PAGE_ID} no está vinculada al token proveído.`);
    }

    console.log(`[MetaTokenService] ✅ Encontrada la página: "${targetPage.name}". Token de página permanente extraído.`);
    return targetPage.access_token;
  }

  /**
   * Obtener el token activo más reciente de PostgreSQL (con fallback al env si falla)
   */
  async getActiveToken(): Promise<string> {
    try {
      const record = await getActiveMetaToken();
      if (record && record.access_token) {
        return record.access_token;
      }
    } catch (err) {
      console.error('[MetaTokenService] Error al conectar con PG para leer el token:', err);
    }
    
    // Fallback estático como último recurso
    return env.INSTAGRAM_ACCESS_TOKEN;
  }

  /**
   * Ejecuta lógica de comprobación de vida del token.
   * Refresca e inicializa si el token expira pronto o si no existe ningún token activo.
   */
  async refreshTokenIfNeeded(forceRefresh: boolean = false): Promise<{ status: string; message: string }> {
    try {
      const active = await getActiveMetaToken();
      let needsRefresh = forceRefresh || !active;

      if (active && active.expires_at) {
        const expires = new Date(active.expires_at);
        const diffTime = expires.getTime() - Date.now();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          console.warn(`[MetaTokenService] ⚠️ ADVERTENCIA: El token actual expira en ${diffDays} días.`);
          
          // Cambiamos status a alerta en DB (Tarea 5)
          if (active.id) {
            await markTokenAsExpiringSoon(active.id);
          }
          needsRefresh = true;
        }
      }

      if (!needsRefresh) {
        return { 
          status: 'OK', 
          message: active?.expires_at 
            ? `Token vigente. Expira el: ${active.expires_at.toISOString()}` 
            : 'Token vigente. Se detectó una clave de página permanente (Sin fecha de expiración).' 
        };
      }

      console.log('[MetaTokenService] Generando nuevo token mediante secuencia OAuth de Meta...');

      // 1. Obtener token de larga duración
      const longLived = await this.getLongLivedUserToken(env.META_INITIAL_TOKEN);
      
      // 2. Obtener el token definitivo de página (Permanente)
      const permanentPageToken = await this.getPageAccessToken(longLived.token);

      // 3. Guardar el nuevo registro limpio en PostgreSQL
      const newTokenRecord: MetaTokenRecord = {
        token_type: 'PAGE_ACCESS_TOKEN_PERMANENT',
        access_token: permanentPageToken,
        expires_at: null, // NULL indica inmortal / indefinido en Graph API para páginas
        page_id: env.META_PAGE_ID,
        status: 'ACTIVE'
      };

      await saveMetaToken(newTokenRecord);
      console.log('[MetaTokenService] 🚀 Éxito total: Token permanente guardado en PostgreSQL.');

      return { 
        status: 'UPDATED', 
        message: 'Token permanente generado de forma satisfactoria e inyectado en PostgreSQL.' 
      };

    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Error indeterminado de red';
      
      // Log crítico obligatorio para Tarea 5 (Alerta de Expiración)
      console.error('❌ [CRITICAL_ALERT] [MetaTokenService] FALLO EN PROCESO DE AUTO-REFRESCO:', errMsg);
      
      return { 
        status: 'ERROR', 
        message: `Excepción en el refresco de credenciales Meta: ${errMsg}` 
      };
    }
  }
}
