/**
 * CMC Belleza — Next.js Core CMS (Secure Custom Fields & REST Interface)
 */

// ============================================================================
// TYPESCRIPT DEFINITIONS
// ============================================================================

export interface BaseBlock {
  acf_fc_layout: string;
}

export interface HeroBlockData extends BaseBlock {
  acf_fc_layout: 'hero_banner';
  title: string;           // Max 60 chars
  subtitle: string;        // Max 120 chars
  image: string;           // URL
  cta_text?: string;       // Max 20 chars
  cta_url?: string;
  overlay_opacity?: number; // 0-100
}

export interface TextImageBlockData extends BaseBlock {
  acf_fc_layout: 'text_image';
  title: string;           // Max 50 chars
  content: string;         // WYSIWYG (HTML), Max 400 chars
  image: string;           // URL
  image_position: 'left' | 'right';
}

export interface ProductsGridBlockData extends BaseBlock {
  acf_fc_layout: 'products_grid';
  title: string;           // Max 40 chars
  subtitle?: string;       // Max 100 chars
  category_id?: number;
  products_count: number;  // Default: 4
}

export interface CtaBannerBlockData extends BaseBlock {
  acf_fc_layout: 'cta_banner';
  title: string;           // Max 50 chars
  subtitle?: string;       // Max 100 chars
  background_color?: string; // HEX Code
  cta_text?: string;       // Max 20 chars
  cta_url?: string;
}

export interface TestimonialBlockData extends BaseBlock {
  acf_fc_layout: 'testimonial';
  quote: string;           // Max 200 chars
  author: string;          // Max 40 chars
  rating: number;          // 1-5
}

export type FlexibleBlock = 
  | HeroBlockData 
  | TextImageBlockData 
  | ProductsGridBlockData 
  | CtaBannerBlockData 
  | TestimonialBlockData;

// Page template interfaces
export interface HomePageACF {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  features_title?: string;
  feature_1?: { feature_1_icon?: string; feature_1_title?: string; feature_1_desc?: string };
  feature_2?: { feature_2_icon?: string; feature_2_title?: string; feature_2_desc?: string };
  feature_3?: { feature_3_icon?: string; feature_3_title?: string; feature_3_desc?: string };
  banner_active?: boolean;
  banner_title?: string;
  banner_image?: string;
  banner_cta_text?: string;
  banner_cta_url?: string;
  collections_title?: string;
  collections_subtitle?: string;
}

export interface AboutPageACF {
  about_title?: string;
  about_subtitle?: string;
  about_image?: string;
  story_title?: string;
  story_content?: string;
  value_1?: { value_1_title?: string; value_1_desc?: string };
  value_2?: { value_2_title?: string; value_2_desc?: string };
  value_3?: { value_3_title?: string; value_3_desc?: string };
}

export interface FlexiblePageACF {
  flexible_blocks?: FlexibleBlock[];
}

// Universal Page Shape
export interface CMCPageResponse<T = FlexiblePageACF | HomePageACF | AboutPageACF> {
  id: number;
  slug: string;
  lang: string;
  translation_id: number | null;
  template: string | null;
  acf: T;
  status: string;
  title: string;
}

const API_BASE = process.env.WP_API_URL || 'https://api.cmcbelleza.shop/wp-json';

/**
 * MÓDULO 3A & 5: Fetcher con Fallback Bilingüe
 * 1. Intenta cargar contenido en locale solicitado.
 * 2. Si falla o no tiene campos ACF, intenta cargar en ES (español, fallback global).
 * 3. Si tampoco existe en ES, retorna null.
 */
export async function getPageContent<T = any>(
  slug: string, 
  locale: string = 'es'
): Promise<CMCPageResponse<T> | null> {
  
  // Paso 1: Cargar locale solicitado
  let data = await fetchCMS<T>(slug, locale);

  // Paso 2: Validar si vino vacío o null y el locale solicitado era 'en'
  const hasAcfContent = data && data.acf && Object.keys(data.acf).length > 0;
  
  if (locale !== 'es' && (!data || !hasAcfContent)) {
    console.warn(`[CMS CMS-Fallback] Fallo o falta traducción para "${slug}" en "${locale}". Recurriendo al fallback ES.`);
    // Intentar cargar en 'es'
    const fallbackData = await fetchCMS<T>(slug, 'es');
    
    // Validar fallback
    if (fallbackData && fallbackData.acf && Object.keys(fallbackData.acf).length > 0) {
      return fallbackData;
    }
  }

  // Validar que al menos tenga ACF (si viene vacío, retornamos null para el 404 localizado)
  if (!data || !hasAcfContent) {
    return null;
  }

  return data;
}

/**
 * Fetch aislado con Fetch nativo de Next.js (ISR habilitado con revalidate)
 */
async function fetchCMS<T>(slug: string, locale: string): Promise<CMCPageResponse<T> | null> {
  const cleanSlug = encodeURIComponent(slug.trim());
  const targetLang = locale.toLowerCase() === 'en' ? 'en' : 'es';
  const endpoint = `${API_BASE}/cmc/v1/page/${cleanSlug}?lang=${targetLang}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      next: {
        revalidate: 3600, // 1 hora de caché ISR (Módulo 3A / 3D)
        tags: [`page-${slug}`, `lang-${targetLang}`]
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP Error CMS Fetch: ${response.status}`);
    }

    const rawData = await response.json();
    
    // Normalización de respuesta vacía
    if (!rawData || !rawData.id) {
      return null;
    }

    return rawData as CMCPageResponse<T>;
  } catch (err) {
    console.error(`[CMS Error] Failed to fetch CMS page "${slug}" [${targetLang}]:`, err);
    return null;
  }
}
