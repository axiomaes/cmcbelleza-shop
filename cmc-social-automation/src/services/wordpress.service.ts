import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env.js';

export class WordPressService {
  public readonly client: AxiosInstance;

  constructor() {
    // Generación de cabecera de autenticación Basic Auth requerida por WordPress REST API
    const auth = Buffer.from(`${env.WP_ADMIN_USER}:${env.WP_APP_PASSWORD}`).toString('base64');
    
    this.client = axios.create({
      baseURL: env.WP_API_URL,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Método de comprobación para certificar conectividad y validez de credenciales
   */
  async testConnection(): Promise<{ success: boolean; username?: string; error?: string }> {
    try {
      const response = await this.client.get('/wp/v2/users/me');
      return {
        success: true,
        username: response.data.slug || response.data.name,
      };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}
