"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import type { FoundationLesson } from "../content/foundation-lessons";
import type { VisualizationMeta } from "../content/visualizations";
import {
  clippingReport,
  depthTestReport,
  frameTimingReport,
  getFoundationReadout,
  imageBufferReport,
  ndcPercentToPixel,
  objFaceReport,
  quantizedDepthReport,
  windingReport,
} from "../lib/foundation-models";

function LessonVisual({ slug, stage, value, enabled }: { slug: string; stage: number; value: number; enabled: boolean }) {
  if (slug === "clipping") {
    const report = clippingReport(value);
    return <div className={`clip-lab stage-${stage}`}><div className="clip-window"><span>visible region</span></div><div className="clip-triangle" style={{ transform: `translateX(${value}px)` }}><span>input triangle</span></div><div className="clip-mask left" /><div className="clip-mask right" />{stage > 0 && report.boundaryVertices > 0 && <><i className="clip-crossing clip-crossing-a" /><i className="clip-crossing clip-crossing-b" /></>}{enabled && <span className="discard-label">outside is discarded</span>}<strong className="scene-result">{report.clipped.length === 0 ? "no output" : `${report.clipped.length}-vertex output`}</strong></div>;
  }

  if (slug === "viewport-transform") {
    const percent = (value + 100) / 2;
    const width = enabled ? 1920 : 800;
    const x = ndcPercentToPixel(value, width);
    return <div className={`viewport-lab stage-${stage} ${enabled ? "is-wide" : ""}`}><div className="ndc-panel"><span>NDC: {(value / 100).toFixed(2)}</span><i style={{ left: `${percent}%` }} /></div><div className="transform-arrow" aria-hidden="true"><ArrowRight /><small>scale + shift</small></div><div className="pixel-panel"><span>{enabled ? "1920 x 1080" : "800 x 800"}</span><i style={{ left: `${percent}%` }} /><strong>{`x = ${x} px`}</strong></div></div>;
  }

  if (slug === "back-face-culling") {
    const report = windingReport(value, enabled);
    return <div className={`culling-lab stage-${stage}`}><div className={enabled ? "winding-arrow is-reversed" : "winding-arrow"}><RotateCcw size={44} aria-hidden="true" /><small>{report.order}</small></div><div className={`cull-triangle ${report.decision === "culled" ? "is-culled" : ""}`} style={{ transform: `perspective(500px) rotateY(${value}deg)` }}><span>1</span><span>{enabled ? "3" : "2"}</span><span>{enabled ? "2" : "3"}</span></div><strong>{report.orientation}, area {report.signedArea.toFixed(2)}: {report.decision}</strong></div>;
  }

  if (slug === "depth-testing") {
    const report = depthTestReport(value, enabled);
    return <div className={`depth-lab stage-${stage}`}><div className={`depth-shape depth-coral ${report.winner !== "coral" && stage === 2 ? "is-rejected" : ""}`}><span>coral z 0.50</span></div><div className={`depth-shape depth-blue ${report.winner !== "blue" && stage === 2 ? "is-rejected" : ""}`}><span>blue z {report.blue.toFixed(2)}</span></div>{stage === 1 && <div className="depth-comparison">{report.blue.toFixed(2)} {report.blue < report.coral ? "<" : ">"} 0.50</div>}<div className="depth-result"><span>{report.winner} wins: {report.reason}</span></div></div>;
  }

  if (slug === "z-fighting") {
    const report = quantizedDepthReport(value, enabled);
    return <div className={`zfighting-lab stage-${stage}`}><div className="z-plane z-plane-a"><span>A: {report.first}</span></div><div className={`z-plane z-plane-b ${stage === 2 && report.collide ? "is-fighting" : ""}`} style={{ transform: `translate(${20 + value / 3}px, ${8 - value / 12}px) skewX(-28deg)` }}><span>B: {report.second}</span></div><div className="depth-buckets"><i /> <i className={report.collide ? "same" : ""} /><small>{report.resolution} micro-unit buckets</small></div><strong>{report.collide ? "same stored depth, unstable winner" : "different stored depths, stable result"}</strong></div>;
  }

  if (slug === "image-buffers") {
    const report = imageBufferReport(value, enabled);
    return <div className={`buffer-lab stage-${stage}`}><div className="buffer-grid">{Array.from({ length: 48 }, (_, index) => <span key={index} style={{ background: enabled ? ["#315be8", "#ed6a4a", "#247a59", "#e2b93b"][index % 4] : `rgb(${40 + index * 4} ${40 + index * 4} ${40 + index * 4})` }}><small>{stage === 1 && index < 4 ? index : ""}</small></span>)}</div><div className="memory-stack"><span>48 pixels x {value} bits</span><strong>{report.bytes} bytes</strong><small>{enabled ? `${report.encodings.toLocaleString("en-US")} possible palette indices` : `${report.encodings.toLocaleString("en-US")} direct values`}</small></div></div>;
  }

  if (slug === "frame-timing") {
    const report = frameTimingReport(value, enabled);
    const frames = Math.max(1, Math.floor(50 / value));
    return <div className={`timing-lab stage-${stage}`}><div className="screen-scan"><div className={!enabled ? "tear-line is-visible" : "tear-line"} /><span>display scan: 16.7 ms</span></div><div className="timing-track">{Array.from({ length: frames + 1 }, (_, index) => <i key={index} style={{ width: `${Math.min(80, value * 3)}px` }} />)}<small>application frames</small></div><strong>{report.result}</strong></div>;
  }

  const report = objFaceReport(value);
  const faces = [["1", "2", "3"], ["1", "3", "4"], ["1", "4", "2"], ["2", "4", "3"]];
  return <div className={`obj-lab stage-${stage}`}><pre>{["v  0.0  0.9  0.0", "v -0.8 -0.6  0.6", "v  0.8 -0.6  0.6", "v  0.0 -0.4 -0.8", ...faces.map((face, index) => `${index + 1 === value ? ">" : " "} f  ${face.join("  ")}`)].join("\n")}</pre><div className="mesh-mini"><i className={`mesh-face face-${report.face}`} />{enabled && <><span className="mesh-v1">1</span><span className="mesh-v2">2</span><span className="mesh-v3">3</span><span className="mesh-v4">4</span></>}<strong>{report.record}</strong></div></div>;
}

