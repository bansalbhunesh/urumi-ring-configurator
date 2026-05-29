import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for the Docker runtime image.
  output: "standalone",
  // Keep TypeScript checks strict, but don't let a stylistic lint rule block a
  // prototype build/deploy. Lint is still run in development.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
