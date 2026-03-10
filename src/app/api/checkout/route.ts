import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/woocommerce';
import { CartItem, OrderData } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerData } = body;

    // 1. Validación básica
    if (!items || !items.length || !customerData) {
      return NextResponse.json(
        { error: 'Missing required data', message: 'El carrito o los datos del cliente están vacíos.' },
        { status: 400 }
      );
    }

    const { first_name, last_name, email, phone, address_1, city, postcode } = customerData;

    if (!first_name || !last_name || !email || !address_1 || !city || !postcode) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Por favor, completa todos los campos obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Construir payload para WooCommerce
    const orderData: OrderData = {
      payment_method: 'cod', // Cash on delivery por defecto para esta fase
      payment_method_title: 'Contra Reembolso',
      set_paid: false,
      billing: {
        first_name,
        last_name,
        address_1,
        city,
        state: '',
        postcode,
        country: 'ES',
        email,
        phone,
      },
      shipping: {
        first_name,
        last_name,
        address_1,
        city,
        state: '',
        postcode,
        country: 'ES',
      },
      line_items: items.map((item: CartItem) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    };

    // 3. Crear orden en WooCommerce (Usando las keys de process.env en lib/woocommerce)
    const order = await createOrder(orderData);

    // 4. Retornar éxito
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderKey: order.order_key,
      total: order.total,
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { 
        error: 'Order creation failed', 
        message: error.message || 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.' 
      },
      { status: 500 }
    );
  }
}
