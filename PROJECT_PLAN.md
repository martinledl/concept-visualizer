# Concept Visualizer - Project Plan

## Product vision

Concept Visualizer is a growing library of interactive explanations for difficult university concepts. Each lesson combines a focused explanation, a manipulable visual model, and a small set of guided experiments. The product should feel closer to a scientific instrument or an excellent interactive textbook than to a course-management system.

The first content seed comes from visual computing material, but the public product is organized around durable fields, topics, and concepts rather than a particular institution, course, or syllabus.

## Product principles

1. **Manipulation before decoration.** The main visualization receives most of the screen and attention.
2. **One lesson, one mental model.** A concept page has a clear learning objective and avoids unrelated controls.
3. **Reveal complexity gradually.** Start with a guided state, then expose deeper controls and inspection data.
4. **Make causality visible.** Every control must produce an immediate, explainable visual change.
5. **Preserve scientific accuracy.** Definitions, coordinate conventions, equations, edge cases, and source references are part of the lesson.
6. **Make states shareable.** Useful configurations can be linked, reset, and reproduced.
7. **Design for study.** Calm hierarchy, readable type, keyboard access, reduced motion, and no distracting gamification.
8. **Build concepts individually.** Share the shell and teaching primitives, but do not force fundamentally different visualizations into one rendering abstraction.

## Initial audience and use cases

- A university student trying to build intuition before or after a lecture.
- A student revising a concept and testing edge cases.
- An instructor linking to a specific interactive state.
- An AI coding assistant adding a new visualization from lecture material without reinventing the project structure.

## Recommended technical shape

The exact framework should be selected after the design direction, but the implementation should use TypeScript and a component-based web UI. The initial application can be a static, Git-backed site; it does not need a database or accounts.

Recommended foundations:

- React-compatible TypeScript application and route-per-lesson navigation.
- MDX or structured content files for explanations, glossary entries, equations, and references.
- Zod-validated visualization metadata.
- SVG for coordinate geometry and diagrams.
- Canvas for pixel-heavy raster examples.
- WebGL/Three.js only for concepts that genuinely need 3D interaction.
- A small deterministic state model per visualization, serializable into URL parameters.
- Math rendering through KaTeX.
- Vitest for mathematical and state-model tests.
- Playwright for interaction, accessibility, and visual regression checks.
- Static deployment first; optional durable progress and authoring tools later.

### Why this split

The shared product layer should standardize navigation, teaching structure, controls, terminology, responsive behavior, and accessibility. The renderer should remain local to each lesson. Rasterization, frame timing, and a 3D coordinate-space explorer have very different needs, so a universal visualization engine would add friction without adding learning value.

## Proposed repository structure

```text
app/
  library/                    # searchable visualization index
  learn/[slug]/               # stable route for every lesson
components/
  learning/                   # lesson shell, steps, glossary, callouts
  controls/                   # sliders, toggles, playback, presets
  visualization/              # canvas frame, legends, axes, inspector
content/
  courses/                    # course and chapter metadata
  glossary/                   # shared definitions and aliases
visualizations/
  rasterization/
    meta.ts                   # title, tags, prerequisites, source pages
    lesson.mdx                # explanation and guided experiments
    model.ts                  # pure deterministic concept logic
    Visualization.tsx         # renderer and interactions
    presets.ts                # useful states and edge cases
    model.test.ts             # correctness tests
design-system/
  tokens/                     # color, type, spacing, motion, chart colors
  patterns/                   # page and interaction conventions
scripts/
  new-visualization.*         # creates a complete concept package
  validate-content.*          # validates metadata, links, references
tests/
  e2e/                        # keyboard, responsive, and lesson flows
public/
```

## The visualization contract

Every visualization package should define:

- A stable slug and human-readable title.
- Course, chapter, tags, prerequisites, difficulty, and estimated study time.
- One primary learning objective and up to three secondary objectives.
- Source title and source page/slide references.
- A short introduction and shared glossary links.
- Initial state, reset state, and two to five meaningful presets.
- Pure state-transition logic separate from drawing code.
- URL serialization for shareable states.
- Keyboard and pointer interaction instructions.
- Reduced-motion behavior and a non-animated final-state fallback.
- Mathematical correctness tests and a short manual review checklist.

