import { WordPressService } from './wordpress.service.js';

const wp = new WordPressService();

// Configuración de mapeos de categorías (Slugs ES y EN)
const CATEGORY_MAP = {
  bags: { es: 'bags', en: 'bags-en' },
  wigs: { es: 'wigs', en: 'wigs-en' },
  jewelry: { es: 'jewelry', en: 'jewelry-en' },
  clothing: { es: 'clothing', en: 'clothing-en' },
  beauty: { es: 'accesorios-de-belleza', en: 'beauty-accessories' } // Fallback / Default
};

export interface BilingualSetupResult {
  success: boolean;
  status: 'cloned' | 'skipped' | 'failed';
  message?: string;
  originalId?: number;
  clonedId?: number;
  categoryAssigned?: string;
}

export class ProductSetupService {
  /**
   * Reintenta una operación asíncrona con un número máximo de intentos.
   */
  private async retryWrapper<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastErr: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;
        console.warn(`[ProductSetupService] Intento ${attempt}/${maxRetries} fallido: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff lineal corto
        }
      }
    }
    throw lastErr;
  }

  /**
   * Obtiene el ID numérico de una categoría en WordPress filtrando por su slug.
   */
  private async getCategoryIdBySlug(slug: string): Promise<number> {
    const response = await this.retryWrapper(() => 
      wp.client.get('/wp/v2/product_cat', { params: { slug } })
    );
    if (response.data && response.data.length > 0) {
      return response.data[0].id;
    }
    throw new Error(`Categoría con slug "${slug}" no encontrada.`);
  }

  /**
   * Clasifica inteligentemente un producto basándose en su título y descripción.
   */
  private determineCategoryKey(name: string, description: string): keyof typeof CATEGORY_MAP {
    const text = `${name} ${description || ''}`.toLowerCase();

    if (/bag|bolso|tote|backpack|purse|clutch/i.test(text)) {
      return 'bags';
    }
    if (/wig|peluca|hair|extension/i.test(text)) {
      return 'wigs';
    }
    if (/jewelry|joya|necklace|ring|earring|bracelet|collar|anillo|pulsera/i.test(text)) {
      return 'jewelry';
    }
    if (/clothing|ropa|dress|shirt|pants|tshirt|vestido|blusa|camisa/i.test(text)) {
      return 'clothing';
    }
    return 'beauty'; // Por defecto
  }

  /**
   * Orquesta el flujo completo para asegurar que un producto entrante tenga su clon EN y vinculación Polylang.
   */
  public async setupBilingualProduct(productId: number): Promise<BilingualSetupResult> {
    const timer = setTimeout(() => {
      throw new Error('Operación cancelada por timeout de 30 segundos.');
    }, 30000);

    try {
      console.log(`\n[ProductSetupService] Iniciando setup bilingüe para ID: ${productId}...`);

      // 1. Obtener el producto origen desde WooCommerce REST
      const productData = await this.retryWrapper(async () => {
        const res = await wp.client.get(`/wc/v3/products/${productId}`);
        return res.data;
      });

      const productName = productData.name;
      const productDesc = productData.description;
      console.log(`[ProductSetupService] Producto origen cargado: "${productName}"`);

      // 2. Validar si ya existe una traducción vinculada en Polylang (Deduplicación)
      const wpProductRes = await this.retryWrapper(() => wp.client.get(`/wp/v2/product/${productId}`));
      const translations = wpProductRes.data.translations || {};

      if (translations.en && translations.en !== productId) {
        console.log(`[ProductSetupService] Skip ⏹️. El producto ya posee traducción vinculada (EN ID: ${translations.en}).`);
        clearTimeout(timer);
        return {
          success: true,
          status: 'skipped',
          message: 'El producto ya cuenta con una traducción en inglés.',
          originalId: productId,
          clonedId: translations.en
        };
      }

      // 3. Determinar categoría óptima por heurística
      const catKey = this.determineCategoryKey(productName, productDesc);
      console.log(`[ProductSetupService] Categoría inferida heurísticamente: "${catKey.toUpperCase()}"`);

      // Obtener IDs correspondientes de WordPress
      const esSlug = CATEGORY_MAP[catKey].es;
      const enSlug = CATEGORY_MAP[catKey].en;
      const catEsId = await this.getCategoryIdBySlug(esSlug);
      const catEnId = await this.getCategoryIdBySlug(enSlug);

      // 4. Forzar el idioma 'es' y fijar la categoría ES en el origen
      console.log(`[ProductSetupService] Actualizando idioma ES y categoría en origen...`);
      await this.retryWrapper(() => 
        wp.client.post(`/wp/v2/product/${productId}`, { lang: 'es' })
      );
      await this.retryWrapper(() => 
        wp.client.post(`/wc/v3/products/${productId}`, { categories: [{ id: catEsId }] })
      );

      // 5. Construir y crear el clon EN en WooCommerce
      console.log(`[ProductSetupService] Creando clon EN en catálogo...`);
      const clonedImages = (productData.images || []).map((img: any) => ({
        src: img.src,
        name: img.name,
        alt: img.alt
      }));

      // Payload del clon EN
      const newEnPayload = {
        name: productName, // Mantener el título tal cual (Spocket ya lo trae en inglés)
        slug: `${productData.slug}-en`,
        status: 'publish',
        type: productData.type || 'simple',
        description: productDesc,
        short_description: productData.short_description,
        regular_price: productData.regular_price || '19.99', // Fallback por si viene vacío
        sale_price: productData.sale_price || '',
        categories: [{ id: catEnId }],
        images: clonedImages,
        meta_data: [
          { key: '_pll_language', value: 'en' }
        ]
      };

      const createdWcProduct = await this.retryWrapper(async () => {
        const res = await wp.client.post('/wc/v3/products', newEnPayload);
        return res.data;
      });
      const clonedId = createdWcProduct.id;
      console.log(`[ProductSetupService] Clon EN creado con éxito (ID: ${clonedId})`);

      // 6. Enlazar bidireccionalmente en Polylang
      console.log(`[ProductSetupService] Vinculando hermanamiento Polylang (ES ${productId} <-> EN ${clonedId})...`);
      
      // Primero forzar que el clon sea 'en' para Polylang
      await this.retryWrapper(() => 
        wp.client.post(`/wp/v2/product/${clonedId}`, { lang: 'en' })
      );

      // Establecer la matriz de traducciones en el origen
      await this.retryWrapper(() => 
        wp.client.post(`/wp/v2/product/${productId}`, {
          translations: {
            es: productId,
            en: clonedId
          }
        })
      );

      console.log(`[ProductSetupService] ¡Pipeline completado con éxito! ✅`);
      clearTimeout(timer);

      return {
        success: true,
        status: 'cloned',
        originalId: productId,
        clonedId: clonedId,
        categoryAssigned: catKey
      };

    } catch (error: any) {
      clearTimeout(timer);
      console.error(`[ProductSetupService] Error crítico procesando producto ${productId}:`, error.response?.data?.message || error.message);
      return {
        success: false,
        status: 'failed',
        message: error.response?.data?.message || error.message,
        originalId: productId
      };
    }
  }
}
