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

export async function fetchProducts(params?: { category?: string; per_page?: number; page?: number; featured?: boolean }): Promise<Product[]> {
  let query = "";
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append("category", params.category);
    if (params.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.featured) searchParams.append("featured", "true");
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

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const products = await wooFetch<Product[]>(`/products?slug=${slug}`);
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

export async function fetchProductById(id: number): Promise<Product> {
  return wooFetch<Product>(`/products/${id}`);
}

export async function fetchCategories(): Promise<Category[]> {
  return wooFetch<Category[]>("/products/categories");
}

export async function createOrder(data: OrderData): Promise<Order> {
  return wooFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
    next: { revalidate: 0 }, // Disable cache for orders
  });
}

// Posts del blog via WordPress REST API
export async function fetchBlogPosts(params?: { per_page?: number; page?: number }): Promise<BlogPost[]> {
  const searchParams = new URLSearchParams();
  searchParams.append("_embed", "true");
  if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
  if (params?.page) searchParams.append("page", params.page.toString());
  
  return wpFetch<BlogPost[]>(`/posts?${searchParams.toString()}`);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  const posts = await wpFetch<BlogPost[]>(`/posts?slug=${slug}&_embed`);
  if (!posts || posts.length === 0) {
    throw new Error(`Post not found with slug: ${slug}`);
  }
  return posts[0];
}

// Páginas legales via WordPress REST API  
export async function fetchPageBySlug(slug: string): Promise<WPPage> {
  const pages = await wpFetch<WPPage[]>(`/pages?slug=${slug}`);
  if (!pages || pages.length === 0) {
    throw new Error(`Page not found with slug: ${slug}`);
  }
  return pages[0];
}
