import type { NextConfig } from "next";
import path from "path";

// Use process.cwd() so resolution matches where `npm run dev` is started (Frontend/).
const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  // Avoid scanning C:\Users\anshu because of a stray package-lock.json there.
  outputFileTracingRoot: path.join(projectRoot),
};

export default nextConfig;
