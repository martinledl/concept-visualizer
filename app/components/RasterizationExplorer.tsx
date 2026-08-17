"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Grid3X3,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  coveredCells,
  defaultRasterState,
  parseRasterState,
  serializeRasterState,
  triangleArea,
  type Point,
  type RasterState,
} from "../lib/rasterization";

const steps = [
  {
    short: "Position",
    title: "Position the primitive",
    description:
      "A triangle reaches rasterization in screen space. Drag its vertices and notice that the geometry is still continuous; pixels have not been chosen yet.",
    note: "The three vertices define the triangle boundary in image space.",
  },
  {
    short: "Sample",
    title: "Test the sample locations",
    description:
      "The rasterizer evaluates sample locations on the pixel grid. In this simplified model, a pixel becomes covered when its center lies inside the triangle.",
    note: "Real rasterizers use precise edge rules so adjacent triangles agree at shared edges.",
  },
  {
    short: "Shade",
    title: "Generate fragments",
    description:
      "Each covered sample produces a fragment: a candidate contribution to a pixel. Later stages can still reject it, for example during depth testing.",
    note: "A fragment is not automatically a final pixel. It must pass the remaining pipeline tests.",
  },
];

const vertexNames = ["A", "B", "C"];
const plot = { x: 38, y: 34, width: 644, height: 430 };

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getLocationSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      className="toggle-row"
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
    >
      <span>{label}</span>
      <span className="switch-track" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

export function RasterizationExplorer({
  initialState,
}: {
  initialState: RasterState;
}) {
  const search = useSyncExternalStore(
    subscribeToLocation,
    getLocationSearch,
    getServerSearch,
  );
  const restoredState = useMemo(() => {
    if (!search) return initialState;
    return parseRasterState(Object.fromEntries(new URLSearchParams(search)));
  }, [initialState, search]);

  return (
    <RasterizationExplorerContent
      key={search}
      initialState={restoredState}
    />
  );
}

