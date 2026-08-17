import type { Metadata } from "next";
import { RasterizationExplorer } from "../../components/RasterizationExplorer";
import { SiteHeader } from "../../components/SiteHeader";
import { defaultRasterState } from "../../lib/rasterization";

export const metadata: Metadata = {
  title: "Rasterization Explorer · Concept Visualizer",
  description:
    "Move a triangle over a pixel grid and see how rasterization produces fragments.",
};

export const dynamic = "force-static";

export default function RasterizationPage() {
  return (
    <div className="lesson-page">
      <SiteHeader compact />
      <RasterizationExplorer initialState={defaultRasterState} />
    </div>
  );
}
