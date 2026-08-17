import { describe, expect, it } from "vitest";
import { buildPipelineScene, clipPolygon, ndcToViewport, projectPoint, rasterize } from "../app/lib/graphics-pipeline";

describe("graphics pipeline model", () => {
  it("makes equal geometry smaller as depth increases", () => {
    expect(projectPoint({ x: 1, y: 0, z: 2 }).x).toBeGreaterThan(projectPoint({ x: 1, y: 0, z: 4 }).x);
  });

  it("maps normalized corners into viewport pixels", () => {
    expect(ndcToViewport({ x: -1, y: 1 }, 640, 360)).toEqual({ x: 0, y: 0 });
    expect(ndcToViewport({ x: 1, y: -1 }, 640, 360)).toEqual({ x: 640, y: 360 });
  });

  it("clips a polygon to the canonical view", () => {
    const clipped = clipPolygon([{ x: -2, y: 0 }, { x: 0, y: 0.8 }, { x: 0, y: -0.8 }]);
    expect(clipped.length).toBe(4);
    expect(clipped.every((point) => point.x >= -1 && point.x <= 1)).toBe(true);
  });

  it("culls the explicit back face and produces fragments for visible geometry", () => {
    const scene = buildPipelineScene({ cameraX: 0, sceneRotation: 0, selection: "both" });
    expect(scene.find((item) => item.id === "back-face")?.clipped).toHaveLength(0);
    expect(rasterize(scene).length).toBeGreaterThan(0);
  });
});
