import type { NextConfig } from 'next';
import { getPackageVersion } from './lib/packageVersion';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getPackageVersion(),
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
