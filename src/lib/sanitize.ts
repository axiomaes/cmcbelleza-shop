/**
 * Sanitiza el contenido HTML de las páginas legales eliminando información sensible
 * y sustituyéndola por datos genéricos o placeholders.
 */
export function sanitizeLegalContent(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  let sanitized = htmlContent;

  // Reemplazar Nombres personales o Razón Social específica
  sanitized = sanitized.replace(/Jonatan Garcia Planas/gi, '[Titular / Razón Social]');

  // Reemplazar NIF/CIF sensible o con máscara
  sanitized = sanitized.replace(/4545\*\*\*444/gi, '[NIF / CIF]');
  sanitized = sanitized.replace(/45452392Z/gi, '[NIF / CIF]'); // Por si aparece sin máscara en el API

  // Reemplazar dirección física real
  sanitized = sanitized.replace(/Calle Kaustrasse,\s*7/gi, '[Domicilio Social]');
  sanitized = sanitized.replace(/Calle Kaustrasse/gi, '[Domicilio Social]');

  // Reemplazar Teléfonos específicos
  sanitized = sanitized.replace(/44\s*783\s*161\s*475/gi, '[Teléfono]');
  sanitized = sanitized.replace(/44783161475/gi, '[Teléfono]');

  // Reemplazar correos si se considera sensible, o dejarlos como genérico
  // soporte@cmcbelleza.shop se puede cambiar por un genérico.
  sanitized = sanitized.replace(/soporte@cmcbelleza\.shop/gi, '[Correo electrónico]');

  return sanitized;
}
