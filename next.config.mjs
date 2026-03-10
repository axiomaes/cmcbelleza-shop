/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.cmcbelleza.shop',
      },
      {
        protocol: 'https',
        hostname: 'cmcbelleza.shop',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.woocommerce.com',
      },
      {
        protocol: 'https', 
        hostname: '*.wordpress.com',
      },
    ],
  },
};

export default nextConfig;
