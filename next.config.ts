import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/watch-your-mp",
  assetPrefix: "/watch-your-mp",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
