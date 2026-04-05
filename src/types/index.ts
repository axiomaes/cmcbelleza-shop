export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;          // Usado SOLO para lógica interna y API calls
  slug: string;        // Usado SOLO para URLs públicas SEO-friendly
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: ProductImage[];
  categories: Category[];
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  featured: boolean;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderData {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface Order extends OrderData {
  id: number;
  status: string;
  total: string;
  order_key: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface WPPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
}
