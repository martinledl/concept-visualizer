"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import type { VisualizationMeta } from "../../content/visualizations";
import {
  aliasFrequency,
  applyWindow,
  complexMagnitude,
  complexPhase,
  convolutionFrame,
  dftReal,
  discreteConvolution,
  hannWindow,
  iirFilter,
  movingAverage,
  movingAverageResponse,
  preEmphasisResponse,
  sampleAndQuantize,
  sinusoidSamples,
} from "../../lib/signal-processing";
import { SignalPlot, SpectrumBars } from "./SignalPlot";

type Step = { short: string; operation: string; title: string; description: string; note: string };
type Metric = { label: string; value: string };

const lessonCopy: Record<string, { steps: Step[]; glossary: Array<{ term: string; definition: string }> }> = {
  "digital-signals": {
    steps: [
      { short: "Sample", operation: "Time discretization", title: "Take measurements at fixed times", description: "The blue curve is continuous. Sampling keeps only its value at evenly spaced instants n/fs, producing a sequence x[n].", note: "Lower the sample rate until the dots stop tracing the curve clearly." },
      { short: "Quantize", operation: "Amplitude discretization", title: "Round each sample to a stored level", description: "A digital sample also has finite amplitude precision. Quantization chooses the closest of 2^b available levels.", note: "Try 2 bits, then 8 bits. Time locations stay fixed while amplitude error changes." },
      { short: "Measure", operation: "Error calculation", title: "Measure the representation error", description: "The difference between every sampled value and its quantized value is quantization error. RMS combines those errors into one useful number.", note: "Bit depth controls quantization error. Sample rate controls when the signal is measured." },
    ],
    glossary: [
      { term: "Sampling", definition: "Measuring a signal at discrete time instants." },
      { term: "Quantization", definition: "Rounding amplitude to one of a finite number of levels." },
      { term: "Bit depth", definition: "The number of bits used to encode one sample value." },
    ],
  },
  convolution: {
    steps: [
      { short: "Decompose", operation: "Weighted impulses", title: "Treat the input as shifted impulses", description: "Any discrete signal can be written as a sum of shifted impulses. Each input value x[k] scales one shifted copy of the system response.", note: "The impulse response h[n] completely describes a linear time-invariant system." },
      { short: "Align", operation: "Flip and shift", title: "Align h[n-k] with the input", description: "For output index n, flip the impulse response, shift it to n, and line it up with x[k]. Only overlapping nonzero samples contribute.", note: "Scrub n and watch the nonzero overlap travel across the input." },
      { short: "Sum", operation: "Multiply and add", title: "Add the overlap products", description: "Multiply each aligned pair and sum the products. That single number is y[n]. Repeat at every n to build the complete output.", note: "The highlighted output sample equals the product row shown above it." },
    ],
    glossary: [
      { term: "Impulse response", definition: "The output h[n] produced by a unit impulse at the input." },
      { term: "LTI", definition: "A system whose behavior is both linear and unchanged by time shifts." },
      { term: "Convolution", definition: "The weighted sum y[n] = sum_k x[k]h[n-k]." },
    ],
  },
  "fir-iir-filters": {
    steps: [
      { short: "Feed", operation: "Input memory", title: "Run the signal through stored input samples", description: "The moving-average FIR filter combines the current input with a finite number of earlier inputs. Its impulse response ends after M samples.", note: "Increase M to smooth more strongly, at the cost of a slower response." },
      { short: "Feed back", operation: "Output memory", title: "Let an earlier output affect the next one", description: "The IIR filter uses y[n-1] as well as x[n]. Feedback makes one impulse continue indefinitely in exact arithmetic.", note: "Switch to an impulse input to see the alternating geometric tail clearly." },
      { short: "Check", operation: "Stability test", title: "Check whether the response decays", description: "For y[n] = x[n] - αy[n-1], the impulse response decays only when |α| < 1. Otherwise the stored energy persists or grows.", note: "Push α beyond 1 and compare the last response sample with the first." },
    ],
    glossary: [
      { term: "FIR", definition: "A filter with an impulse response that becomes exactly zero after finite time." },
      { term: "IIR", definition: "A feedback filter whose impulse response can continue indefinitely." },
      { term: "Z-transform", definition: "A representation X(z) = sum_k x[k]z^-k used to analyze delays, poles, and stability." },
    ],
  },
  "sinusoid-anatomy": {
    steps: [
      { short: "Scale", operation: "Amplitude", title: "Set the distance from the center", description: "Amplitude a scales both the waveform height and the radius of the rotating complex number.", note: "Amplitude changes size, but not the rate or starting angle." },
      { short: "Rotate", operation: "Angular frequency", title: "Choose the rotation per sample", description: "Angular frequency ω says how many radians the phasor rotates between samples. Faster rotation produces more waveform cycles.", note: "One full turn is 2π radians. Frequency in cycles per sample is ω/(2π)." },
      { short: "Start", operation: "Phase offset", title: "Choose the starting angle", description: "Phase φ rotates the phasor before n starts. The waveform is its real coordinate, so phase moves the curve without changing its shape.", note: "Set φ near π/2. The cosine begins near zero because the phasor points upward." },
    ],
    glossary: [
      { term: "Angular frequency", definition: "Rotation per sample in radians, written ω." },
      { term: "Phase", definition: "The initial angular offset of a sinusoid." },
      { term: "Complex exponential", definition: "The rotating value ae^{j(ωn + φ)} whose real part is a cosine." },
    ],
  },
  "transfer-functions": {
    steps: [
      { short: "Probe", operation: "Sinusoidal input", title: "Probe the filter with one frequency", description: "A complex sinusoid passes through an LTI system without changing frequency. Only its amplitude and phase change.", note: "Sweep ω from 0 to π and watch the output remain sinusoidal." },
      { short: "Evaluate", operation: "Frequency response", title: "Evaluate H(ω)", description: "The transfer function is the Fourier transform of h[n]. Its magnitude scales the input and its angle adds a phase shift.", note: "Compare the low-pass moving average with the high-frequency boost of pre-emphasis." },
      { short: "Predict", operation: "Complex multiplication", title: "Predict the output before filtering", description: "At the chosen frequency, Y(ω) = H(ω)X(ω). Multiplication in frequency replaces convolution in time.", note: "The live output amplitude is input amplitude times |H(ω)|." },
    ],
    glossary: [
      { term: "Transfer function", definition: "The complex gain H(ω) applied to each frequency." },
      { term: "Magnitude response", definition: "How much a filter scales each frequency." },
      { term: "Phase response", definition: "How much a filter shifts each frequency in phase." },
    ],
  },
  "sampling-aliasing": {
    steps: [
      { short: "Sample", operation: "Impulse-train sampling", title: "Record the tone at a fixed rate", description: "The dots are the only values retained by the digital system. Many continuous curves can pass through the same dots.", note: "Raise the tone frequency while keeping the sample rate fixed." },
      { short: "Fold", operation: "Spectral replication", title: "Watch frequency copies overlap", description: "Sampling repeats the spectrum every fs. Frequencies above fs/2 fold into the base interval and become aliases.", note: "The lower orange curve passes through the same samples after the Nyquist limit is crossed." },
      { short: "Protect", operation: "Nyquist condition", title: "Keep the signal bandwidth below Nyquist", description: "Perfect reconstruction requires a band-limited signal and fs greater than twice its highest frequency B.", note: "A real sampler uses an anti-aliasing filter before conversion to remove frequencies it cannot represent." },
    ],
    glossary: [
      { term: "Nyquist frequency", definition: "Half the sample rate, fs/2." },
      { term: "Aliasing", definition: "Different continuous frequencies producing the same samples." },
      { term: "Anti-aliasing filter", definition: "A low-pass filter applied before sampling to limit bandwidth." },
    ],
  },
  "fourier-dft": {
    steps: [
      { short: "Compose", operation: "Add sinusoids", title: "Build a signal from two tones", description: "The time plot is a sum of two cosines. It may look complicated, even though only two frequency components created it.", note: "Move the tones together and apart to see how their interference changes the waveform." },
      { short: "Analyze", operation: "DFT", title: "Compare the signal with every DFT basis", description: "The DFT measures how strongly the finite signal matches each discrete complex sinusoid. Peaks reveal the matching frequency bins.", note: "An FFT computes the same DFT more efficiently. It does not define a different transform." },
      { short: "Window", operation: "Time-domain multiplication", title: "Control the edges of the observed segment", description: "A non-bin tone is cut mid-cycle, so its energy leaks across bins. A Hann window softens the edges but widens the main peak.", note: "Set a fractional tone, then toggle the window to compare leakage and peak width." },
    ],
    glossary: [
      { term: "DFT", definition: "A finite set of frequency measurements computed from N samples." },
      { term: "FFT", definition: "An efficient family of algorithms for computing the DFT." },
      { term: "Spectral leakage", definition: "Energy spreading across bins when the observed segment does not repeat smoothly." },
    ],
  },
};

