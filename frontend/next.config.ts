import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Fix warning about inferred workspace root
  // (turbopack must be at the root of the config, not in experimental)
  turbopack: {
    root: '..',
  },
  // Allow external device access for HMR
  allowedDevOrigins: ['192.168.1.164', 'localhost'],
};

export default nextConfig;
