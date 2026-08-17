export type Vec2 = { x: number; y: number };
export type Vec3 = Vec2 & { z: number };

export type PipelinePrimitive = {
  id: "triangle" | "quad" | "back-face";
  label: string;
  backFacing: boolean;
  local: Vec3[];
  world: Vec3[];
  eye: Vec3[];
  projected: Vec2[];
  clipped: Vec2[];
  viewport: Vec2[];
};

export type SceneSelection = "both" | "triangle" | "quad";

const definitions = [
  {
    id: "triangle" as const,
    label: "Orange triangle",
    backFacing: false,
    local: [
      { x: -0.8, y: -0.58, z: 0 },
      { x: 0.8, y: -0.58, z: 0 },
      { x: 0, y: 0.78, z: 0 },
    ],
    position: { x: -0.62, y: 0.2, z: 2.7 },
    rotation: 12,
  },
  {
    id: "quad" as const,
    label: "Blue quad",
    backFacing: false,
    local: [
      { x: -0.68, y: -0.58, z: 0 },
      { x: 0.68, y: -0.58, z: 0 },
      { x: 0.68, y: 0.58, z: 0 },
      { x: -0.68, y: 0.58, z: 0 },
    ],
    position: { x: 0.72, y: -0.16, z: 3.5 },
    rotation: -10,
  },
  {
    id: "back-face" as const,
    label: "Back-facing triangle",
    backFacing: true,
    local: [
      { x: -0.38, y: -0.32, z: 0 },
      { x: 0, y: 0.42, z: 0 },
      { x: 0.38, y: -0.32, z: 0 },
    ],
    position: { x: 0.12, y: 0.55, z: 3.1 },
    rotation: 0,
  },
];

function rotate(point: Vec3, degrees: number): Vec3 {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    x: point.x * cosine - point.y * sine,
    y: point.x * sine + point.y * cosine,
    z: point.z,
  };
}

function inside(point: Vec2, edge: "left" | "right" | "bottom" | "top") {
  if (edge === "left") return point.x >= -1;
  if (edge === "right") return point.x <= 1;
  if (edge === "bottom") return point.y >= -1;
  return point.y <= 1;
}

function intersection(a: Vec2, b: Vec2, edge: "left" | "right" | "bottom" | "top"): Vec2 {
  if (edge === "left" || edge === "right") {
    const x = edge === "left" ? -1 : 1;
    const t = (x - a.x) / (b.x - a.x);
    return { x, y: a.y + (b.y - a.y) * t };
  }
  const y = edge === "bottom" ? -1 : 1;
  const t = (y - a.y) / (b.y - a.y);
  return { x: a.x + (b.x - a.x) * t, y };
}

export function clipPolygon(points: Vec2[]) {
  return (["left", "right", "bottom", "top"] as const).reduce<Vec2[]>((polygon, edge) => {
    if (polygon.length === 0) return polygon;
    const output: Vec2[] = [];
    for (let index = 0; index < polygon.length; index += 1) {
      const current = polygon[index];
      const previous = polygon[(index + polygon.length - 1) % polygon.length];
      const currentInside = inside(current, edge);
      const previousInside = inside(previous, edge);
      if (currentInside !== previousInside) output.push(intersection(previous, current, edge));
      if (currentInside) output.push(current);
    }
    return output;
  }, points);
}

export function projectPoint(point: Vec3): Vec2 {
  const focalLength = 1.7;
  return { x: (point.x * focalLength) / point.z, y: (point.y * focalLength) / point.z };
}

export function ndcToViewport(point: Vec2, width: number, height: number): Vec2 {
  return { x: ((point.x + 1) / 2) * width, y: (1 - (point.y + 1) / 2) * height };
}

function selected(id: PipelinePrimitive["id"], selection: SceneSelection) {
  return id === "back-face" || selection === "both" || id === selection;
}

export function buildPipelineScene({
  cameraX,
  sceneRotation,
  selection,
  viewportWidth = 640,
  viewportHeight = 360,
}: {
  cameraX: number;
  sceneRotation: number;
  selection: SceneSelection;
  viewportWidth?: number;
  viewportHeight?: number;
}) {
  return definitions.filter((definition) => selected(definition.id, selection)).map<PipelinePrimitive>((definition) => {
    const world = definition.local.map((point) => {
      const rotated = rotate(point, definition.rotation + sceneRotation);
      return {
        x: rotated.x + definition.position.x,
        y: rotated.y + definition.position.y,
        z: rotated.z + definition.position.z,
      };
    });
    const eye = world.map((point) => ({ ...point, x: point.x - cameraX }));
    const projected = eye.map(projectPoint);
    const clipped = definition.backFacing ? [] : clipPolygon(projected);
    return {
      id: definition.id,
      label: definition.label,
      backFacing: definition.backFacing,
      local: definition.local,
      world,
      eye,
      projected,
      clipped,
      viewport: clipped.map((point) => ndcToViewport(point, viewportWidth, viewportHeight)),
    };
  });
}

export function pointInPolygon(point: Vec2, polygon: Vec2[]) {
  let insidePolygon = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    const crosses = a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) insidePolygon = !insidePolygon;
  }
  return insidePolygon;
}

export function rasterize(primitives: PipelinePrimitive[], columns = 20, rows = 12) {
  const hits: Array<{ column: number; row: number; primitive: PipelinePrimitive["id"] }> = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const sample = { x: ((column + 0.5) / columns) * 640, y: ((row + 0.5) / rows) * 360 };
      const primitive = [...primitives].reverse().find((item) => pointInPolygon(sample, item.viewport));
      if (primitive) hits.push({ column, row, primitive: primitive.id });
    }
  }
  return hits;
}