function Range({ label, value, min, max, step = 1, unit = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void }) {
  return <label className="range-control"><span>{label}<strong>{Number.isInteger(value) ? value : value.toFixed(2)}{unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Choice({ options, value, onChange, label }: { options: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void; label: string }) {
  return <div className="signal-choice" role="group" aria-label={label}>{options.map((option) => <button key={option.value} type="button" className={value === option.value ? "is-active" : ""} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}

function DigitalSignalsLesson({ render }: { render: (data: LessonData) => ReactNode }) {
  const [frequency, setFrequency] = useState(3);
  const [sampleRate, setSampleRate] = useState(16);
  const [bits, setBits] = useState(3);
  const report = useMemo(() => sampleAndQuantize({ frequency, sampleRate, bits }), [bits, frequency, sampleRate]);
  const analog = Array.from({ length: 161 }, (_, index) => Math.cos(2 * Math.PI * frequency * index / 160));
  const scene = <div className="signal-scene"><div className="plot-legend"><span className="legend-primary">continuous x(t)</span><span className="legend-coral">quantized x[n]</span></div><SignalPlot label="Continuous sinusoid with quantized samples" series={[{ values: analog, label: "continuous waveform", tone: "primary" }, { values: report.samples.map((sample) => sample.quantized), label: "quantized samples", tone: "coral", stems: true }]} yMin={-1.15} yMax={1.15} /></div>;
  return render({ scene, controls: <><Range label="Signal frequency" value={frequency} min={1} max={7} unit=" Hz" onChange={setFrequency} /><Range label="Sample rate" value={sampleRate} min={8} max={32} unit=" Hz" onChange={setSampleRate} /><Range label="Bit depth" value={bits} min={2} max={8} unit=" bit" onChange={setBits} /></>, formula: <>x[n] = Q<sub>b</sub>{`{cos(2πfn / fs)}`}</>, metrics: [{ label: "Samples in one second", value: String(report.samples.length) }, { label: "Amplitude levels", value: String(report.levels) }, { label: "Quantization RMS error", value: report.rmsError.toFixed(4) }, { label: "Nyquist check", value: sampleRate > 2 * frequency ? "safe for this tone" : "undersampled" }] });
}

function ConvolutionLesson({ render }: { render: (data: LessonData) => ReactNode }) {
  const input = [0, 1, 2, 1, 0, -1, 0];
  const impulse = [0.5, 1, 0.5];
  const output = discreteConvolution(input, impulse);
  const [index, setIndex] = useState(4);
  const frame = convolutionFrame(input, impulse, index);
  const aligned = input.map((_, inputIndex) => impulse[index - inputIndex] ?? 0);
  const products = frame.products.map((item) => item.product);
  const scene = <div className="signal-scene convolution-scene"><div className="mini-plot-grid"><div><span>x[k]</span><SignalPlot label="Input samples" height={150} series={[{ values: input, label: "input", stems: true }]} yMin={-1.2} yMax={2.2} /></div><div><span>h[n-k] at n = {index}</span><SignalPlot label="Flipped and shifted impulse response" height={150} series={[{ values: aligned, label: "shifted impulse response", tone: "coral", stems: true }]} yMin={-1.2} yMax={2.2} /></div><div><span>products</span><SignalPlot label="Pairwise products" height={150} series={[{ values: products, label: "products", tone: "success", stems: true }]} yMin={-1.2} yMax={2.2} /></div><div><span>y[n]</span><SignalPlot label="Convolution output" height={150} highlightIndex={index} series={[{ values: output, label: "output", stems: true }]} yMin={-1.2} yMax={3.2} /></div></div></div>;
  return render({ scene, controls: <Range label="Output index n" value={index} min={0} max={output.length - 1} onChange={setIndex} />, formula: <>y[n] = x[n] * h[n] = ∑<sub>k</sub> x[k]h[n-k]</>, metrics: [{ label: "Active products", value: products.map((value) => value.toFixed(1)).join(" + ") }, { label: `Output y[${index}]`, value: frame.sum.toFixed(2) }, { label: "Output length", value: `${input.length} + ${impulse.length} - 1 = ${output.length}` }] });
}

function FiltersLesson({ render }: { render: (data: LessonData) => ReactNode }) {
  const [kind, setKind] = useState("fir");
  const [inputKind, setInputKind] = useState("noisy");
  const [memory, setMemory] = useState(4);
  const [alpha, setAlpha] = useState(0.8);
  const count = 36;
  const input = inputKind === "impulse" ? [1, ...Array.from({ length: count - 1 }, () => 0)] : Array.from({ length: count }, (_, index) => (index % 12 < 6 ? 0.75 : -0.75) + 0.22 * Math.sin(index * 2.4));
  const output = kind === "fir" ? movingAverage(input, memory) : iirFilter(input, alpha);
  const impulse = kind === "fir" ? movingAverage([1, ...Array.from({ length: count - 1 }, () => 0)], memory) : iirFilter([1, ...Array.from({ length: count - 1 }, () => 0)], alpha);
  const stable = kind === "fir" || Math.abs(alpha) < 1;
  const scene = <div className="signal-scene"><div className="plot-legend"><span className="legend-muted">input x[n]</span><span className="legend-primary">output y[n]</span></div><SignalPlot label="Filter input and output" series={[{ values: input, label: "input", tone: "muted", dashed: true }, { values: output, label: "output", tone: "primary" }]} /><div className="sub-plot"><span>Impulse response h[n]</span><SignalPlot label="Filter impulse response" height={150} series={[{ values: impulse, label: "impulse response", tone: stable ? "success" : "coral", stems: true }]} /></div></div>;
  return render({ scene, controls: <><Choice label="Filter type" value={kind} onChange={setKind} options={[{ value: "fir", label: "FIR moving average" }, { value: "iir", label: "IIR feedback" }]} /><Choice label="Input signal" value={inputKind} onChange={setInputKind} options={[{ value: "noisy", label: "Noisy square" }, { value: "impulse", label: "Impulse" }]} />{kind === "fir" ? <Range label="Window length M" value={memory} min={2} max={9} onChange={setMemory} /> : <Range label="Feedback α" value={alpha} min={0} max={1.2} step={0.05} onChange={setAlpha} />}</>, formula: kind === "fir" ? <>y[n] = (1/M) ∑<sup>M-1</sup><sub>i=0</sub> x[n-i]</> : <>y[n] = x[n] - αy[n-1]</>, metrics: [{ label: "Filter structure", value: kind === "fir" ? "feedforward only" : "one-sample feedback" }, { label: "Impulse response", value: kind === "fir" ? `ends after ${memory} samples` : "continues recursively" }, { label: "Stability", value: stable ? "stable" : "unstable: |α| >= 1" }, { label: "Last |h[n]|", value: Math.abs(impulse.at(-1) ?? 0).toExponential(2) }] });
}

function SinusoidLesson({ render }: { render: (data: LessonData) => ReactNode }) {
  const [amplitude, setAmplitude] = useState(1);
  const [cycles, setCycles] = useState(2);
  const [phase, setPhase] = useState(0);
  const count = 65;
  const values = sinusoidSamples({ amplitude, cycles, phase, count });
  const angle = phase;
  const px = Number((100 + 72 * amplitude / 1.5 * Math.cos(angle)).toFixed(3));
  const py = Number((100 - 72 * amplitude / 1.5 * Math.sin(angle)).toFixed(3));
  const scene = <div className="signal-scene sinusoid-scene"><div className="wave-panel"><SignalPlot label="Sinusoid waveform" series={[{ values, label: "cosine", tone: "primary" }]} yMin={-1.6} yMax={1.6} /></div><div className="phasor-panel"><span>complex plane at n = 0</span><svg viewBox="0 0 200 200" role="img" aria-label="Complex phasor"><circle cx="100" cy="100" r="72" className="phasor-circle" /><line x1="20" y1="100" x2="180" y2="100" className="signal-axis" /><line x1="100" y1="20" x2="100" y2="180" className="signal-axis" /><line x1="100" y1="100" x2={px} y2={py} className="phasor-vector" /><circle cx={px} cy={py} r="5" className="phasor-point" /><text x="178" y="94">Re</text><text x="106" y="25">Im</text></svg></div></div>;
  const omega = 2 * Math.PI * cycles / count;
  return render({ scene, controls: <><Range label="Amplitude a" value={amplitude} min={0.2} max={1.5} step={0.1} onChange={setAmplitude} /><Range label="Cycles in view" value={cycles} min={0.5} max={6} step={0.5} onChange={setCycles} /><Range label="Phase φ" value={phase} min={-3.14} max={3.14} step={0.05} unit=" rad" onChange={setPhase} /></>, formula: <>x[n] = a cos(ωn + φ) = Re{`{ae^(j(ωn + φ))}`}</>, metrics: [{ label: "Angular frequency ω", value: `${omega.toFixed(3)} rad/sample` }, { label: "Period", value: `${(count / cycles).toFixed(2)} samples` }, { label: "Initial complex value", value: `${(amplitude * Math.cos(phase)).toFixed(2)} + j${(amplitude * Math.sin(phase)).toFixed(2)}` }, { label: "Initial real sample", value: values[0].toFixed(3) }] });
}

function TransferLesson({ render }: { render: (data: LessonData) => ReactNode }) {
  const [kind, setKind] = useState("average");
  const [omega, setOmega] = useState(0.7);
  const response = kind === "average" ? movingAverageResponse(omega, 5) : preEmphasisResponse(omega);
  const magnitude = complexMagnitude(response);
  const phase = complexPhase(response);
  const input = Array.from({ length: 80 }, (_, index) => Math.cos(omega * index));
  const output = Array.from({ length: 80 }, (_, index) => magnitude * Math.cos(omega * index + phase));
  const responseCurve = Array.from({ length: 81 }, (_, index) => complexMagnitude(kind === "average" ? movingAverageResponse(Math.PI * index / 80, 5) : preEmphasisResponse(Math.PI * index / 80)));
  const selected = Math.round(omega / Math.PI * 80);
  const scene = <div className="signal-scene"><div className="transfer-grid"><div><span>Magnitude |H(ω)|</span><SignalPlot label="Magnitude frequency response" height={190} highlightIndex={selected} series={[{ values: responseCurve, label: "magnitude response", tone: "success" }, { values: responseCurve.map((value, index) => index === selected ? value : 0), label: "selected frequency", tone: "coral", stems: true }]} yMin={0} /></div><div><span>Input and predicted output</span><SignalPlot label="Input and filtered sinusoid" height={190} series={[{ values: input, label: "input", tone: "muted", dashed: true }, { values: output, label: "output", tone: "primary" }]} /></div></div></div>;
  return render({ scene, controls: <><Choice label="Filter" value={kind} onChange={setKind} options={[{ value: "average", label: "5-point average" }, { value: "pre", label: "Pre-emphasis" }]} /><Range label="Probe frequency ω" value={omega} min={0} max={3.14} step={0.02} unit=" rad" onChange={setOmega} /></>, formula: <>H(ω) = ∑<sub>k</sub> h[k]e<sup>-jωk</sup>, Y(ω) = H(ω)X(ω)</>, metrics: [{ label: "Magnitude |H|", value: magnitude.toFixed(3) }, { label: "Phase arg(H)", value: `${phase.toFixed(3)} rad` }, { label: "Output amplitude", value: magnitude.toFixed(3) }, { label: "Filter behavior here", value: magnitude < 0.9 ? "attenuates" : magnitude > 1.1 ? "amplifies" : "passes nearly unchanged" }] });
}

function SamplingLesson({ render }: { render: (data: LessonData) => ReactNode }) {
  const [frequency, setFrequency] = useState(7);
  const [sampleRate, setSampleRate] = useState(12);
  const alias = aliasFrequency(frequency, sampleRate);
  const safe = frequency < sampleRate / 2;
  const continuous = Array.from({ length: 241 }, (_, index) => Math.cos(2 * Math.PI * frequency * index / 240));
  const apparent = Array.from({ length: 241 }, (_, index) => Math.cos(2 * Math.PI * alias * index / 240));
  const samples = Array.from({ length: sampleRate + 1 }, (_, index) => Math.cos(2 * Math.PI * frequency * index / sampleRate));
  const spectral = Array.from({ length: 49 }, (_, index) => {
    const centered = index - 24;
    return [-frequency, frequency, sampleRate - frequency, -sampleRate + frequency].some((peak) => Math.abs(centered - peak) < 0.5) ? 1 : 0;
  });
  const scene = <div className="signal-scene"><div className="plot-legend"><span className="legend-primary">original tone</span><span className="legend-coral">apparent tone: {alias.toFixed(1)} Hz</span><span className="legend-muted">samples</span></div><SignalPlot label="Original and aliased waves passing through the same samples" series={[{ values: continuous, label: "original", tone: "primary" }, { values: apparent, label: "apparent alias", tone: "coral", dashed: true }, { values: samples, label: "samples", tone: "muted", stems: true }]} yMin={-1.2} yMax={1.2} /><div className="sub-plot"><span>Spectral copies around multiples of fs</span><SpectrumBars label="Repeated spectra caused by sampling" height={135} values={spectral} /></div></div>;
  return render({ scene, controls: <><Range label="Tone frequency f" value={frequency} min={1} max={15} step={0.5} unit=" Hz" onChange={setFrequency} /><Range label="Sample rate fs" value={sampleRate} min={6} max={24} unit=" Hz" onChange={setSampleRate} /></>, formula: <>f<sub>s</sub> &gt; 2B, &nbsp; f<sub>alias</sub> = |f - kf<sub>s</sub>| in [0, f<sub>s</sub>/2]</>, metrics: [{ label: "Nyquist frequency", value: `${(sampleRate / 2).toFixed(1)} Hz` }, { label: "Condition", value: safe ? "f is below Nyquist" : "f crosses Nyquist" }, { label: "Apparent frequency", value: `${alias.toFixed(1)} Hz` }, { label: "Samples per cycle", value: (sampleRate / frequency).toFixed(2) }] });
}

function FourierLesson({ render }: { render: (data: LessonData) => ReactNode }) {
  const [first, setFirst] = useState(3);
  const [second, setSecond] = useState(7.5);
  const [windowed, setWindowed] = useState(true);
  const count = 64;
  const raw = Array.from({ length: count }, (_, index) => Math.cos(2 * Math.PI * first * index / count) + 0.6 * Math.cos(2 * Math.PI * second * index / count + 0.7));
  const input = windowed ? applyWindow(raw, hannWindow(count)) : raw;
  const spectrum = dftReal(input).slice(0, count / 2 + 1);
  const peak = spectrum.reduce((best, item) => item.magnitude > best.magnitude ? item : best, spectrum[0]);
  const scene = <div className="signal-scene"><div className="fourier-grid"><div><span>Finite signal x[n]</span><SignalPlot label="Signal made from two tones" height={190} series={[{ values: input, label: "time signal", tone: "primary" }]} /></div><div><span>Magnitude |X[m]|</span><SpectrumBars label="Discrete Fourier transform magnitude" height={190} values={spectrum.map((item) => item.magnitude)} highlightIndex={peak.bin} /></div></div></div>;
  return render({ scene, controls: <><Range label="Tone 1 bin" value={first} min={1} max={12} step={0.5} onChange={setFirst} /><Range label="Tone 2 bin" value={second} min={2} max={15} step={0.5} onChange={setSecond} /><button className="toggle-row" type="button" role="switch" aria-checked={windowed} onClick={() => setWindowed((current) => !current)}><span>Apply Hann window</span><span className="switch-track" aria-hidden="true"><span /></span></button></>, formula: <>X[m] = ∑<sup>N-1</sup><sub>k=0</sub> x[k]e<sup>-j2πmk/N</sup></>, metrics: [{ label: "Sample count N", value: String(count) }, { label: "Strongest DFT bin", value: String(peak.bin) }, { label: "Peak magnitude", value: peak.magnitude.toFixed(3) }, { label: "Window", value: windowed ? "Hann: softer edges" : "rectangular: abrupt edges" }] });
}

type LessonData = { scene: ReactNode; controls: ReactNode; formula: ReactNode; metrics: Metric[] };

function SignalLessonShell({ meta, data, onReset }: { meta: VisualizationMeta; data: LessonData; onReset: () => void }) {
  const lesson = lessonCopy[meta.slug];
  const [step, setStep] = useState(0);
  const active = lesson.steps[step];
  return <main className="lesson-shell signal-lesson-shell">
    <aside className="lesson-outline" aria-label="Lesson outline"><div className="outline-heading"><span className="lesson-index">{meta.number}</span><div><p>{meta.topic}</p><h1>{meta.shortTitle}</h1></div></div><ol className="step-list">{lesson.steps.map((item, index) => <li key={item.short} className={step === index ? "is-active" : ""}><button type="button" onClick={() => setStep(index)}><span>{index + 1}</span><span><strong>{item.short}</strong><small>{item.operation}</small></span></button></li>)}</ol><div className="lesson-mobile-note">Change a value and connect the plot to the equation.</div></aside>
    <section className="visualization-workspace" aria-label="Interactive signal visualization"><div className="workspace-heading"><div><p className="eyebrow">{meta.field} · {meta.topic}</p><h2>{active.title}</h2></div><div className="workspace-actions"><button className="secondary-button compact-button" type="button" onClick={onReset}><RotateCcw size={16} aria-hidden="true" /> Reset</button></div></div><div className="signal-formula" aria-label="Active equation">{data.formula}</div><div className="canvas-frame signal-canvas"><div className="canvas-label-row"><span>Working example</span><span>{meta.interaction}</span></div>{data.scene}</div><div className="signal-controls">{data.controls}</div><div className="step-navigation"><button className="secondary-button" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} aria-hidden="true" /> Previous</button><span>Step {step + 1} of {lesson.steps.length}</span><button className="primary-button" type="button" disabled={step === lesson.steps.length - 1} onClick={() => setStep((current) => current + 1)}>Next <ArrowRight size={16} aria-hidden="true" /></button></div></section>
    <aside className="lesson-inspector"><section className="inspector-section step-explanation"><span className="step-kicker">What happens</span><h2>{active.title}</h2><p>{active.description}</p><div className="concept-note"><span>Try this</span><p>{active.note}</p></div></section><section className="inspector-section live-values-section"><p className="inspector-label">Live values</p><dl>{data.metrics.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section><section className="inspector-section glossary-section"><p className="inspector-label">Key terms</p><dl>{lesson.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></section></aside>
  </main>;
}

export function SignalProcessingExplorer({ meta }: { meta: VisualizationMeta }) {
  const [revision, setRevision] = useState(0);
  const render = (data: LessonData) => <SignalLessonShell meta={meta} data={data} onReset={() => setRevision((current) => current + 1)} />;
  if (meta.slug === "digital-signals") return <DigitalSignalsLesson key={revision} render={render} />;
  if (meta.slug === "convolution") return <ConvolutionLesson key={revision} render={render} />;
  if (meta.slug === "fir-iir-filters") return <FiltersLesson key={revision} render={render} />;
  if (meta.slug === "sinusoid-anatomy") return <SinusoidLesson key={revision} render={render} />;
  if (meta.slug === "transfer-functions") return <TransferLesson key={revision} render={render} />;
  if (meta.slug === "sampling-aliasing") return <SamplingLesson key={revision} render={render} />;
  return <FourierLesson key={revision} render={render} />;
}
