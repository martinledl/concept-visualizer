import { clipPolygon, type Vec2 } from "./graphics-pipeline";

export type LessonMetric = { label: string; value: string };

export type FoundationReadout = {
  input: string;
  result: string;
  metrics: LessonMetric[];
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function polygonArea(points: Vec2[]) {
  if (points.length < 3) return 0;
  return Math.abs(
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0) / 2,
  );
}

export function clippingReport(position: number) {
  const offset = (clamp(position, -70, 70) / 70) * 1.35;
  const original = [
    { x: -0.95 + offset, y: 0.72 },
    { x: 0.75 + offset, y: 0.18 },
    { x: -0.58 + offset, y: -0.88 },
  ];
  const clipped = clipPolygon(original);
  const insideVertices = original.filter(
    (point) => Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1,
  ).length;
  const visiblePercent = Math.round(
    (polygonArea(clipped) / polygonArea(original)) * 100,
  );

  return {
    original,
    clipped,
    outsideVertices: original.length - insideVertices,
    boundaryVertices: Math.max(0, clipped.length - insideVertices),
    visiblePercent: Number.isFinite(visiblePercent) ? visiblePercent : 0,
  };
}

export function ndcPercentToPixel(value: number, width: number) {
  const normalized = clamp(value, -100, 100);
  return Math.round(((normalized + 100) / 200) * width);
}

export function windingReport(rotation: number, reversed: boolean) {
  const projectedArea = Math.cos((clamp(rotation, -80, 80) * Math.PI) / 180);
  const signedArea = reversed ? -projectedArea : projectedArea;
  const edgeOn = Math.abs(projectedArea) < 0.2;
  return {
    order: reversed ? "1, 3, 2" : "1, 2, 3",
    signedArea,
    orientation: signedArea < 0 ? "clockwise" : "counter-clockwise",
    decision: edgeOn ? "nearly edge-on" : signedArea < 0 ? "culled" : "drawn",
  };
}

export function depthTestReport(blueDepth: number, enabled: boolean) {
  const blue = clamp(blueDepth, 0, 100) / 100;
  const coral = 0.5;
  const winner = enabled ? (blue < coral ? "blue" : "coral") : "blue";
  return { blue, coral, winner, reason: enabled ? "smallest depth passes" : "blue was drawn last" };
}

export function depthsCollide(separation: number, highPrecision: boolean) {
  return separation < (highPrecision ? 4 : 24);
}

export function quantizedDepthReport(separation: number, highPrecision: boolean) {
  const resolution = highPrecision ? 4 : 24;
  const first = Math.round(25_000 / resolution);
  const second = Math.round((25_000 + Math.max(0, separation)) / resolution);
  return { first, second, resolution, collide: first === second };
}

export function imageBufferBytes(width: number, height: number, bitsPerPixel: number) {
  return Math.ceil((Math.max(0, width) * Math.max(0, height) * Math.max(0, bitsPerPixel)) / 8);
}

export function imageBufferReport(bitsPerPixel: number, palette: boolean) {
  const bits = clamp(Math.round(bitsPerPixel), 1, 24);
  return {
    pixels: 48,
    bytes: imageBufferBytes(8, 6, bits),
    encodings: 2 ** bits,
    interpretation: palette ? "palette indices" : "direct values",
  };
}

export function displayInterval(renderTime: number, refreshInterval = 16.7) {
  return Math.ceil(Math.max(0, renderTime) / refreshInterval) * refreshInterval;
}

export function frameTimingReport(renderTime: number, doubleBuffered: boolean) {
  const interval = displayInterval(renderTime);
  const repeats = Math.max(0, Math.round(interval / 16.7) - 1);
  return {
    interval,
    fps: interval === 0 ? 0 : 1000 / interval,
    repeats,
    result: doubleBuffered
      ? repeats > 0
        ? "complete frame, one refresh repeated"
        : "complete frame each refresh"
      : renderTime < 16.7
        ? "buffer can change during scanout"
        : "scanout can catch an unfinished frame",
  };
}

