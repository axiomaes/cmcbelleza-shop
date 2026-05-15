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

  /**
   * Remueve de forma limpia una categoría específica asignada a un producto vía WooCommerce API
   */
  async removeCategoryFromProduct(productId: number, categorySlug: string): Promise<boolean> {
    try {
      // 1. Descargar objeto completo actual para preservar las categorías existentes
      const response = await this.client.get(`/wc/v3/products/${productId}`);
      const currentCategories: Array<{ id: number; slug: string }> = response.data.categories || [];
      
      // 2. Filtrar y mapear solo a IDs ( WooCommerce PATCH espera array de objetos {id} )
      const remainingCategories = currentCategories
        .filter(cat => cat.slug !== categorySlug)
        .map(cat => ({ id: cat.id }));
      
      if (remainingCategories.length === currentCategories.length) {
        return false; // No tenía la categoría originalmente
      }

      // 3. Enviar PATCH de actualización parcial
      await this.client.patch(`/wc/v3/products/${productId}`, {
        categories: remainingCategories
      });

      return true;
    } catch (error: any) {
      console.error(`[WordPressService] Error retirando categoría ${categorySlug} del producto #${productId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}
