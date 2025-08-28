/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Next.js to listen on all network interfaces
  serverRuntimeConfig: {
    hostname: '0.0.0.0',
    port: process.env.PORT || 8080,
  },
  // Ensure Next.js binds to all interfaces
  env: {
    HOSTNAME: '0.0.0.0',
    PORT: process.env.PORT || '8080',
  },
  // Additional configuration for binding
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    }
    return config;
  },
  // Force host binding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Host',
            value: '0.0.0.0',
          },
        ],
      },
    ];
  },
  // Prisma external packages
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
