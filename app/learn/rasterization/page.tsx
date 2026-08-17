import type { Metadata } from "next";
import { RasterizationExplorer } from "../../components/RasterizationExplorer";
import { SiteHeader } from "../../components/SiteHeader";
import { parseRasterState } from "../../lib/rasterization";

export const metadata: Metadata = {
  title: "Rasterization Explorer · Concept Visualizer",
  description:
    "Move a triangle over a pixel grid and see how rasterization produces fragments.",
};

export default async function RasterizationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return (
    <div className="lesson-page">
      <SiteHeader compact />
      <RasterizationExplorer initialState={parseRasterState(query)} />
    </div>
  );
}
