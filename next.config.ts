import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "concept-visualizer";
const assetPrefix = isGitHubPages ? `/${repositoryName}` : undefined;

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  assetPrefix,
};

export default nextConfig;