export function FoundationExplorer({ meta, lesson }: { meta: VisualizationMeta; lesson: FoundationLesson }) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState(lesson.valueDefault);
  const [enabled, setEnabled] = useState(lesson.toggleDefault);
  const active = lesson.steps[step];
  const readout = useMemo(() => getFoundationReadout(meta.slug, value, enabled), [enabled, meta.slug, value]);

  function reset() {
    setStep(0);
    setValue(lesson.valueDefault);
    setEnabled(lesson.toggleDefault);
  }

  return <main className="lesson-shell foundation-shell">
    <aside className="lesson-outline" aria-label="Lesson outline">
      <div className="outline-heading"><span className="lesson-index">{meta.number}</span><div><p>{meta.topic}</p><h1>{meta.shortTitle}</h1></div></div>
      <ol className="step-list">{lesson.steps.map((item, index) => <li key={item.short} className={step === index ? "is-active" : ""}><button type="button" onClick={() => setStep(index)}><span>{index + 1}</span><span><strong>{item.short}</strong><small>{item.operation}</small></span></button></li>)}</ol>
      <div className="lesson-mobile-note">Change one input and follow it through the operation to the result.</div>
    </aside>

    <section className="visualization-workspace" aria-label="Interactive visualization">
      <div className="workspace-heading"><div><p className="eyebrow">{meta.field} · {meta.topic}</p><h2>{active.title}</h2></div><div className="workspace-actions"><button className="secondary-button compact-button" type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Reset</button></div></div>
      <div className="lesson-flow-strip"><div><span>Input</span><strong>{readout.input}</strong></div><ArrowRight aria-hidden="true" /><div className="is-operation"><span>Operation</span><strong>{active.operation}</strong></div><ArrowRight aria-hidden="true" /><div aria-live="polite"><span>Result</span><strong>{readout.result}</strong></div></div>
      <div className="canvas-frame concept-canvas"><div className="canvas-label-row"><span>Working example</span><span>{meta.interaction}</span></div><div className="concept-visual" role="img" aria-label={`${meta.title}. ${active.description}`}><LessonVisual slug={meta.slug} stage={step} value={value} enabled={enabled} /></div></div>
      <div className="control-bar concept-control-bar"><label className="range-control"><span>{lesson.valueLabel}<strong>{value}{lesson.valueUnit}</strong></span><input type="range" min={lesson.valueMin} max={lesson.valueMax} value={value} onChange={(event) => setValue(Number(event.target.value))} /></label><button className="toggle-row" type="button" role="switch" aria-checked={enabled} onClick={() => setEnabled((current) => !current)}><span>{lesson.toggleLabel}</span><span className="switch-track" aria-hidden="true"><span /></span></button></div>
      <div className="step-navigation"><button className="secondary-button" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} aria-hidden="true" /> Previous</button><span>Step {step + 1} of {lesson.steps.length}</span><button className="primary-button" type="button" disabled={step === lesson.steps.length - 1} onClick={() => setStep((current) => current + 1)}>Next <ArrowRight size={16} aria-hidden="true" /></button></div>
    </section>

    <aside className="lesson-inspector">
      <section className="inspector-section step-explanation"><span className="step-kicker">What happens</span><h2>{active.title}</h2><p>{active.description}</p><div className="concept-note"><span>Try this</span><p>{active.note}</p></div></section>
      <section className="inspector-section live-values-section"><p className="inspector-label">Live values</p><dl>{readout.metrics.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>
      <section className="inspector-section glossary-section"><p className="inspector-label">Key terms</p><dl>{lesson.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></section>
    </aside>
  </main>;
}
