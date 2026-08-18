import { describe, expect, it } from "vitest";
import {
  aliasFrequency,
  applyWindow,
  convolutionFrame,
  dftReal,
  discreteConvolution,
  hannWindow,
  iirFilter,
  movingAverage,
  movingAverageResponse,
  sampleAndQuantize,
  sinusoidSamples,
} from "../app/lib/signal-processing";

describe("signal-processing lesson models", () => {
  it("samples and quantizes a bounded sinusoid", () => {
    const report = sampleAndQuantize({ frequency: 1, sampleRate: 8, bits: 3 });
    expect(report.samples).toHaveLength(8);
    expect(report.levels).toBe(8);
    expect(report.samples.every((sample) => sample.quantized >= -1 && sample.quantized <= 1)).toBe(true);
    expect(report.rmsError).toBeGreaterThan(0);
  });

  it("folds frequencies into the Nyquist interval", () => {
    expect(aliasFrequency(3, 10)).toBe(3);
    expect(aliasFrequency(7, 10)).toBe(3);
    expect(aliasFrequency(13, 10)).toBe(3);
  });

  it("computes discrete convolution and one visible frame", () => {
    expect(discreteConvolution([1, 2, 3], [1, -1])).toEqual([1, 1, 1, -3]);
    const frame = convolutionFrame([1, 2, 3], [1, -1], 2);
    expect(frame.products.map((item) => item.product)).toEqual([0, -2, 3]);
    expect(frame.sum).toBe(1);
  });

  it("runs causal FIR and IIR filters", () => {
    expect(movingAverage([3, 3, 3], 3)).toEqual([1, 2, 3]);
    expect(iirFilter([1, 0, 0, 0], 0.5)).toEqual([1, -0.5, 0.25, -0.125]);
  });

  it("keeps a sinusoid amplitude and puts its DFT energy at the expected bins", () => {
    const signal = sinusoidSamples({ amplitude: 2, cycles: 3, phase: 0, count: 32 });
    expect(Math.max(...signal)).toBeCloseTo(2);
    const spectrum = dftReal(signal);
    expect(spectrum[3].magnitude).toBeCloseTo(1);
    expect(spectrum[29].magnitude).toBeCloseTo(1);
  });

  it("gives a moving-average filter unit gain at zero frequency", () => {
    expect(movingAverageResponse(0, 5)).toEqual({ re: 1, im: 0 });
  });

  it("creates and applies a Hann window", () => {
    const window = hannWindow(5);
    expect(window[0]).toBeCloseTo(0);
    expect(window[2]).toBeCloseTo(1);
    expect(applyWindow([1, 1, 1, 1, 1], window)).toEqual(window);
  });
});
