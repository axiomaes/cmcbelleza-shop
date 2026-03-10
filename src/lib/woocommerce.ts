import { Product, Category, OrderData, Order } from "@/types";

const WP_API_URL = process.env.WP_API_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

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
    next: { revalidate: 3600, ...options.next }, // Default 1 hour cache
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

export async function fetchProducts(params?: { category?: string; per_page?: number; page?: number }): Promise<Product[]> {
  let query = "";
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append("category", params.category);
    if (params.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params.page) searchParams.append("page", params.page.toString());
    query = `?${searchParams.toString()}`;
  }
  
  return wooFetch<Product[]>(`/products${query}`);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const products = await wooFetch<Product[]>(`/products?slug=${slug}`);
  if (!products || products.length === 0) {
    throw new Error(`Product not found with slug: ${slug}`);
  }
  return products[0];
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
