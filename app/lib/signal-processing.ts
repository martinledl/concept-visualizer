export type Complex = { re: number; im: number };

export type SignalSample = {
  index: number;
  time: number;
  analog: number;
  quantized: number;
};

export function sampleAndQuantize({
  frequency,
  sampleRate,
  bits,
  phase = 0,
  duration = 1,
}: {
  frequency: number;
  sampleRate: number;
  bits: number;
  phase?: number;
  duration?: number;
}) {
  const levels = 2 ** bits;
  const count = Math.max(1, Math.floor(sampleRate * duration));
  const step = 2 / (levels - 1);
  const samples: SignalSample[] = Array.from({ length: count }, (_, index) => {
    const time = index / sampleRate;
    const analog = Math.cos(2 * Math.PI * frequency * time + phase);
    const quantized = -1 + Math.round((analog + 1) / step) * step;
    return { index, time, analog, quantized };
  });
  const rmsError = Math.sqrt(
    samples.reduce((sum, sample) => sum + (sample.analog - sample.quantized) ** 2, 0) / samples.length,
  );
  return { samples, levels, step, rmsError };
}

export function aliasFrequency(frequency: number, sampleRate: number) {
  if (sampleRate <= 0) return 0;
  const wrapped = ((frequency + sampleRate / 2) % sampleRate + sampleRate) % sampleRate - sampleRate / 2;
  return Math.abs(wrapped);
}

export function discreteConvolution(input: number[], impulse: number[]) {
  if (input.length === 0 || impulse.length === 0) return [];
  return Array.from({ length: input.length + impulse.length - 1 }, (_, outputIndex) =>
    input.reduce((sum, value, inputIndex) => {
      const impulseIndex = outputIndex - inputIndex;
      return sum + (impulse[impulseIndex] ?? 0) * value;
    }, 0),
  );
}

export function convolutionFrame(input: number[], impulse: number[], outputIndex: number) {
  const products = input.map((value, inputIndex) => ({
    inputIndex,
    input: value,
    impulseIndex: outputIndex - inputIndex,
    impulse: impulse[outputIndex - inputIndex] ?? 0,
    product: value * (impulse[outputIndex - inputIndex] ?? 0),
  }));
  return { products, sum: products.reduce((total, item) => total + item.product, 0) };
}

export function movingAverage(input: number[], length: number) {
  const windowLength = Math.max(1, Math.floor(length));
  return input.map((_, index) => {
    let sum = 0;
    for (let offset = 0; offset < windowLength; offset += 1) sum += input[index - offset] ?? 0;
    return sum / windowLength;
  });
}

export function iirFilter(input: number[], alpha: number) {
  const output: number[] = [];
  input.forEach((value, index) => {
    output[index] = value - alpha * (output[index - 1] ?? 0);
  });
  return output;
}

export function sinusoidSamples({
  amplitude,
  cycles,
  phase,
  count,
}: {
  amplitude: number;
  cycles: number;
  phase: number;
  count: number;
}) {
  return Array.from({ length: count }, (_, index) =>
    amplitude * Math.cos(2 * Math.PI * cycles * index / count + phase),
  );
}

export function addComplex(first: Complex, second: Complex): Complex {
  return { re: first.re + second.re, im: first.im + second.im };
}

export function complexMagnitude(value: Complex) {
  return Math.hypot(value.re, value.im);
}

export function complexPhase(value: Complex) {
  return Math.atan2(value.im, value.re);
}

export function movingAverageResponse(omega: number, length: number): Complex {
  const windowLength = Math.max(1, Math.floor(length));
  let result: Complex = { re: 0, im: 0 };
  for (let index = 0; index < windowLength; index += 1) {
    result = addComplex(result, {
      re: Math.cos(-omega * index) / windowLength,
      im: Math.sin(-omega * index) / windowLength,
    });
  }
  return result;
}

export function preEmphasisResponse(omega: number, coefficient = 0.95): Complex {
  return {
    re: 1 - coefficient * Math.cos(omega),
    im: coefficient * Math.sin(omega),
  };
}

export function dftReal(signal: number[]) {
  const length = signal.length;
  return Array.from({ length }, (_, bin) => {
    const value = signal.reduce<Complex>((sum, sample, index) => {
      const angle = -2 * Math.PI * bin * index / length;
      return {
        re: sum.re + sample * Math.cos(angle),
        im: sum.im + sample * Math.sin(angle),
      };
    }, { re: 0, im: 0 });
    return {
      bin,
      re: value.re,
      im: value.im,
      magnitude: complexMagnitude(value) / length,
      phase: complexPhase(value),
    };
  });
}

export function hannWindow(length: number) {
  if (length <= 1) return Array.from({ length }, () => 1);
  return Array.from({ length }, (_, index) => 0.5 - 0.5 * Math.cos(2 * Math.PI * index / (length - 1)));
}

export function applyWindow(signal: number[], window: number[]) {
  return signal.map((sample, index) => sample * (window[index] ?? 0));
}
