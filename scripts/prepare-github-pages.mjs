import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist/client");
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "concept-visualizer";
const prefixedDirectory = path.join(outputDirectory, repositoryName);
const generatedAssets = path.join(prefixedDirectory, "_next");
const publishedAssets = path.join(outputDirectory, "_next");

await rm(publishedAssets, { recursive: true, force: true });
await rename(generatedAssets, publishedAssets);
await rm(prefixedDirectory, { recursive: true, force: true });

async function createCleanRouteDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await createCleanRouteDirectories(entryPath);
      continue;
    }

    if (
      !entry.name.endsWith(".html") ||
      entry.name === "index.html" ||
      entry.name === "404.html"
    ) {
      continue;
    }

    const routeDirectory = entryPath.slice(0, -".html".length);
    await mkdir(routeDirectory, { recursive: true });
    await rename(entryPath, path.join(routeDirectory, "index.html"));
  }
}

await createCleanRouteDirectories(outputDirectory);
await writeFile(path.join(outputDirectory, ".nojekyll"), "");

console.log(`Prepared GitHub Pages artifact in ${outputDirectory}`);
