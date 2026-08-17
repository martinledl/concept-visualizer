"use client";

import { ArrowLeft, ArrowRight, Box, Camera, Grid3X3, RotateCcw, ScanLine, Scissors, Shrink } from "lucide-react";
import { useMemo, useState } from "react";
import { buildPipelineScene, rasterize, type PipelinePrimitive, type SceneSelection, type Vec2, type Vec3 } from "../lib/graphics-pipeline";

const stages = [
  {
    short: "Input",
    title: "Start with local vertices",
    operation: "Input geometry",
    description: "The scene starts as lists of vertex coordinates. Each object is centered around its own local origin, which makes it easy to model and reuse.",
    note: "Nothing is a pixel yet. The triangle and quad are only coordinates connected into faces.",
    icon: Box,
  },
  {
    short: "Place",
    title: "Place every model in the world",
    operation: "Model transform",
    description: "The model transform rotates, scales, and translates each object from its private coordinate system into one shared world.",
    note: "The same triangle data could be placed many times with different model transforms.",
    icon: RotateCcw,
  },
  {
    short: "View",
    title: "Express the world from the camera",
    operation: "View transform",
    description: "The view transform moves the entire world into camera-relative coordinates. Moving the camera right makes every object move left in eye space.",
    note: "Graphics usually transform the world around a fixed camera rather than moving the camera itself.",
    icon: Camera,
  },
  {
    short: "Trim",
    title: "Remove geometry the camera cannot use",
    operation: "Back-face culling + clipping",
    description: "Back-facing surfaces can be rejected, while edges crossing the view boundary are cut and replaced with new boundary vertices.",
    note: "Culling removes whole faces. Clipping can reshape a partially visible face.",
    icon: Scissors,
  },
  {
    short: "Project",
    title: "Turn depth into perspective",
    operation: "Projection + perspective division",
    description: "Projection converts camera-space geometry into a canonical cube. Dividing by depth makes farther objects appear smaller and produces normalized device coordinates.",
    note: "At this point the result is 2D-like, but it is still device independent: X and Y are approximately −1 to +1.",
    icon: Shrink,
  },
  {
    short: "Map",
    title: "Map normalized positions to pixels",
    operation: "Viewport transform",
    description: "The viewport transform scales and translates normalized coordinates into positions inside the selected pixel rectangle.",
    note: "The geometry now has pixel coordinates, but pixels have not yet been chosen.",
    icon: ScanLine,
  },
  {
    short: "Fill",
    title: "Generate fragments on the pixel grid",
    operation: "Rasterization",
    description: "Rasterization tests pixel sample locations against the projected faces. Covered samples create fragments for later shading and depth tests.",
    note: "A fragment is a candidate pixel contribution, not automatically the final displayed pixel.",
    icon: Grid3X3,
  },
];

const svgFrame = { x: 82, y: 48, width: 556, height: 334 };

function pointsAttribute(points: Array<Vec2 | Vec3>, map: (point: Vec2 | Vec3) => Vec2) {
  return points.map(map).map((point) => `${point.x},${point.y}`).join(" ");
}

function primitiveClass(primitive: PipelinePrimitive, extra = "") {
  return `pipeline-primitive primitive-${primitive.id} ${extra}`.trim();
}

function Axes({ label, unit = "units" }: { label: string; unit?: string }) {
  return <g className="pipeline-axes"><line x1="82" y1="215" x2="638" y2="215" /><line x1="360" y1="48" x2="360" y2="382" /><text x="625" y="204">x</text><text x="370" y="62">y</text><text x="94" y="70">{label}</text><text x="94" y="88">{unit}</text></g>;
}

