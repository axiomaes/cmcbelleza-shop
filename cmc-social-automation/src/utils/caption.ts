export function generateInstagramCaption(productName: string, price: string, permalink: string): string {
  const cleanPrice = price ? `${price}`.replace(/[^\d.,]/g, '') : 'Consultar';
  
  return `⭐ PRODUCTO EN PROMOCIÓN ⭐

${productName}

✨ Aprovecha esta oportunidad en CMC Belleza.
💰 Precio: ${cleanPrice}€
🔗 Ver más: ${permalink}

#CMCBelleza #Oferta #EsteticaMadrid`;
}

export function generateFacebookCaption(productName: string, price: string, description?: string): string {
  const cleanPrice = price ? `${price}`.replace(/[^\d.,]/g, '') : 'Consultar';
  
  // Sanitizar HTML del payload de WooCommerce
  const rawDesc = description || '';
  const textOnlyDesc = rawDesc.replace(/<[^>]*>/g, '').trim();
  
  // Límite estricto de 200 caracteres con elipses si excede
  let summary = textOnlyDesc;
  if (summary.length > 200) {
    summary = summary.substring(0, 197) + '...';
  }

  return [
    `🛍️ ${productName}`,
    ``,
    summary,
    ``,
    `💵 $${cleanPrice}`,
    ``,
    `🔗 Shop now: https://cmcbelleza.shop/en/tienda`,
    ``,
    `#CMCBelleza #BeautyAccessories #Fashion #USA`
  ].filter(Boolean).join('\n');
}
