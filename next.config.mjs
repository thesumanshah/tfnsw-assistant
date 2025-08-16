import withPWA from '@ducanh2912/next-pwa';

const pwaConfig = {
  dest: 'public',
  register: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.transport\.nsw\.gov\.au\/.*$/,
      handler: 'NetworkFirst',
      options: { cacheName: 'tfnsw-api', networkTimeoutSeconds: 5 }
    },
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: { cacheName: 'pages' }
    }
  ]
};

const nextConfig = {
  experimental: { typedRoutes: true }
};

export default withPWA(pwaConfig)(nextConfig);
