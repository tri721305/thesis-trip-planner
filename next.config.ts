import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "static.vecteezy.com",
  //       port: "",
  //     },
  //     {
  //       protocol: "https",
  //       hostname: "lh3.googleusercontent.com",
  //       port: "",
  //     },
  //     {
  //       protocol: "https",
  //       hostname: "avatars.githubusercontent.com",
  //       port: "",
  //     },
  //     {
  //       protocol: "https",
  //       hostname: "trip-planner-thesis.s3.ap-southeast-1.amazonaws.com",
  //       port: "",
  //     },
  //     {
  //       protocol: "https",
  //       hostname: "itin-dev.wanderlogstatic.com",
  //       port: "",
  //     },
  //     {
  //       protocol: "https",
  //       hostname: "**", // Cho phép tất cả hostname
  //     },
  //     {
  //       protocol: "http",
  //       hostname: "**", // Cho phép HTTP (nếu cần)
  //     },
  //   ],
  // },
  images: {
    unoptimized: true, // Tắt optimization, cho phép mọi source
  },
};

export default nextConfig;
