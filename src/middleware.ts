import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['es', 'en'];
const defaultLocale = 'es';

function getLocale(request: NextRequest): string {
  // Intenta obtener el idioma de las cookies
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Intenta obtener el idioma del navegador a través de Accept-Language
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    if (acceptLanguage.toLowerCase().startsWith('en')) {
      return 'en';
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar llamadas al API, assets estáticos (_next, favicon, imágenes)
  const isAsset = pathname.match(/\.(.*)$/);
  const isNextInternal = pathname.startsWith('/_next');
  const isApi = pathname.startsWith('/api');

  if (isAsset || isNextInternal || isApi) {
    return NextResponse.next();
  }

  // Comprobar si la ruta actual ya tiene un locale soportado al inicio
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Si no tiene locale, redirigir al locale preferido (es / en)
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Matcher mejorado para no interceptar recursos estáticos ni APIs
  matcher: [
    // Interceptar todas las rutas excepto las que contienen un punto (archivos) y rutas internas
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
};
