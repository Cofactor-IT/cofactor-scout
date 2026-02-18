import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // `output: 'standalone'` currently causes Windows filesystem copy warnings
  // due to traced chunk filenames (e.g. `node:inspector`). Keep standalone
  // output for non-Windows deploy targets.
  ...(process.platform === 'win32' ? {} : { output: 'standalone' }),

  // Prevent Next from externalizing packages that rely on non-Node-resolvable
  // subpath imports (e.g. bullmq -> ioredis/built/utils).
  // This reduces "Package ioredis can't be external" warnings.
  serverExternalPackages: [],

  // Request body size limits (DoS protection)
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb', // Default limit for server actions
    },
  },

  // Ensure Turbopack uses this project root even if other lockfiles exist.
  turbopack: {
    root: __dirname,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
