import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    // We run type check separately
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
