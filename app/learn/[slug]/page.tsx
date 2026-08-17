import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FoundationExplorer } from "../../components/FoundationExplorer";
import { PipelineExplorer } from "../../components/PipelineExplorer";
import { SiteHeader } from "../../components/SiteHeader";
import { foundationLessons, foundationLessonSlugs } from "../../content/foundation-lessons";
import { getVisualization } from "../../content/visualizations";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return foundationLessonSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = getVisualization(slug);
  return meta ? { title: `${meta.title} · Concept Visualizer`, description: meta.summary } : {};
}

export default async function FoundationLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getVisualization(slug);
  const lesson = foundationLessons[slug];
  if (!meta || !lesson) notFound();
  return <div className="lesson-page"><SiteHeader compact />{slug === "graphics-pipeline" ? <PipelineExplorer /> : <FoundationExplorer meta={meta} lesson={lesson} />}</div>;
}
