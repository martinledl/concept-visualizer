"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { FoundationLesson } from "../content/foundation-lessons";
import type { VisualizationMeta } from "../content/visualizations";
import { depthsCollide, displayInterval, imageBufferBytes, ndcPercentToPixel } from "../lib/foundation-models";

function LessonVisual({ slug, value, enabled }: { slug: string; value: number; enabled: boolean }) {
  const p = (value + 100) / 2;
  if (slug === "graphics-pipeline") {
    const labels = ["Model", "World", "Eye", "Clip", "NDC", "Image"];
    return <div className="pipeline-lab">{labels.map((label, index) => <div key={label} className={index <= value ? "lab-stage is-active" : "lab-stage"}><span>{index + 1}</span><strong>{label}</strong>{enabled && <small>{index < 3 ? `${index * 2 - 2}, ${index - 1}` : index < 5 ? "−1…+1" : "px"}</small>}</div>)}</div>;
  }
  if (slug === "clipping") return <div className="clip-lab"><div className="clip-window" /><div className="clip-triangle" style={{ transform: `translateX(${value}px)` }} /><div className="clip-mask left" /><div className="clip-mask right" />{enabled && <span className="discard-label">discarded</span>}</div>;
  if (slug === "viewport-transform") {
    const x = ndcPercentToPixel(value, enabled ? 1920 : 800);
    return (
      <div className={enabled ? "viewport-lab is-wide" : "viewport-lab"}>
        <div className="ndc-panel">
          <span>NDC</span>
          <i style={{ left: `${p}%` }} />
        </div>
        <ArrowRight aria-hidden="true" />
        <div className="pixel-panel">
          <span>{enabled ? "1920 × 1080" : "800 × 800"}</span>
          <i style={{ left: `${p}%` }} />
          <strong>{`x = ${x}px`}</strong>
        </div>
      </div>
    );
  }
  if (slug === "back-face-culling") return <div className="culling-lab"><div className={enabled ? "winding-arrow is-reversed" : "winding-arrow"}><RotateCcw size={44} aria-hidden="true" /></div><div className="cull-triangle" style={{ transform: `perspective(500px) rotateY(${value}deg)` }}><span>1</span><span>2</span><span>3</span></div><strong>{Math.abs(value) > 72 ? "edge-on" : enabled ? "clockwise · culled" : "counter-clockwise · visible"}</strong></div>;
  if (slug === "depth-testing") {
    const blueFront = value < 50;
    return <div className="depth-lab"><div className="depth-shape depth-coral" /><div className="depth-shape depth-blue" style={{ opacity: enabled && !blueFront ? .35 : 1 }} /><div className="depth-result"><span>{enabled ? (blueFront ? "nearest: blue" : "nearest: coral") : "last drawn wins"}</span></div></div>;
  }
  if (slug === "z-fighting") {
    const fighting = depthsCollide(value, enabled);
    return <div className="zfighting-lab"><div className="z-plane z-plane-a" /><div className={fighting ? "z-plane z-plane-b is-fighting" : "z-plane z-plane-b"} style={{ transform: `translate(${20 + value / 3}px, ${8 - value / 12}px) skewX(-28deg)` }} /><strong>{fighting ? "same stored depth · unstable winner" : "separate depth levels · stable"}</strong></div>;
  }
  if (slug === "image-buffers") {
    const bytes = imageBufferBytes(8, 6, value);
    return <div className="buffer-lab"><div className="buffer-grid">{Array.from({ length: 48 }, (_, i) => <span key={i} style={{ background: enabled ? ["#315be8", "#ed6a4a", "#247a59", "#e2b93b"][i % 4] : `rgb(${40 + i * 4} ${40 + i * 4} ${40 + i * 4})` }} />)}</div><div className="memory-stack"><strong>{bytes} bytes</strong><span>8 × 6 × {value} bpp ÷ 8</span><small>{enabled ? "indices → color table" : "values → intensities"}</small></div></div>;
  }
  if (slug === "frame-timing") {
    const frames = Math.max(1, Math.floor(50 / value));
    return <div className="timing-lab"><div className="screen-scan"><div className={!enabled && value < 17 ? "tear-line is-visible" : "tear-line"} /><span>scanout · 16.7 ms</span></div><div className="timing-track">{Array.from({ length: frames + 1 }, (_, i) => <i key={i} style={{ width: `${Math.min(80, value * 3)}px` }} />)}</div><strong>{enabled ? `${displayInterval(value).toFixed(1)} ms display interval` : value < 17 ? "buffer changes during scanout" : "one frame per scanout"}</strong></div>;
  }
  const faces = [["1", "2", "3"], ["1", "3", "4"], ["1", "4", "2"], ["2", "4", "3"]];
  return <div className="obj-lab"><pre>{["v  0.0  0.9  0.0", "v -0.8 -0.6  0.6", "v  0.8 -0.6  0.6", "v  0.0 -0.4 -0.8", ...faces.map((f, i) => `${i + 1 === value ? ">" : " "} f  ${f.join("  ")}`)].join("\n")}</pre><div className="mesh-mini"><i className="mesh-face" />{enabled && <><span className="mesh-v1">1</span><span className="mesh-v2">2</span><span className="mesh-v3">3</span><span className="mesh-v4">4</span></>}</div></div>;
}