function RasterizationExplorerContent({
  initialState,
}: {
  initialState: RasterState;
}) {
  const [vertices, setVertices] = useState(initialState.vertices);
  const [resolution, setResolution] = useState(initialState.resolution);
  const [showCenters, setShowCenters] = useState(initialState.showCenters);
  const [showCoverage, setShowCoverage] = useState(initialState.showCoverage);
  const [mode, setMode] = useState<RasterState["mode"]>(initialState.mode);
  const [step, setStep] = useState(initialState.step);
  const [selectedVertex, setSelectedVertex] = useState(0);
  const [copied, setCopied] = useState(false);

  const rows = Math.max(5, Math.round(resolution * 0.72));
  const cellWidth = plot.width / resolution;
  const cellHeight = plot.height / rows;
  const covered = useMemo(
    () => coveredCells(vertices, resolution, rows),
    [resolution, rows, vertices],
  );
  const coveredSet = useMemo(
    () => new Set(covered.map((cell) => `${cell.column}:${cell.row}`)),
    [covered],
  );
  const activeStep = steps[step];
  const coverageVisible = showCoverage && (mode === "explore" || step > 0);

  function toSvg(point: Point) {
    return {
      x: plot.x + point.x * plot.width,
      y: plot.y + (1 - point.y) * plot.height,
    };
  }

  function updateVertex(index: number, point: Point) {
    const nextPoint = {
      x: Math.min(0.98, Math.max(0.02, point.x)),
      y: Math.min(0.98, Math.max(0.02, point.y)),
    };
    setVertices((current) =>
      current.map((vertex, vertexIndex) =>
        vertexIndex === index ? nextPoint : vertex,
      ) as [Point, Point, Point],
    );
  }

  function pointFromPointer(event: React.PointerEvent<SVGCircleElement>) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 720;
    const y = ((event.clientY - bounds.top) / bounds.height) * 520;
    return {
      x: (x - plot.x) / plot.width,
      y: 1 - (y - plot.y) / plot.height,
    };
  }

  function nudgeSelected(dx: number, dy: number) {
    const current = vertices[selectedVertex];
    updateVertex(selectedVertex, {
      x: current.x + dx,
      y: current.y + dy,
    });
  }

  function reset() {
    setVertices(defaultRasterState.vertices);
    setResolution(defaultRasterState.resolution);
    setShowCenters(defaultRasterState.showCenters);
    setShowCoverage(defaultRasterState.showCoverage);
    setStep(0);
    setSelectedVertex(0);
  }

  async function shareState() {
    const query = serializeRasterState({
      vertices,
      resolution,
      showCenters,
      showCoverage,
      mode,
      step,
    });
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", url);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const polygonPoints = vertices
    .map(toSvg)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <main className="lesson-shell">
      <aside className="lesson-outline" aria-label="Lesson outline">
        <div className="outline-heading">
          <span className="lesson-index">01</span>
          <div>
            <p>Rendering</p>
            <h1>Rasterization Explorer</h1>
          </div>
        </div>
        <div className="mode-switcher" aria-label="Learning mode">
          <button
            type="button"
            className={mode === "guided" ? "is-active" : ""}
            onClick={() => setMode("guided")}
            aria-pressed={mode === "guided"}
          >
            Guided
          </button>
          <button
            type="button"
            className={mode === "explore" ? "is-active" : ""}
            onClick={() => setMode("explore")}
            aria-pressed={mode === "explore"}
          >
            Explore
          </button>
        </div>
        <ol className="step-list">
          {steps.map((item, index) => (
            <li key={item.short} className={step === index ? "is-active" : ""}>
              <button type="button" onClick={() => setStep(index)}>
                <span>{index + 1}</span>
                <span>
                  <strong>{item.short}</strong>
                  <small>
                    {index === 0
                      ? "Screen-space geometry"
                      : index === 1
                        ? "Pixel center tests"
                        : "Candidate pixels"}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="source-note">
          <span>Lecture source</span>
          <strong>Chapter 1 · Slides 15-16</strong>
          <p>Graphics & Visualization: Principles & Algorithms</p>
        </div>
      </aside>

      <section className="visualization-workspace" aria-label="Interactive visualization">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">Graphics Pipeline · Rendering</p>
            <h2>{mode === "guided" ? activeStep.title : "Explore the rasterizer"}</h2>
          </div>
          <div className="workspace-actions">
            <button className="secondary-button compact-button" type="button" onClick={reset}>
              <RotateCcw size={16} aria-hidden="true" /> Reset
            </button>
            <button
              className="secondary-button compact-button"
              type="button"
              onClick={shareState}
            >
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? "Copied" : "Share state"}
            </button>
          </div>
        </div>

        <div className="canvas-frame">
          <div className="canvas-label-row">
            <span>
              <Grid3X3 size={16} aria-hidden="true" /> {resolution} × {rows} pixel grid
            </span>
            <span>{covered.length} covered samples</span>
          </div>
          <svg
            className="raster-canvas"
            viewBox="0 0 720 520"
            role="img"
            aria-labelledby="raster-title raster-description"
          >
            <title id="raster-title">Triangle rasterization grid</title>
            <desc id="raster-description">
              An interactive triangle over a pixel grid. Filled cells have centers inside the triangle.
            </desc>
            <rect className="plot-background" x={plot.x} y={plot.y} width={plot.width} height={plot.height} />

            {Array.from({ length: rows }, (_, visualRow) => {
              const dataRow = rows - visualRow - 1;
              return Array.from({ length: resolution }, (_, column) => {
                const selected = coveredSet.has(`${column}:${dataRow}`);
                return (
                  <g key={`${column}-${visualRow}`}>
                    {coverageVisible && selected && (
                      <rect
                        className={step === 2 || mode === "explore" ? "covered-cell is-shaded" : "covered-cell"}
                        x={plot.x + column * cellWidth + 1}
                        y={plot.y + visualRow * cellHeight + 1}
                        width={Math.max(0, cellWidth - 2)}
                        height={Math.max(0, cellHeight - 2)}
                      />
                    )}
                    <rect
                      className="grid-cell"
                      x={plot.x + column * cellWidth}
                      y={plot.y + visualRow * cellHeight}
                      width={cellWidth}
                      height={cellHeight}
                    />
                    {showCenters && (mode === "explore" || step > 0) && (
                      <circle
                        className={selected ? "sample-center is-covered" : "sample-center"}
                        cx={plot.x + (column + 0.5) * cellWidth}
                        cy={plot.y + (visualRow + 0.5) * cellHeight}
                        r={selected ? 2.8 : 2.2}
                      />
                    )}
                  </g>
                );
              });
            })}

            <polygon className="triangle-fill" points={polygonPoints} />
            <polygon className="triangle-outline" points={polygonPoints} />

            {vertices.map((vertex, index) => {
              const position = toSvg(vertex);
              return (
                <g key={vertexNames[index]}>
                  <circle
                    className={`vertex-hit-target ${selectedVertex === index ? "is-selected" : ""}`}
                    cx={position.x}
                    cy={position.y}
                    r="17"
                    tabIndex={0}
                    role="slider"
                    aria-label={`Vertex ${vertexNames[index]}. Use arrow keys to move it.`}
                    aria-valuetext={`${(vertex.x * resolution).toFixed(1)}, ${(vertex.y * rows).toFixed(1)}`}
                    onFocus={() => setSelectedVertex(index)}
                    onPointerDown={(event) => {
                      setSelectedVertex(index);
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                      const point = pointFromPointer(event);
                      if (point) updateVertex(index, point);
                    }}
                    onPointerUp={(event) => {
                      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                      }
                    }}
                    onKeyDown={(event) => {
                      const increment = event.shiftKey ? 0.05 : 0.01;
                      const movement: Record<string, [number, number]> = {
                        ArrowLeft: [-increment, 0],
                        ArrowRight: [increment, 0],
                        ArrowUp: [0, increment],
                        ArrowDown: [0, -increment],
                      };
                      if (movement[event.key]) {
                        event.preventDefault();
                        updateVertex(index, {
                          x: vertex.x + movement[event.key][0],
                          y: vertex.y + movement[event.key][1],
                        });
                      }
                    }}
                  />
                  <circle className="vertex-point" cx={position.x} cy={position.y} r="6.5" />
                  <text className="vertex-label" x={position.x + 14} y={position.y - 12}>
                    {vertexNames[index]}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="canvas-help">
            Drag a vertex, select it and use arrow keys, or use the nudge controls in the inspector.
          </p>
        </div>

        <div className="control-bar">
          <label className="range-control">
            <span>
              Grid resolution <strong>{resolution}</strong>
            </span>
            <input
              type="range"
              min="6"
              max="18"
              value={resolution}
              onChange={(event) => setResolution(Number(event.target.value))}
            />
          </label>
          <div className="toggle-group">
            <Toggle
              checked={showCenters}
              label="Pixel centers"
              onChange={() => setShowCenters((current) => !current)}
            />
            <Toggle
              checked={showCoverage}
              label="Coverage"
              onChange={() => setShowCoverage((current) => !current)}
            />
          </div>
        </div>

        {mode === "guided" && (
          <div className="step-navigation">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
            >
              <ChevronLeft size={18} aria-hidden="true" /> Previous
            </button>
            <span>Step {step + 1} of {steps.length}</span>
            <button
              className="primary-button"
              type="button"
              onClick={() => setStep((current) => Math.min(2, current + 1))}
              disabled={step === 2}
            >
              Next <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <aside className="lesson-inspector" aria-label="Explanation and inspector">
        {mode === "guided" ? (
          <>
            <div className="inspector-section step-explanation" aria-live="polite">
              <span className="step-kicker">Step {step + 1} · {activeStep.short}</span>
              <h2>{activeStep.title}</h2>
              <p>{activeStep.description}</p>
              <div className="concept-note">
                <span>Keep in mind</span>
                <p>{activeStep.note}</p>
              </div>
            </div>
            <div className="inspector-section glossary-section">
              <p className="inspector-label">Key terms</p>
              <dl>
                <div>
                  <dt>Primitive</dt>
                  <dd>A geometric object sent through the graphics pipeline.</dd>
                </div>
                <div>
                  <dt>Fragment</dt>
                  <dd>A candidate contribution to a pixel, produced during rasterization.</dd>
                </div>
                <div>
                  <dt>Coverage</dt>
                  <dd>Which sample locations are overlapped by the primitive.</dd>
                </div>
              </dl>
            </div>
          </>
        ) : (
          <>
            <div className="inspector-section">
              <p className="inspector-label">Live inspector</p>
              <div className="metric-list">
                <div><span>Covered samples</span><strong>{covered.length}</strong></div>
                <div><span>Grid samples</span><strong>{resolution * rows}</strong></div>
                <div><span>Coverage</span><strong>{((covered.length / (resolution * rows)) * 100).toFixed(1)}%</strong></div>
                <div><span>Triangle area</span><strong>{(triangleArea(vertices) * resolution * rows).toFixed(2)} px²</strong></div>
              </div>
            </div>
            <div className="inspector-section">
              <p className="inspector-label">Selected vertex</p>
              <div className="vertex-tabs" aria-label="Select a vertex">
                {vertexNames.map((name, index) => (
                  <button
                    type="button"
                    key={name}
                    className={selectedVertex === index ? "is-active" : ""}
                    onClick={() => setSelectedVertex(index)}
                    aria-pressed={selectedVertex === index}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="coordinate-readout">
                <span>x {(vertices[selectedVertex].x * resolution).toFixed(2)}</span>
                <span>y {(vertices[selectedVertex].y * rows).toFixed(2)}</span>
              </div>
              <div className="nudge-grid" aria-label={`Move vertex ${vertexNames[selectedVertex]}`}>
                <button type="button" onClick={() => nudgeSelected(0, 0.02)} aria-label="Move selected vertex up"><ArrowUp size={18} aria-hidden="true" /></button>
                <button type="button" onClick={() => nudgeSelected(-0.02, 0)} aria-label="Move selected vertex left"><ArrowLeft size={18} aria-hidden="true" /></button>
                <span aria-hidden="true">{vertexNames[selectedVertex]}</span>
                <button type="button" onClick={() => nudgeSelected(0.02, 0)} aria-label="Move selected vertex right"><ArrowRight size={18} aria-hidden="true" /></button>
                <button type="button" onClick={() => nudgeSelected(0, -0.02)} aria-label="Move selected vertex down"><ArrowDown size={18} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="inspector-section glossary-section">
              <p className="inspector-label">Model note</p>
              <p>
                This lesson uses one sample at each pixel center. It isolates the core idea before introducing multisampling and implementation-specific edge rules.
              </p>
            </div>
          </>
        )}
      </aside>
    </main>
  );
}
