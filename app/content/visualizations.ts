export type VisualizationStatus = "available" | "planned";
export type ConceptField = "Computer Graphics";

export type VisualizationMeta = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  summary: string;
  status: VisualizationStatus;
  field: ConceptField;
  topic: string;
  tags: string[];
  studyMinutes: number;
  difficulty: "Foundational" | "Intermediate";
  interaction: string;
  source: {
    title: string;
    pages: string;
  };
};

const sourceTitle = "Graphics & Visualization: Principles & Algorithms";

export const visualizations: VisualizationMeta[] = [
  {
    slug: "graphics-pipeline",
    number: "01",
    title: "Graphics Pipeline Map",
    shortTitle: "Graphics Pipeline",
    summary: "Follow geometry as coordinate systems and operations turn a model into an image.",
    status: "available",
    field: "Computer Graphics",
    topic: "Pipeline & Coordinates",
    tags: ["Coordinates", "Transforms", "Rendering"],
    studyMinutes: 10,
    difficulty: "Foundational",
    interaction: "Trace the stages",
    source: { title: sourceTitle, pages: "9-11" },
  },
  {
    slug: "clipping",
    number: "02",
    title: "Clipping Lab",
    shortTitle: "Clipping",
    summary: "Move geometry across a view boundary and watch valid fragments emerge.",
    status: "available",
    field: "Computer Graphics",
    topic: "Pipeline & Coordinates",
    tags: ["View volume", "Geometry", "Boundaries"],
    studyMinutes: 8,
    difficulty: "Foundational",
    interaction: "Move the primitive",
    source: { title: sourceTitle, pages: "12" },
  },
  {
    slug: "viewport-transform",
    number: "03",
    title: "Viewport Transform",
    shortTitle: "Viewport Transform",
    summary: "Map normalized coordinates into pixels through scale and translation.",
    status: "available",
    field: "Computer Graphics",
    topic: "Pipeline & Coordinates",
    tags: ["NDC", "Pixels", "Coordinates"],
    studyMinutes: 7,
    difficulty: "Foundational",
    interaction: "Map a point",
    source: { title: sourceTitle, pages: "13" },
  },
  {
    slug: "back-face-culling",
    number: "04",
    title: "Winding & Culling",
    shortTitle: "Winding & Culling",
    summary: "Reverse vertex order and see how orientation decides which faces survive.",
    status: "available",
    field: "Computer Graphics",
    topic: "Geometry & Models",
    tags: ["Triangles", "Orientation", "Meshes"],
    studyMinutes: 6,
    difficulty: "Foundational",
    interaction: "Reverse the winding",
    source: { title: sourceTitle, pages: "14" },
  },
  {
    slug: "rasterization",
    number: "05",
    title: "Rasterization Explorer",
    shortTitle: "Rasterization",
    summary: "Move a triangle across a pixel grid and watch primitives become fragments.",
    status: "available",
    field: "Computer Graphics",
    topic: "Rasterization & Visibility",
    tags: ["Pixels", "Triangles", "Sampling"],
    studyMinutes: 8,
    difficulty: "Foundational",
    interaction: "Drag the vertices",
    source: { title: sourceTitle, pages: "15-16" },
  },
  {
    slug: "depth-testing",
    number: "06",
    title: "Drawing Order vs. Depth",
    shortTitle: "Depth Testing",
    summary: "Compare painter-style drawing with a per-fragment depth buffer.",
    status: "available",
    field: "Computer Graphics",
    topic: "Rasterization & Visibility",
    tags: ["Z-buffer", "Occlusion", "Fragments"],
    studyMinutes: 9,
    difficulty: "Foundational",
    interaction: "Change draw order",
    source: { title: sourceTitle, pages: "17-19" },
  },
  {
    slug: "z-fighting",
    number: "07",
    title: "Z-Fighting Microscope",
    shortTitle: "Z-Fighting",
    summary: "Reveal how finite precision makes nearly coplanar surfaces compete.",
    status: "available",
    field: "Computer Graphics",
    topic: "Rasterization & Visibility",
    tags: ["Precision", "Z-buffer", "Artifacts"],
    studyMinutes: 9,
    difficulty: "Intermediate",
    interaction: "Inspect precision",
    source: { title: sourceTitle, pages: "20" },
  },
  {
    slug: "image-buffers",
    number: "08",
    title: "Image Buffer Workbench",
    shortTitle: "Image Buffers",
    summary: "Inspect pixel memory and compare grayscale, true-color, and palette encoding.",
    status: "available",
    field: "Computer Graphics",
    topic: "Images & Display",
    tags: ["Memory", "Color", "Encoding"],
    studyMinutes: 10,
    difficulty: "Foundational",
    interaction: "Change the encoding",
    source: { title: sourceTitle, pages: "21-23" },
  },
  {
    slug: "frame-timing",
    number: "09",
    title: "Frame Timing & Tearing",
    shortTitle: "Frame Timing",
    summary: "Scrub through scanout and see how buffering and timing affect the display.",
    status: "available",
    field: "Computer Graphics",
    topic: "Images & Display",
    tags: ["Framerate", "Buffers", "VSync"],
    studyMinutes: 9,
    difficulty: "Intermediate",
    interaction: "Change render time",
    source: { title: sourceTitle, pages: "24-27" },
  },
  {
    slug: "obj-mesh",
    number: "10",
    title: "OBJ Mesh Inspector",
    shortTitle: "OBJ Meshes",
    summary: "Connect vertex and face records to the geometry they describe.",
    status: "available",
    field: "Computer Graphics",
    topic: "Geometry & Models",
    tags: ["Meshes", "File formats", "Vertices"],
    studyMinutes: 8,
    difficulty: "Foundational",
    interaction: "Inspect the records",
    source: { title: sourceTitle, pages: "30" },
  },
];

export const availableCount = visualizations.filter(
  (visualization) => visualization.status === "available",
).length;

export const fields = Array.from(new Set(visualizations.map((item) => item.field)));
export const topics = Array.from(new Set(visualizations.map((item) => item.topic)));

export function getVisualization(slug: string) {
  return visualizations.find((item) => item.slug === slug);
}
