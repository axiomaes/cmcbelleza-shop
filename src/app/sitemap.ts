import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = 'https://cmcbelleza.shop';

  // Rutas fijas del sitio
  const locales = ['es', 'en'];
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/tienda', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/nosotros', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contacto', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  // Mapeo de páginas legales localizadas
  const legalPages = {
    es: [
      'aviso-legal',
      'politica-privacidad',
      'politica-de-cookies',
      'terminos-y-condiciones-de-compra'
    ],
    en: [
      'legal-notice',
      'privacy-policy',
      'cookie-policy',
      'terms-and-conditions'
    ]
  };

  const currentYearMonth = new Date();

  // 1. Generar las URLs del menú principal en ES y EN
  const staticEntries = locales.flatMap((locale) => 
    routes.map((route) => ({
      url: `${BASE_URL}/${locale}${route.path}`,
      lastModified: currentYearMonth,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );

  // 2. Generar las URLs legales traducidas
  const legalEntries = [
    ...legalPages.es.map((slug) => ({
      url: `${BASE_URL}/es/${slug}`,
      lastModified: currentYearMonth,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...legalPages.en.map((slug) => ({
      url: `${BASE_URL}/en/${slug}`,
      lastModified: currentYearMonth,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  ];

  return [...staticEntries, ...legalEntries];
}
