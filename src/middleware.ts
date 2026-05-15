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

  // ⚡ Cambio temporal: Simplificar a EN único. Redirigir ES y default a EN.
  // Reactivar para bilingüismo ES/EN restaurando detección dinámica de getLocale

  // 1. Si la ruta es /es o empieza con /es/, redirigir obligatoriamente a /en
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const newPathname = pathname === '/es' ? '/en' : pathname.replace(/^\/es\//, '/en/');
    request.nextUrl.pathname = newPathname;
    return NextResponse.redirect(request.nextUrl);
  }

  // 2. Comprobar si la ruta tiene /en/ al inicio o es exactamente /en
  const pathnameHasEn = pathname === '/en' || pathname.startsWith('/en/');

  if (pathnameHasEn) {
    return NextResponse.next();
  }

  // 3. Default -> Redirigir a /en (cualquier ruta sin locale)
  request.nextUrl.pathname = `/en${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Matcher mejorado para no interceptar recursos estáticos ni APIs
  matcher: [
    // Interceptar todas las rutas excepto las que contienen un punto (archivos) y rutas internas
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
};
