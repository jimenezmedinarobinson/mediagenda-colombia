import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar errores de ESLint durante la construcción en Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;