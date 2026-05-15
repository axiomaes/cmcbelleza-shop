import { Product, Category, OrderData, Order, BlogPost, WPPage } from "@/types";

const WP_API_URL = process.env.WP_API_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

/**
 * Base fetcher for WordPress REST API (core)
 */
async function wpFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!WP_API_URL) {
    throw new Error("Missing WP_API_URL in environment variables.");
  }

  const url = `${WP_API_URL}/wp/v2${endpoint}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: { 
      revalidate: 3600, 
      ...options.next,
      tags: ['products', ...(options.next?.tags || [])]
    },
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`WordPress API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching from WordPress (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Base fetcher for WooCommerce REST API with Basic Auth
 */
async function wooFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!WP_API_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error("Missing WooCommerce API configuration in environment variables.");
  }

  const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");

  const url = `${WP_API_URL}/wc/v3${endpoint}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...options.headers,
    },
    next: { 
      revalidate: 3600, 
      ...options.next,
      tags: ['products', ...(options.next?.tags || [])]
    }, // Default 1 hour cache
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`WooCommerce API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching from WooCommerce (${endpoint}):`, error);
    throw error;
  }
}

export async function fetchProducts(params?: { category?: string; per_page?: number; page?: number; featured?: boolean; lang?: string }): Promise<Product[]> {
  let query = "";
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append("category", params.category);
    if (params.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.featured) searchParams.append("featured", "true");
    if (params.lang) searchParams.append("lang", params.lang);
    query = `?${searchParams.toString()}`;
  }
  
  const data = await wooFetch<Product[]>(`/products${query}`);
  return data.map((product: any) => ({
    ...product,
    name: decodeHtmlEntities(product.name),
    short_description: decodeHtmlEntities(product.short_description),
    description: decodeHtmlEntities(product.description),
    featured: product.featured || false,
  }));
}

export async function fetchProductBySlug(slug: string, lang?: string): Promise<Product> {
  const query = lang ? `/products?slug=${slug}&lang=${lang}` : `/products?slug=${slug}`;
  const products = await wooFetch<Product[]>(query);
  if (!products || products.length === 0) {
    throw new Error(`Product not found with slug: ${slug}`);
  }
  const product = products[0];
  return {
    ...product,
    name: decodeHtmlEntities(product.name),
    short_description: decodeHtmlEntities(product.short_description),
    description: decodeHtmlEntities(product.description),
  };
}

export async function fetchProductById(id: number, lang?: string): Promise<Product> {
  const query = lang ? `/products/${id}?lang=${lang}` : `/products/${id}`;
  return wooFetch<Product>(query);
}

export async function fetchCategories(lang?: string): Promise<Category[]> {
  const query = lang ? `/products/categories?lang=${lang}` : "/products/categories";
  return wooFetch<Category[]>(query);
}

export async function fetchCategoryBySlug(slug: string, lang?: string): Promise<Category | null> {
  const query = lang ? `/products/categories?slug=${slug}&lang=${lang}` : `/products/categories?slug=${slug}`;
  const categories = await wooFetch<Category[]>(query);
  if (!categories || categories.length === 0) {
    return null;
  }
  return categories[0];
}

export async function createOrder(data: OrderData): Promise<Order> {
  return wooFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
    next: { revalidate: 0 }, // Disable cache for orders
  });
}

// Posts del blog via WordPress REST API
export async function fetchBlogPosts(params?: { per_page?: number; page?: number; lang?: string }): Promise<BlogPost[]> {
  const searchParams = new URLSearchParams();
  searchParams.append("_embed", "true");
  if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.lang) searchParams.append("lang", params.lang);
  
  return wpFetch<BlogPost[]>(`/posts?${searchParams.toString()}`);
}

export async function fetchBlogPostBySlug(slug: string, lang?: string): Promise<BlogPost> {
  const query = lang ? `/posts?slug=${slug}&_embed&lang=${lang}` : `/posts?slug=${slug}&_embed`;
  const posts = await wpFetch<BlogPost[]>(query);
  if (!posts || posts.length === 0) {
    throw new Error(`Post not found with slug: ${slug}`);
  }
  return posts[0];
}

// Páginas legales via WordPress REST API  
export async function fetchPageBySlug(slug: string, lang?: string): Promise<WPPage> {
  const query = lang ? `/pages?slug=${slug}&lang=${lang}` : `/pages?slug=${slug}`;
  const pages = await wpFetch<WPPage[]>(query);
  if (!pages || pages.length === 0) {
    throw new Error(`Page not found with slug: ${slug}`);
  }
  return pages[0];
}

// Reviews del producto via WooCommerce REST API
export async function fetchProductReviews(productId: number): Promise<any[]> {
  try {
    const reviews = await wooFetch<any[]>(`/products/reviews?product=${productId}`);
    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for product #${productId}:`, error);
    return [];
  }
}
