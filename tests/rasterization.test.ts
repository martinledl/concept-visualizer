import { describe, expect, it } from "vitest";
import {
  coveredCells,
  defaultRasterState,
  parseRasterState,
  pointInTriangle,
  serializeRasterState,
  triangleArea,
} from "../app/lib/rasterization";

const rightTriangle = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
] as const;

describe("rasterization model", () => {
  it("classifies interior, edge, and exterior sample locations", () => {
    expect(pointInTriangle({ x: 0.2, y: 0.2 }, [...rightTriangle])).toBe(true);
    expect(pointInTriangle({ x: 0.5, y: 0.5 }, [...rightTriangle])).toBe(true);
    expect(pointInTriangle({ x: 0.8, y: 0.8 }, [...rightTriangle])).toBe(false);
  });

  it("computes triangle area independently of winding", () => {
    expect(triangleArea([...rightTriangle])).toBeCloseTo(0.5);
    expect(
      triangleArea([rightTriangle[0], rightTriangle[2], rightTriangle[1]]),
    ).toBeCloseTo(0.5);
  });

  it("samples a grid at pixel centers", () => {
    const cells = coveredCells([...rightTriangle], 2, 2);
    expect(cells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 0, row: 1 },
    ]);
  });

  it("round-trips a shareable visualization state", () => {
    const query = Object.fromEntries(
      new URLSearchParams(serializeRasterState(defaultRasterState)),
    );
    expect(parseRasterState(query)).toEqual(defaultRasterState);
  });

  it("clamps invalid URL values and rejects malformed vertices", () => {
    const parsed = parseRasterState({
      v: "9,9;bad,0;0,0",
      r: "100",
      s: "9",
      pc: "0",
      cv: "0",
      m: "explore",
    });
    expect(parsed.vertices).toEqual(defaultRasterState.vertices);
    expect(parsed.resolution).toBe(18);
    expect(parsed.step).toBe(2);
    expect(parsed.showCenters).toBe(false);
    expect(parsed.showCoverage).toBe(false);
    expect(parsed.mode).toBe("explore");
  });
});
