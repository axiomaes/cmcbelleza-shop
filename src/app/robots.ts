import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/es/',
        '/en/',
        '/es$',
        '/en$'
      ],
      disallow: [
        '/api/',
        '/_next/',
        '/cgi-bin/',
      ],
    },
    sitemap: 'https://cmcbelleza.shop/sitemap.xml',
  };
}
