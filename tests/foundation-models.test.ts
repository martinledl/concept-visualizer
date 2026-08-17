import { describe, expect, it } from "vitest";
import {
  clippingReport,
  depthTestReport,
  depthsCollide,
  displayInterval,
  frameTimingReport,
  getFoundationReadout,
  imageBufferBytes,
  imageBufferReport,
  ndcPercentToPixel,
  objFaceReport,
  quantizedDepthReport,
  windingReport,
} from "../app/lib/foundation-models";

describe("foundation lesson models", () => {
  it("clips a moved triangle into a new visible polygon", () => {
    const inside = clippingReport(0);
    const crossing = clippingReport(70);
    expect(inside.visiblePercent).toBe(100);
    expect(crossing.outsideVertices).toBe(1);
    expect(crossing.boundaryVertices).toBe(2);
    expect(crossing.visiblePercent).toBeLessThan(100);
  });

  it("maps the normalized range into viewport pixels", () => {
    expect(ndcPercentToPixel(-100, 1920)).toBe(0);
    expect(ndcPercentToPixel(0, 1920)).toBe(960);
    expect(ndcPercentToPixel(100, 1920)).toBe(1920);
  });

  it("reverses winding and the culling decision", () => {
    expect(windingReport(20, false).decision).toBe("drawn");
    expect(windingReport(20, true).decision).toBe("culled");
    expect(windingReport(20, true).signedArea).toBeLessThan(0);
  });

  it("uses depth when enabled and draw order when disabled", () => {
    expect(depthTestReport(75, true).winner).toBe("coral");
    expect(depthTestReport(75, false).winner).toBe("blue");
  });

  it("models the smaller collision threshold of a precise depth buffer", () => {
    expect(depthsCollide(10, false)).toBe(true);
    expect(depthsCollide(10, true)).toBe(false);
    expect(quantizedDepthReport(8, false).collide).toBe(true);
    expect(quantizedDepthReport(10, true).collide).toBe(false);
  });

  it("calculates buffer storage and encoding capacity", () => {
    expect(imageBufferBytes(8, 6, 24)).toBe(144);
    expect(imageBufferBytes(1, 1, 1)).toBe(1);
    expect(imageBufferReport(8, true)).toMatchObject({ bytes: 48, encodings: 256 });
  });

  it("aligns completed frames to refresh intervals", () => {
    expect(displayInterval(16)).toBeCloseTo(16.7);
    expect(displayInterval(17)).toBeCloseTo(33.4);
    expect(frameTimingReport(17, true)).toMatchObject({ repeats: 1 });
  });

  it("resolves OBJ face indices", () => {
    expect(objFaceReport(2)).toEqual({ face: 2, vertices: [1, 3, 4], record: "f 1 3 4" });
  });

  it("provides a concrete readout for every shared lesson", () => {
    const slugs = ["clipping", "viewport-transform", "back-face-culling", "depth-testing", "z-fighting", "image-buffers", "frame-timing", "obj-mesh"];
    for (const slug of slugs) {
      const readout = getFoundationReadout(slug, 10, true);
      expect(readout.input.length).toBeGreaterThan(5);
      expect(readout.result.length).toBeGreaterThan(5);
      expect(readout.metrics).toHaveLength(3);
    }
  });
});
