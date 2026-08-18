import type { Metadata } from "next";
import { LibraryClient } from "./components/LibraryClient";
import { SiteHeader } from "./components/SiteHeader";
import { availableCount, visualizations } from "./content/visualizations";

export const metadata: Metadata = {
  title: "Concept Visualizer · Interactive lessons",
  description:
    "Explore computer graphics and signal processing through practical, interactive visual explanations.",
};

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="site-page">
      <SiteHeader />
      <LibraryClient items={visualizations} />
      <footer className="site-footer">
        <div>
          <strong>Concept Visualizer</strong>
          <p>Open-source visual explanations for difficult ideas.</p>
        </div>
        <div className="footer-stats">
          <span>{availableCount} interactive lessons</span>
          <span>More lessons added over time</span>
          <span>v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}
