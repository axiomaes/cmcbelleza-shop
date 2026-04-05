import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (!process.env.REVALIDATE_SECRET) {
    console.error('REVALIDATE_SECRET is not defined in environment variables');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    // Revalidamos el tag 'products' que añadiremos a los fetches
    revalidateTag('products', 'default');
    
    // Forzamos la revalidación de las páginas principales de listado
    revalidatePath('/', 'layout');
    revalidatePath('/tienda', 'layout');
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: 'Cache cleared for tag: products' 
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
