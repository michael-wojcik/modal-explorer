import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/modal-explorer',
  assetPrefix: '/modal-explorer/',
};

export default nextConfig;
