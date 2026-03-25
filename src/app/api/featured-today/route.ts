import { NextResponse } from 'next/server';

// CONFIGURACIÓN n8n:
// Nodo: HTTP Request
// Method: GET
// URL: https://cmcbelleza.shop/api/featured-today
// Headers:
//   x-api-key: [valor de FEATURED_API_KEY]
// Response: JSON

const WP_API_URL = process.env.WP_API_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const FEATURED_API_KEY = process.env.FEATURED_API_KEY;

export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey || apiKey !== FEATURED_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!WP_API_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0] + 'T00:00:00';
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');
    
    // WooCommerce REST API call
    const response = await fetch(`${WP_API_URL}/wc/v3/products?featured=true&after=${today}&per_page=20`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error('Error fetching WooCommerce products:', await response.text());
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 502 });
    }

    const products = await response.json();
    const resultProducts: any[] = [];

    for (const product of products) {
      const imagen_principal = product.images && product.images.length > 0 ? product.images[0].src : null;
      let video_url = null;

      // Meta data checks
      if (product.meta_data) {
        const metaVideo1 = product.meta_data.find((m: any) => m.key === 'video_url');
        const metaVideo2 = product.meta_data.find((m: any) => m.key === '_video_url');
        const metaVideo3 = product.meta_data.find((m: any) => m.key === 'wc_product_video');

        if (metaVideo1) video_url = metaVideo1.value;
        else if (metaVideo2) video_url = metaVideo2.value;
        else if (metaVideo3) video_url = metaVideo3.value;
      }

      // Description check if video not found
      if (!video_url && product.description) {
        const regex = /(https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[\w\-]+)/i;
        const match = product.description.match(regex);
        if (match) {
          video_url = match[0];
        }
      }

      if (imagen_principal || video_url) {
        resultProducts.push({
          id: product.id,
          nombre: product.name,
          slug: product.slug,
          precio: product.price,
          imagen_principal,
          video_url,
          tiene_imagen: !!imagen_principal,
          tiene_video: !!video_url,
        });
      }
    }

    const dateOnly = today.split('T')[0];

    if (resultProducts.length === 0) {
      return NextResponse.json({
        fecha: dateOnly,
        total: 0,
        productos: [],
        mensaje: 'No hay productos destacados con imagen o video para hoy',
      });
    }

    return NextResponse.json({
      fecha: dateOnly,
      total: resultProducts.length,
      productos: resultProducts,
    });

  } catch (error) {
    console.error('Error in /api/featured-today:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
