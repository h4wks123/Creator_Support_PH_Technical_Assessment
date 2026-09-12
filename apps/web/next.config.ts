import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
};

export default nextConfig;
