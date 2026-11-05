import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // permite abrir o servidor de desenvolvimento por http://127.0.0.1:3000 (só vale no "next dev")
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
