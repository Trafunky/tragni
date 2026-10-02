import path from "node:path";
import type { NextConfig } from "next";
import { defaultLocale } from "./src/i18n/locales";

const nextConfig: NextConfig = {
  transpilePackages: ["@tragni/api-client"],

  // Emits a self-contained server under .next/standalone: the image then needs
  // neither pnpm nor node_modules.
  output: "standalone",

  async redirects() {
    return [
      {
        source: "/",
        destination: `/${defaultLocale}`,
        permanent: false,
      },
    ];
  },

  // In a workspace, file tracing has to start at the repository root, otherwise
  // the workspace packages are missing from that output. The build runs with
  // apps/web as the working directory.
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
};

export default nextConfig;
