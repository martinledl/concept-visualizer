export type Point = { x: number; y: number };

export type RasterState = {
  vertices: [Point, Point, Point];
  resolution: number;
  showCenters: boolean;
  showCoverage: boolean;
  mode: "guided" | "explore";
  step: number;
};

export const defaultRasterState: RasterState = {
  vertices: [
    { x: 0.5, y: 0.86 },
    { x: 0.16, y: 0.2 },
    { x: 0.86, y: 0.2 },
  ],
  resolution: 12,
  showCenters: true,
  showCoverage: true,
  mode: "guided",
  step: 0,
};

export function signedArea(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function triangleArea([a, b, c]: [Point, Point, Point]) {
  return Math.abs(signedArea(a, b, c)) / 2;
}

export function pointInTriangle(
  point: Point,
  [a, b, c]: [Point, Point, Point],
) {
  const d1 = signedArea(point, a, b);
  const d2 = signedArea(point, b, c);
  const d3 = signedArea(point, c, a);
  const epsilon = 1e-9;
  const hasNegative = d1 < -epsilon || d2 < -epsilon || d3 < -epsilon;
  const hasPositive = d1 > epsilon || d2 > epsilon || d3 > epsilon;
  return !(hasNegative && hasPositive);
}

export function coveredCells(
  vertices: [Point, Point, Point],
  columns: number,
  rows: number,
) {
  const cells: Array<{ column: number; row: number }> = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const sample = {
        x: (column + 0.5) / columns,
        y: (row + 0.5) / rows,
      };
      if (pointInTriangle(sample, vertices)) {
        cells.push({ column, row });
      }
    }
  }

  return cells;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function parseRasterState(
  query: Record<string, string | string[] | undefined>,
): RasterState {
  const rawVertices = typeof query.v === "string" ? query.v : "";
  const parsedVertices = rawVertices.split(";").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return { x, y };
  });
  const verticesAreValid =
    parsedVertices.length === 3 &&
    parsedVertices.every(
      (point) =>
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        point.x >= 0 &&
        point.x <= 1 &&
        point.y >= 0 &&
        point.y <= 1,
    );
  const rawResolution = Number(query.r);
  const resolution = Number.isFinite(rawResolution)
    ? clamp(Math.round(rawResolution), 6, 18)
    : defaultRasterState.resolution;
  const rawStep = Number(query.s);

  return {
    vertices: verticesAreValid
      ? (parsedVertices as [Point, Point, Point])
      : defaultRasterState.vertices,
    resolution,
    showCenters: query.pc !== "0",
    showCoverage: query.cv !== "0",
    mode: query.m === "explore" ? "explore" : "guided",
    step: Number.isFinite(rawStep) ? clamp(Math.round(rawStep), 0, 2) : 0,
  };
}

export function serializeRasterState(state: RasterState) {
  const parameters = new URLSearchParams();
  parameters.set(
    "v",
    state.vertices
      .map((point) => `${point.x.toFixed(3)},${point.y.toFixed(3)}`)
      .join(";"),
  );
  parameters.set("r", String(state.resolution));
  parameters.set("pc", state.showCenters ? "1" : "0");
  parameters.set("cv", state.showCoverage ? "1" : "0");
  parameters.set("m", state.mode);
  parameters.set("s", String(state.step));
  return parameters.toString();
}