function PipelineCanvas({ stage, scene }: { stage: number; scene: PipelinePrimitive[] }) {
  const mapWorld = (point: Vec2 | Vec3) => ({ x: 360 + point.x * 150, y: 215 - point.y * 150 });
  const mapCanonical = (point: Vec2 | Vec3) => ({ x: 360 + point.x * 248, y: 215 - point.y * 148 });
  const mapViewport = (point: Vec2 | Vec3) => ({ x: svgFrame.x + (point.x / 640) * svgFrame.width, y: svgFrame.y + (point.y / 360) * svgFrame.height });
  const hits = rasterize(scene);
  const hitMap = new Map(hits.map((hit) => [`${hit.column}:${hit.row}`, hit.primitive]));

  if (stage === 0) {
    const visible = scene.filter((primitive) => primitive.id !== "back-face");
    return <svg className="pipeline-svg" viewBox="0 0 720 430" role="img" aria-label="Triangle and quad represented by local vertex coordinates">
      {visible.map((primitive, index) => {
        const centerX = index === 0 ? 215 : 505;
        const mapLocal = (point: Vec2 | Vec3) => ({ x: centerX + point.x * 105, y: 215 - point.y * 105 });
        return <g key={primitive.id}>
          <line className="local-axis" x1={centerX - 118} y1="215" x2={centerX + 118} y2="215" />
          <line className="local-axis" x1={centerX} y1="90" x2={centerX} y2="340" />
          <polygon className={primitiveClass(primitive)} points={pointsAttribute(primitive.local, mapLocal)} />
          {primitive.local.map((point, vertexIndex) => { const mapped = mapLocal(point); return <g key={vertexIndex}><circle className="pipeline-vertex" cx={mapped.x} cy={mapped.y} r="5" /><text className="pipeline-coordinate" x={mapped.x + 8} y={mapped.y - 8}>({point.x.toFixed(1)}, {point.y.toFixed(1)})</text></g>; })}
          <text className="pipeline-object-label" x={centerX} y="385">{primitive.label} · local space</text>
        </g>;
      })}
    </svg>;
  }

  if (stage === 1 || stage === 2) {
    const key = stage === 1 ? "world" : "eye";
    return <svg className="pipeline-svg" viewBox="0 0 720 430" role="img" aria-label={stage === 1 ? "Objects placed together in world space" : "Objects expressed relative to the camera"}>
      <Axes label={stage === 1 ? "World coordinate system" : "Eye coordinate system"} />
      {scene.map((primitive) => <g key={primitive.id} className={primitive.backFacing ? "pipeline-back-face" : ""}>
        <polygon className={primitiveClass(primitive, primitive.backFacing ? "is-secondary" : "")} points={pointsAttribute(primitive[key], mapWorld)} />
        {primitive[key].map((point, index) => { const mapped = mapWorld(point); return <circle className="pipeline-vertex" cx={mapped.x} cy={mapped.y} r="4" key={index} />; })}
        <text className="pipeline-depth-label" x={mapWorld(primitive[key][0]).x} y={mapWorld(primitive[key][0]).y + 22}>z {primitive[key][0].z.toFixed(1)}</text>
      </g>)}
      {stage === 2 && <g className="camera-origin"><path d="M347 365 L373 365 L360 340 Z" /><text x="360" y="392">camera origin</text></g>}
    </svg>;
  }

  if (stage === 3 || stage === 4) {
    return <svg className="pipeline-svg" viewBox="0 0 720 430" role="img" aria-label={stage === 3 ? "Back-facing and outside geometry removed" : "Projected geometry in normalized device coordinates"}>
      <rect className="canonical-window" x={svgFrame.x} y={svgFrame.y} width={svgFrame.width} height={svgFrame.height} />
      <line className="canonical-axis" x1="360" y1={svgFrame.y} x2="360" y2={svgFrame.y + svgFrame.height} />
      <line className="canonical-axis" x1={svgFrame.x} y1="215" x2={svgFrame.x + svgFrame.width} y2="215" />
      <text className="canonical-label" x="88" y="40">canonical view · −1 to +1</text>
      {scene.map((primitive) => <g key={primitive.id}>
        {stage === 3 && primitive.projected.length > 0 && <polygon className={primitiveClass(primitive, "is-unclipped")} points={pointsAttribute(primitive.projected, mapCanonical)} />}
        {primitive.clipped.length > 0 && <polygon className={primitiveClass(primitive)} points={pointsAttribute(primitive.clipped, mapCanonical)} />}
        {primitive.backFacing && <g className="culled-mark"><polygon points={pointsAttribute(primitive.projected, mapCanonical)} /><line x1="330" y1="174" x2="390" y2="234" /><line x1="390" y1="174" x2="330" y2="234" /><text x="360" y="258">culled</text></g>}
      </g>)}
      {stage === 4 && scene.filter((primitive) => primitive.clipped.length > 0).map((primitive) => <text className="pipeline-depth-label" key={primitive.id} x={mapCanonical(primitive.clipped[0]).x} y={mapCanonical(primitive.clipped[0]).y + 20}>{primitive.eye[0].z.toFixed(1)} units deep</text>)}
    </svg>;
  }

  if (stage === 5) {
    return <svg className="pipeline-svg" viewBox="0 0 720 430" role="img" aria-label="Projected objects mapped into a 640 by 360 pixel viewport">
      <rect className="viewport-window" x={svgFrame.x} y={svgFrame.y} width={svgFrame.width} height={svgFrame.height} />
      <text className="canonical-label" x="82" y="40">viewport · 640 × 360 pixels</text>
      {scene.map((primitive) => primitive.viewport.length > 0 && <g key={primitive.id}><polygon className={primitiveClass(primitive)} points={pointsAttribute(primitive.viewport, mapViewport)} />{primitive.viewport.map((point, index) => { const mapped = mapViewport(point); return <g key={index}><circle className="pipeline-vertex" cx={mapped.x} cy={mapped.y} r="4" />{index === 0 && <text className="pipeline-coordinate" x={mapped.x + 7} y={mapped.y - 8}>{Math.round(point.x)}, {Math.round(point.y)} px</text>}</g>; })}</g>)}
    </svg>;
  }

  return <svg className="pipeline-svg" viewBox="0 0 720 430" role="img" aria-label="Pixel grid with fragments generated where object faces cover sample centers">
    <text className="canonical-label" x="82" y="36">raster grid · sample at pixel centers</text>
    {Array.from({ length: 12 }, (_, row) => Array.from({ length: 20 }, (_, column) => {
      const primitive = hitMap.get(`${column}:${row}`);
      const width = svgFrame.width / 20;
      const height = svgFrame.height / 12;
      return <g key={`${column}:${row}`}><rect className={`pipeline-pixel ${primitive ? `hit-${primitive}` : ""}`} x={svgFrame.x + column * width} y={svgFrame.y + row * height} width={width} height={height} /><circle className="pipeline-sample" cx={svgFrame.x + (column + .5) * width} cy={svgFrame.y + (row + .5) * height} r="2" /></g>;
    }))}
  </svg>;
}