The shared lesson shell should support these optional teaching primitives:

- Guided step sequence.
- Free exploration mode.
- Layer visibility toggles.
- Formula and variable inspector.
- Before/after comparison.
- Timeline playback and scrubbing.
- Checkpoint questions with explanations, not scores.
- Glossary definitions in context.
- Source notes and convention warnings.

## AI-assisted authoring workflow

Adding a concept should follow a repeatable workflow:

1. **Ingest the source.** Extract text and inspect diagrams from the relevant lecture pages.
2. **Inventory concepts.** Separate visualizable mechanisms from definitions, history, and supporting context.
3. **Write the teaching brief.** Define the misconception to address, the variable the learner controls, and the visual consequence.
4. **Choose the renderer.** Use SVG, Canvas, or WebGL according to the concept, not preference.
5. **Generate the package.** Run the project template to create metadata, lesson, model, renderer, presets, and tests.
6. **Implement one vertical slice.** Initial state, one control, one visible consequence, and one explanation.
7. **Add guided experiments.** Include useful normal cases and edge cases from the source.
8. **Verify.** Test mathematical output, source fidelity, keyboard use, mobile fallback, reduced motion, and shareable URLs.
9. **Publish to the library.** The validated metadata automatically adds the lesson to search, filters, related concepts, and course navigation.

The repository should include an `AGENTS.md` authoring guide and a `new-visualization` generator so an AI coding tool receives the same constraints every time.

## Initial computer graphics collection

### Tier 1: core graphics pipeline

1. **Graphics Pipeline Map** - Move a triangle through Model, World, Eye, Clip, NDC, Viewport, and Image spaces. Show coordinates and the effect of each transform. This becomes the navigational backbone for related lessons. Source: slides 9-11 and 16.
2. **Clipping Lab** - Drag primitives through a view volume; compare original, intersecting, clipped, and rejected geometry. Step through newly created vertices. Source: slide 12.
3. **Viewport Transform** - Change viewport dimensions and position while comparing NDC to image-space coordinates. Make translation, scaling, aspect ratio, and letterboxing visible. Source: slide 13.
4. **Winding and Back-Face Culling** - Reorder triangle vertices, rotate the triangle, and toggle clockwise/counter-clockwise front-face conventions. Source: slide 14.
5. **Rasterization Explorer** - Drag triangle vertices over a pixel grid; toggle pixel centers, coverage, fragments, edge rules, and resolution. Step from primitive to tested samples to final fragments. Source: slides 15-16.

### Tier 2: visibility and numerical behavior

6. **Drawing Order vs. Depth Test** - Reorder overlapping triangles and compare painter-style drawing with Z-testing. Inspect the winning fragment at a selected pixel. Source: slides 17-19.
7. **Depth Buffer Explorer** - Display color and depth buffers side by side, adjust near/far planes, and inspect normalized depth values. Source: slides 18-19 and 23.
8. **Z-Fighting Microscope** - Move two nearly coplanar surfaces, vary depth precision and camera planes, and reveal when their quantized depth values collide. Source: slide 20.

### Tier 3: images and display timing

9. **Image Buffer Workbench** - Inspect a 2D pixel array in memory, calculate storage from width, height, and bits per pixel, and compare grayscale, true-color, and palette/CLUT encoding. Source: slides 21-23.
10. **Frame Timing and Tearing** - Scrub through display scanout while an application writes a new frame. Toggle double buffering and VSync; vary draw time to see 16.6 ms and 33.3 ms behavior at 60 Hz. Source: slides 24-27.

### Tier 4: context and representation

11. **Boundary vs. Solid Models** - Compare what each representation stores and which questions it can answer. Source: slide 8.
12. **OBJ Mesh Inspector** - Load a small OBJ file, connect vertex and face records to highlighted geometry, and expose winding and connectivity. Source: slide 30.
13. **CPU vs. GPU Parallelism** - Compare serial and parallel execution for independent vertex/fragment work without presenting the historical chart as a literal performance law. Source: slides 3 and 29.
14. **Graphics Pipeline vs. Generative AI** - An explanatory comparison of deterministic real-time rendering, compute cost, and temporal consistency, with current claims reviewed before publication. Source: slide 28.

