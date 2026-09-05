import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist (used by pdf-parse) dynamically imports its worker script at
  // runtime. Turbopack's bundler rewrites that dynamic import path and breaks
  // it ("Setting up fake worker failed"). Excluding it from bundling leaves
  // it as a plain Node require/import, which resolves correctly.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