const objFaces = [
  [1, 2, 3],
  [1, 3, 4],
  [1, 4, 2],
  [2, 4, 3],
];

export function objFaceReport(face: number) {
  const index = clamp(Math.round(face), 1, objFaces.length) - 1;
  const vertices = objFaces[index];
  return { face: index + 1, vertices, record: `f ${vertices.join(" ")}` };
}

export function getFoundationReadout(
  slug: string,
  value: number,
  enabled: boolean,
): FoundationReadout {
  if (slug === "clipping") {
    const report = clippingReport(value);
    return {
      input: `Triangle at x ${value}%`,
      result: `${report.visiblePercent}% of its area remains`,
      metrics: [
        { label: "Outside vertices", value: `${report.outsideVertices} of 3` },
        { label: "New boundary vertices", value: `${report.boundaryVertices}` },
        { label: "Output polygon", value: `${report.clipped.length} vertices` },
      ],
    };
  }

  if (slug === "viewport-transform") {
    const width = enabled ? 1920 : 800;
    const pixel = ndcPercentToPixel(value, width);
    return {
      input: `NDC x ${(value / 100).toFixed(2)}`,
      result: `Pixel column ${pixel}`,
      metrics: [
        { label: "Normalized range", value: "-1 to +1" },
        { label: "Viewport", value: enabled ? "1920 x 1080" : "800 x 800" },
        { label: "Calculation", value: `(${(value / 100).toFixed(2)} + 1) / 2 x ${width}` },
      ],
    };
  }

  if (slug === "back-face-culling") {
    const report = windingReport(value, enabled);
    return {
      input: `Face indices ${report.order}`,
      result: `Face is ${report.decision}`,
      metrics: [
        { label: "Screen winding", value: report.orientation },
        { label: "Signed area", value: report.signedArea.toFixed(2) },
        { label: "Cull rule", value: "clockwise faces" },
      ],
    };
  }

  if (slug === "depth-testing") {
    const report = depthTestReport(value, enabled);
    return {
      input: `Coral z 0.50, blue z ${report.blue.toFixed(2)}`,
      result: `${report.winner} is visible`,
      metrics: [
        { label: "Coral depth", value: report.coral.toFixed(2) },
        { label: "Blue depth", value: report.blue.toFixed(2) },
        { label: "Why", value: report.reason },
      ],
    };
  }

  if (slug === "z-fighting") {
    const report = quantizedDepthReport(value, enabled);
    return {
      input: `Two surfaces ${value} micro-units apart`,
      result: report.collide ? "Both store the same depth" : "The depths stay distinct",
      metrics: [
        { label: "Storage step", value: `${report.resolution} micro-units` },
        { label: "Surface A", value: `bucket ${report.first}` },
        { label: "Surface B", value: `bucket ${report.second}` },
      ],
    };
  }

  if (slug === "image-buffers") {
    const report = imageBufferReport(value, enabled);
    return {
      input: `8 x 6 pixels at ${value} bpp`,
      result: `${report.bytes} bytes minimum`,
      metrics: [
        { label: "Stored pixels", value: `${report.pixels}` },
        { label: "Possible values", value: report.encodings.toLocaleString("en-US") },
        { label: "Interpretation", value: report.interpretation },
      ],
    };
  }

  if (slug === "frame-timing") {
    const report = frameTimingReport(value, enabled);
    return {
      input: `${value} ms render, 16.7 ms refresh`,
      result: report.result,
      metrics: [
        { label: "Display interval", value: `${report.interval.toFixed(1)} ms` },
        { label: "Delivered rate", value: `${report.fps.toFixed(1)} fps` },
        { label: "Repeated refreshes", value: `${report.repeats}` },
      ],
    };
  }

  const report = objFaceReport(value);
  return {
    input: `OBJ record ${report.record}`,
    result: `Face ${report.face} connects three positions`,
    metrics: [
      { label: "Face record", value: report.record },
      { label: "Referenced vertices", value: report.vertices.join(", ") },
      { label: "Index base", value: "1, not 0" },
    ],
  };
}
