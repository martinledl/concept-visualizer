export type VisualizationStatus = "available" | "planned";

export type VisualizationMeta = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  status: VisualizationStatus;
  stage: string;
  tags: string[];
  studyMinutes: number;
  sourceSlides: string;
};

export const visualizations: VisualizationMeta[] = [
  {
    slug: "rasterization",
    number: "01",
    title: "Rasterization Explorer",
    summary:
      "Move a triangle across a pixel grid and watch primitives become fragments.",
    status: "available",
    stage: "Rendering",
    tags: ["Pixels", "Triangles", "Sampling"],
    studyMinutes: 8,
    sourceSlides: "15-16",
  },
  {
    slug: "graphics-pipeline",
    number: "02",
    title: "Graphics Pipeline Map",
    summary:
      "Follow geometry through model, world, eye, clip, NDC, and image space.",
    status: "planned",
    stage: "Pipeline",
    tags: ["Coordinates", "Transforms"],
    studyMinutes: 10,
    sourceSlides: "9-11",
  },
  {
    slug: "clipping",
    number: "03",
    title: "Clipping Lab",
    summary:
      "Drag primitives through the view volume and inspect new boundary vertices.",
    status: "planned",
    stage: "Clipping",
    tags: ["View volume", "Geometry"],
    studyMinutes: 8,
    sourceSlides: "12",
  },
  {
    slug: "viewport-transform",
    number: "04",
    title: "Viewport Transform",
    summary:
      "Connect normalized device coordinates to pixels through scale and translation.",
    status: "planned",
    stage: "Transform",
    tags: ["NDC", "Coordinates"],
    studyMinutes: 7,
    sourceSlides: "13",
  },
  {
    slug: "back-face-culling",
    number: "05",
    title: "Winding & Culling",
    summary:
      "Reorder vertices and see when clockwise or counter-clockwise faces disappear.",
    status: "planned",
    stage: "Culling",
    tags: ["Triangles", "Orientation"],
    studyMinutes: 6,
    sourceSlides: "14",
  },
  {
    slug: "depth-testing",
    number: "06",
    title: "Drawing Order vs. Depth",
    summary:
      "Compare painter-style drawing with per-fragment depth testing.",
    status: "planned",
    stage: "Visibility",
    tags: ["Z-buffer", "Occlusion"],
    studyMinutes: 9,
    sourceSlides: "17-19",
  },
  {
    slug: "z-fighting",
    number: "07",
    title: "Z-Fighting Microscope",
    summary:
      "Reveal how precision, near planes, and coplanar surfaces create flicker.",
    status: "planned",
    stage: "Visibility",
    tags: ["Precision", "Z-buffer"],
    studyMinutes: 9,
    sourceSlides: "20",
  },
  {
    slug: "image-buffers",
    number: "08",
    title: "Image Buffer Workbench",
    summary:
      "Inspect pixels in memory and compare grayscale, true-color, and CLUT encoding.",
    status: "planned",
    stage: "Images",
    tags: ["Memory", "Color"],
    studyMinutes: 10,
    sourceSlides: "21-23",
  },
  {
    slug: "frame-timing",
    number: "09",
    title: "Frame Timing & Tearing",
    summary:
      "Scrub through scanout and see why double buffering changes what reaches the display.",
    status: "planned",
    stage: "Display",
    tags: ["Framerate", "Buffers"],
    studyMinutes: 9,
    sourceSlides: "24-27",
  },
  {
    slug: "obj-mesh",
    number: "10",
    title: "OBJ Mesh Inspector",
    summary:
      "Connect vertex and face records to the geometry they describe.",
    status: "planned",
    stage: "Modeling",
    tags: ["Meshes", "File formats"],
    studyMinutes: 8,
    sourceSlides: "30",
  },
];

export const availableCount = visualizations.filter(
  (visualization) => visualization.status === "available",
).length;
