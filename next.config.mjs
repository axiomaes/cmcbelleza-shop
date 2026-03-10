/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.cmcbelleza.shop' },
      { protocol: 'https', hostname: 'cmcbelleza.shop' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.wordpress.com' },
      { protocol: 'https', hostname: '**.woocommerce.com' },
    ],
  },
};

export default nextConfig;
