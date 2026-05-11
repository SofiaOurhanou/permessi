import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "bcryptjs"],
  transpilePackages: ["swagger-ui-react"],
};

export default nextConfig;