function formatPoint(point: Vec2 | Vec3 | undefined) {
  if (!point) return "not available";
  const values = "z" in point ? [point.x, point.y, point.z] : [point.x, point.y];
  return values.map((value) => value.toFixed(2)).join(", ");
}

export function PipelineExplorer() {
  const [stage, setStage] = useState(0);
  const [cameraX, setCameraX] = useState(0);
  const [sceneRotation, setSceneRotation] = useState(0);
  const [selection, setSelection] = useState<SceneSelection>("both");
  const scene = useMemo(() => buildPipelineScene({ cameraX, sceneRotation, selection }), [cameraX, sceneRotation, selection]);
  const hits = useMemo(() => rasterize(scene), [scene]);
  const active = stages[stage];
  const primary = scene.find((primitive) => primitive.id !== "back-face");
  const Icon = active.icon;
  const values = [
    { label: "Local vertex", value: formatPoint(primary?.local[0]) },
    { label: "World vertex", value: formatPoint(primary?.world[0]) },
    { label: "Eye vertex", value: formatPoint(primary?.eye[0]) },
    { label: "NDC vertex", value: formatPoint(primary?.clipped[0]) },
    { label: "Pixel vertex", value: formatPoint(primary?.viewport[0]) },
  ];

  function reset() {
    setStage(0);
    setCameraX(0);
    setSceneRotation(0);
    setSelection("both");
  }

  return <main className="lesson-shell pipeline-lesson-shell">
    <aside className="lesson-outline pipeline-outline">
      <div className="outline-heading"><span className="lesson-index">01</span><div><p>Pipeline & coordinates</p><h1>Render a tiny scene</h1></div></div>
      <div className="pipeline-scene-key"><span className="key-triangle" /> Triangle <span className="key-quad" /> Quad</div>
      <ol className="step-list pipeline-step-list">{stages.map((item, index) => <li key={item.short} className={stage === index ? "is-active" : ""}><button type="button" onClick={() => setStage(index)}><span>{index + 1}</span><span><strong>{item.short}</strong><small>{item.operation}</small></span></button></li>)}</ol>
      <div className="lesson-mobile-note">A simplified but numerically consistent graphics pipeline.</div>
    </aside>

    <section className="visualization-workspace pipeline-workspace">
      <div className="workspace-heading"><div><p className="eyebrow">Step {stage + 1} of {stages.length} · {active.operation}</p><h2>{active.title}</h2></div><div className="workspace-actions"><button className="secondary-button compact-button" type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Reset</button></div></div>

      <div className="pipeline-object-picker" aria-label="Objects to render">
        <span>Render</span>
        {(["both", "triangle", "quad"] as const).map((option) => <button key={option} type="button" className={selection === option ? "is-active" : ""} aria-pressed={selection === option} onClick={() => setSelection(option)}>{option === "both" ? "Both objects" : option === "triangle" ? "Triangle only" : "Quad only"}</button>)}
      </div>

      <div className="canvas-frame pipeline-canvas-frame">
        <div className="canvas-label-row"><span><Icon size={15} aria-hidden="true" /> {active.operation}</span><span>{scene.filter((item) => item.clipped.length > 0).length} visible primitives · {hits.length} final fragments</span></div>
        <PipelineCanvas stage={stage} scene={scene} />
      </div>

      <div className="pipeline-controls">
        <label className="range-control"><span>Move camera sideways<strong>{cameraX.toFixed(2)}</strong></span><input type="range" min="-0.9" max="0.9" step="0.05" value={cameraX} onChange={(event) => setCameraX(Number(event.target.value))} /></label>
        <label className="range-control"><span>Rotate scene<strong>{sceneRotation}°</strong></span><input type="range" min="-35" max="35" value={sceneRotation} onChange={(event) => setSceneRotation(Number(event.target.value))} /></label>
      </div>

      <div className="step-navigation"><button className="secondary-button" type="button" disabled={stage === 0} onClick={() => setStage((current) => current - 1)}><ArrowLeft size={16} aria-hidden="true" /> Previous</button><span>{active.operation}</span><button className="primary-button" type="button" disabled={stage === stages.length - 1} onClick={() => setStage((current) => current + 1)}>Next stage <ArrowRight size={16} aria-hidden="true" /></button></div>
    </section>

    <aside className="lesson-inspector pipeline-inspector">
      <section className="inspector-section step-explanation"><span className="step-kicker">What this stage does</span><div className="pipeline-inspector-title"><Icon size={20} aria-hidden="true" /><h2>{active.operation}</h2></div><p>{active.description}</p><div className="concept-note"><span>Practical takeaway</span><p>{active.note}</p></div></section>
      <section className="inspector-section"><p className="inspector-label">Follow vertex 1</p><div className="pipeline-value-list">{values.map((item, index) => <div className={index === Math.min(stage, 4) ? "is-current" : ""} key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></section>
      <section className="inspector-section final-preview-section"><p className="inspector-label">Final framebuffer preview</p><div className="final-pixel-preview" aria-label={`${hits.length} fragments in the final simplified framebuffer`}>{Array.from({ length: 84 }, (_, index) => { const column = index % 12; const row = Math.floor(index / 12); const match = hits.find((hit) => Math.floor(hit.column / (20 / 12)) === column && Math.floor(hit.row / (12 / 7)) === row); return <span key={index} className={match ? `hit-${match.primitive}` : ""} />; })}</div><p>Change the camera or scene above. The final pixels update at every stage.</p></section>
    </aside>
  </main>;
}
