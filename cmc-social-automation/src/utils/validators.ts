import { FastifyRequest } from 'fastify';
import { env } from '../config/env.js';

export interface WCProductPayload {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  permalink: string;
  featured: boolean;
  images: Array<{ src: string; id?: number; alt?: string }>;
  description?: string;
  categories?: Array<{ id: number; name: string; slug: string }>;
}

export function validateWebhookSecret(request: FastifyRequest): boolean {
  const providedSecret = request.headers['x-webhook-secret'];
  
  // Fallback seguro: si no se proporciona cabecera, es inválido
  if (!providedSecret) return false;
  
  return providedSecret === env.WEBHOOK_SECRET;
}

export function isValidProductForCampaign(product: any): { valid: boolean; reason?: string; data?: WCProductPayload } {
  
  if (!product || typeof product !== 'object') {
    return { valid: false, reason: 'El payload no es un objeto válido' };
  }

  // 1. ¿Posee la categoría especial para disparo social?
  const hasSocialCategory = Array.isArray(product.categories) && 
    product.categories.some((cat: any) => cat.slug === env.SOCIAL_PUBLISH_CATEGORY_SLUG);

  if (!hasSocialCategory) {
    return { valid: false, reason: `El producto no tiene la categoría de disparo social '${env.SOCIAL_PUBLISH_CATEGORY_SLUG}'` };
  }

  // 2. ¿Tiene ID y Nombre?
  if (!product.id || !product.name) {
    return { valid: false, reason: 'Falta ID o Nombre del producto' };
  }

  // 3. ¿Tiene precio asignado?
  if (!product.price || product.price === '') {
    return { valid: false, reason: 'El producto no tiene precio establecido' };
  }

  // 4. ¿Tiene al menos una imagen con SRC?
  const hasValidImage = Array.isArray(product.images) && product.images.length > 0 && product.images[0]?.src;
  
  if (!hasValidImage) {
    return { valid: false, reason: 'El producto no tiene imagen destacada válida' };
  }

  return {
    valid: true,
    data: product as WCProductPayload
  };
}
