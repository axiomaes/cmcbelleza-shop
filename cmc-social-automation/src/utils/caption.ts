export function generateInstagramCaption(productName: string, price: string, permalink: string): string {
  const cleanPrice = price ? `${price}`.replace(/[^\d.,]/g, '') : 'Consultar';
  
  return `⭐ PRODUCTO EN PROMOCIÓN ⭐

${productName}

✨ Aprovecha esta oportunidad en CMC Belleza.
💰 Precio: ${cleanPrice}€
🔗 Ver más: ${permalink}

#CMCBelleza #Oferta #EsteticaMadrid`;
}