export function FoundationExplorer({ meta, lesson }: { meta: VisualizationMeta; lesson: FoundationLesson }) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState(lesson.valueDefault);
  const [enabled, setEnabled] = useState(lesson.toggleDefault);
  const active = lesson.steps[step];
  const reset = () => { setStep(0); setValue(lesson.valueDefault); setEnabled(lesson.toggleDefault); };

  return <main className="lesson-shell foundation-shell">
    <aside className="lesson-outline">
      <div className="outline-heading"><span className="lesson-index">{meta.number}</span><div><p>{meta.topic}</p><h1>{meta.shortTitle}</h1></div></div>
      <ol className="step-list">{lesson.steps.map((item, index) => <li key={item.short} className={step === index ? "is-active" : ""}><button type="button" onClick={() => setStep(index)}><span>{index + 1}</span><span><strong>{item.short}</strong><small>{item.title}</small></span></button></li>)}</ol>
      <div className="lesson-mobile-note">Designed for touch, keyboard, and desktop input.</div>
    </aside>
    <section className="visualization-workspace">
      <div className="workspace-heading"><div><p className="eyebrow">{meta.field} · {meta.topic}</p><h2>{active.title}</h2></div><div className="workspace-actions"><button className="secondary-button compact-button" type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Reset</button></div></div>
      <div className="canvas-frame concept-canvas"><div className="canvas-label-row"><span>Interactive model</span><span>{meta.interaction}</span></div><div className="concept-visual" role="img" aria-label={`${meta.title}: ${active.description}`}><LessonVisual slug={meta.slug} value={value} enabled={enabled} /></div></div>
      <div className="control-bar concept-control-bar"><label className="range-control"><span>{lesson.valueLabel}<strong>{value}{lesson.valueUnit}</strong></span><input type="range" min={lesson.valueMin} max={lesson.valueMax} value={value} onChange={(event) => setValue(Number(event.target.value))} /></label><button className="toggle-row" type="button" role="switch" aria-checked={enabled} onClick={() => setEnabled((current) => !current)}><span>{lesson.toggleLabel}</span><span className="switch-track" aria-hidden="true"><span /></span></button></div>
      <div className="step-navigation"><button className="secondary-button" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} aria-hidden="true" /> Previous</button><span>Step {step + 1} of {lesson.steps.length}</span><button className="primary-button" type="button" disabled={step === lesson.steps.length - 1} onClick={() => setStep((current) => current + 1)}>Next <ArrowRight size={16} aria-hidden="true" /></button></div>
    </section>
    <aside className="lesson-inspector"><section className="inspector-section step-explanation"><span className="step-kicker">What to notice</span><h2>{active.title}</h2><p>{active.description}</p><div className="concept-note"><span>Keep in mind</span><p>{active.note}</p></div></section><section className="inspector-section glossary-section"><p className="inspector-label">Key terms</p><dl>{lesson.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></section></aside>
  </main>;
}
