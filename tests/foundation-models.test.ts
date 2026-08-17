import { describe, expect, it } from "vitest";
import { depthsCollide, displayInterval, imageBufferBytes, ndcPercentToPixel } from "../app/lib/foundation-models";

describe("foundation lesson models", () => {
  it("maps the normalized range into viewport pixels", () => {
    expect(ndcPercentToPixel(-100, 1920)).toBe(0);
    expect(ndcPercentToPixel(0, 1920)).toBe(960);
    expect(ndcPercentToPixel(100, 1920)).toBe(1920);
  });

  it("calculates minimum image-buffer storage", () => {
    expect(imageBufferBytes(8, 6, 24)).toBe(144);
    expect(imageBufferBytes(1, 1, 1)).toBe(1);
  });

  it("aligns completed frames to refresh intervals", () => {
    expect(displayInterval(16)).toBeCloseTo(16.7);
    expect(displayInterval(17)).toBeCloseTo(33.4);
  });

  it("models the smaller collision threshold of a precise depth buffer", () => {
    expect(depthsCollide(10, false)).toBe(true);
    expect(depthsCollide(10, true)).toBe(false);
  });
});