History and application slides are better used as course context than as standalone interactive lessons.

## Recommended first vertical slice

Start with **Rasterization Explorer** because it is understandable in 2D, visually distinctive, and exercises nearly every reusable part of the platform:

- Lesson navigation and metadata.
- An SVG or Canvas visualization surface.
- Draggable geometry and deterministic state.
- Toggle, slider, preset, reset, and guided-step controls.
- A glossary and annotated explanation.
- URL state serialization.
- Math/model tests.
- Responsive and keyboard interaction.

This first slice defines the reusable learning shell and interaction vocabulary for the broader catalogue.

## Library and discovery model

The first library should be generated from local metadata and support:

- Browse by field, topic, and prerequisite.
- Search titles, summaries, glossary terms, and aliases such as ISC/viewport/device/screen coordinates.
- Status labels: draft, reviewed, and verified.
- Related concepts and a prerequisite trail.
- Estimated study time and interaction type.
- Recently viewed and completion state stored locally on the device.

Accounts, comments, instructor authoring, and cloud-synced progress are intentionally deferred until there is evidence they are needed.

## Shared design system scope

The chosen design direction should define:

- Semantic color tokens, including geometry, samples, fragments, depth, warnings, and focus.
- Typography for explanations, mathematical notation, labels, and numeric values.
- Spacing, borders, elevation, and responsive breakpoints.
- Standard visualization canvas, inspector, lesson outline, glossary, and control patterns.
- Motion durations and reduced-motion alternatives.
- Plot and diagram conventions: axes, grid lines, handles, selected items, legends, and color-independent state cues.
- Touch targets of at least 44 by 44 px, visible focus, and text contrast of at least 4.5:1.

Each concept may use a different composition, but it should use the shared tokens and interaction vocabulary.

## Quality gates for every lesson

A lesson is ready only when:

- A learner can state the core idea after following the guided path.
- Every control has an immediate and meaningful effect.
- The initial state communicates the concept without interaction.
- The math/model layer has tests for normal cases and important edge cases.
- The lesson cites its lecture source and clearly labels any added interpretation.
- Mouse, touch, and keyboard paths work.
- Focus, contrast, motion, and screen-reader labels pass accessibility checks.
- The layout works at 375, 768, 1024, and 1440 px widths.
- A useful state survives reload through the URL.
- Visual regression snapshots cover the default and at least one edge-case preset.
- A subject-matter review has marked it `verified` before it is presented as authoritative.

## Delivery phases

### Phase 0 - visual direction

Choose or combine the three prepared concepts: Quiet Lab, Dark Instrument, or Editorial Atlas. Confirm light/dark preference and the balance between guided narrative and free exploration.

### Phase 1 - foundation and design system

Initialize the application, encode the selected tokens, create the lesson and library shells, define schemas, and add the visualization generator and authoring guide.

### Phase 2 - Rasterization vertical slice

Build Rasterization Explorer end to end, including model tests, guided steps, presets, URL state, responsive behavior, and accessibility. Use lessons from this slice to refine the shared contract.

### Phase 3 - initial computer graphics set

Build the Graphics Pipeline Map, Clipping Lab, Viewport Transform, Winding/Culling, Drawing Order/Depth Test, and Frame Timing/Tearing. Add related-concept navigation as the graph grows.

### Phase 4 - growth tooling

Harden the content validator, source-reference workflow, visual regression suite, and reusable AI prompt/checklist. Add a second lecture chapter to prove the architecture generalizes.

### Phase 5 - optional platform features

Only after the content library has traction, evaluate cloud progress, personal notes, instructor collections, embeddable lessons, localization, and contribution review.

## Explicit non-goals for the first version

- A general no-code visualization builder.
- User accounts or a database.
- Automated ingestion that publishes unreviewed lecture content.
- A universal rendering engine.
- Social features, points, streaks, or leaderboards.
- Supporting every field before the initial authoring workflow is proven.

## Decisions needed before implementation

1. Select a visual direction or specify a blend.
2. Decide whether the default experience is light, dark, or follows the device.
3. Decide whether lessons primarily use a guided sequence, free exploration, or an easy switch between both.
4. Confirm whether this is initially a personal local tool or a public site intended for other students.
