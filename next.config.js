/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Let these run as real Node modules instead of being bundled by Next.js.
  // ws/bufferutil rely on native/optional bindings that break (e.g. a
  // "t.mask is not a function" crash) if webpack tries to bundle them.
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/adapter-neon",
      "@neondatabase/serverless",
      "ws",
      "bufferutil",
      "utf-8-validate",
    ],
  },
};
module.exports = nextConfig;
