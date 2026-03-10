/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cmcbelleza.shop',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
