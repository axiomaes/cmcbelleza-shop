import { NextResponse } from 'next/server';

// CONFIGURACIÓN n8n:
// Nodo: HTTP Request
// Method: GET  
// URL: https://cmcbelleza.shop/api/featured-today
// Authentication: Header Auth
// Header Name: x-api-key
// Header Value: [valor de FEATURED_API_KEY en CapRover]
//
// CONDICIONES DE INCLUSIÓN:
// - Producto marcado como "Destacado" en WooCommerce
// - Creado O modificado en los últimos 7 días
// - Tiene imagen principal O video_url (no ambos nulos)

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

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const after = sevenDaysAgo.toISOString();

    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    };

    // Hacer DOS llamadas en paralelo
    const [responseA, responseB] = await Promise.all([
      fetch(`${WP_API_URL}/wc/v3/products?featured=true&after=${encodeURIComponent(after)}&orderby=date&per_page=50`, { headers, next: { revalidate: 0 } }),
      fetch(`${WP_API_URL}/wc/v3/products?featured=true&modified_after=${encodeURIComponent(after)}&orderby=modified&per_page=50`, { headers, next: { revalidate: 0 } }),
    ]);

    if (!responseA.ok || !responseB.ok) {
      console.error('API Error: responseA', responseA.status, await responseA.text());
      console.error('API Error: responseB', responseB.status, await responseB.text().catch(() => ''));
      return NextResponse.json({ error: 'Failed to fetch products from WooCommerce' }, { status: 502 });
    }

    const [productsA, productsB] = await Promise.all([
      responseA.json(),
      responseB.json(),
    ]);

    // Combinar ambos arrays y deduplicar por product.id
    const allProducts = [...productsA, ...productsB];
    const uniqueMap = new Map();
    for (const p of allProducts) {
      uniqueMap.set(p.id, p);
    }
    const uniqueProducts = Array.from(uniqueMap.values());

    const resultProducts: any[] = [];

    for (const product of uniqueProducts) {
      const imagen_principal = product.images && product.images.length > 0 ? product.images[0].src : null;
      let video_url = null;

      // Meta data checks
      if (product.meta_data) {
        const metaVideo1 = product.meta_data.find((m: any) => m.key === 'video_url');
        const metaVideo2 = product.meta_data.find((m: any) => m.key === '_video_url');
        const metaVideo3 = product.meta_data.find((m: any) => m.key === 'wc_product_video');
        const metaVideo4 = product.meta_data.find((m: any) => m.key === '_product_video_gallery');

        if (metaVideo1 && metaVideo1.value) video_url = metaVideo1.value;
        else if (metaVideo2 && metaVideo2.value) video_url = metaVideo2.value;
        else if (metaVideo3 && metaVideo3.value) video_url = metaVideo3.value;
        else if (metaVideo4 && metaVideo4.value) video_url = metaVideo4.value;
      }

      // Description check if video not found
      if (!video_url && product.description) {
        const regex = /(https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[\w\-]+)/i;
        const match = product.description.match(regex);
        if (match) {
          video_url = match[0];
        }
      }

      // Format dates
      const fecha_creacion = product.date_created || null;
      const fecha_modificacion = product.date_modified || null;
      let fecha_relevante = fecha_creacion;
      
      if (fecha_creacion && fecha_modificacion) {
        const createdMs = new Date(fecha_creacion).getTime();
        const modifiedMs = new Date(fecha_modificacion).getTime();
        fecha_relevante = modifiedMs > createdMs ? fecha_modificacion : fecha_creacion;
      } else if (!fecha_creacion && fecha_modificacion) {
        fecha_relevante = fecha_modificacion;
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
          fecha_creacion,
          fecha_modificacion,
          fecha_relevante,
        });
      }
    }

    if (resultProducts.length === 0) {
      return NextResponse.json({
        fecha_consulta: now.toISOString(),
        ventana_dias: 7,
        desde: after,
        total: 0,
        productos: [],
        mensaje: 'No hay productos destacados con imagen o video en los últimos 7 días',
      });
    }

    return NextResponse.json({
      fecha_consulta: now.toISOString(),
      ventana_dias: 7,
      desde: after,
      total: resultProducts.length,
      productos: resultProducts,
    });

  } catch (error) {
    console.error('Error in /api/featured-today:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
