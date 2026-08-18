# Concept Visualizer

Concept Visualizer is an open-source library of interactive lessons for difficult ideas. Each lesson starts with a concrete example, applies one named operation at a time, and keeps the result visible while you experiment.

The catalogue is organized by field and topic, not by school, course, or textbook. It currently covers computer graphics and signal processing.

## Catalogue

| Topic | Lesson | What you can do |
| --- | --- | --- |
| Pipeline and coordinates | Render a Tiny Scene | Follow a triangle and quad from local vertices to fragments |
| Pipeline and coordinates | Clipping | Move a triangle through a view boundary |
| Pipeline and coordinates | Viewport Transform | Map an NDC point to a pixel coordinate |
| Geometry and models | Winding and Culling | Reverse face indices and inspect the culling decision |
| Geometry and models | OBJ Meshes | Connect face records to a small mesh |
| Rasterization and visibility | Rasterization | Move triangle vertices across a pixel grid |
| Rasterization and visibility | Depth Testing | Change surface depth and inspect the winning fragment |
| Rasterization and visibility | Z-Fighting | Compare real depth gaps with stored depth buckets |
| Images and display | Image Buffers | Change pixel encoding and calculate memory use |
| Images and display | Frame Timing | Compare application rendering with display scanout |

### Signal processing

| Topic | Lesson | What you can do |
| --- | --- | --- |
| Signals and sampling | Digital Signals | Sample and quantize a continuous wave |
| Signals and sampling | Sampling and Aliasing | Cross the Nyquist limit and inspect the resulting alias |
| Systems and filters | Convolution | Build each output sample from overlap products |
| Systems and filters | FIR and IIR Filters | Compare feedforward and feedback filters |
| Systems and filters | Transfer Functions | Sweep a sinusoid through two frequency responses |
| Frequency analysis | Sinusoids | Connect a waveform to its complex phasor |
| Frequency analysis | Fourier and DFT | Mix tones, compute their spectrum, and expose leakage |

## Run locally

Use Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run the full quality gate with:

```bash
npm run check
```

This runs linting, unit tests, and the production build.

## How the project is organized

```text
app/
  components/                 catalogue and lesson interfaces
  content/visualizations.ts   public catalogue metadata
  content/foundation-lessons.ts
                              guided copy for shared lessons
  components/signal/          signal plots and lesson interfaces
  content/signal-lessons.ts   signal-processing route registry
  learn/[slug]/               stable lesson routes
  lib/                        deterministic concept models
tests/                        model and edge-case tests
design-system/                shared visual and interaction rules
public/                       static assets
.github/workflows/pages.yml   GitHub Pages deployment
```

`AGENTS.md` contains the rules for AI coding tools. `CONTRIBUTING.md` covers branches, commits, and pull requests. `PROJECT_PLAN.md` keeps the short product roadmap.

## Lesson contract

A lesson should make this chain easy to follow:

```text
concrete input -> named operation -> visible result
```

The same state must drive the picture, live values, and explanation. A finished lesson also needs:

- One clear learning goal and a useful default state.
- A short guided path plus room to experiment when useful.
- A pure model separated from rendering code.
- Controls that cause an immediate, explainable change.
- Reset behavior, keyboard support, touch-friendly targets, and light and dark themes.
- Tests for normal cases and important edge cases.
- A named source and human review before factual claims are marked as verified.

## Add a concept

1. Choose one misconception or question the lesson should resolve.
2. Read the primary source and write a short teaching brief.
3. Define the input, operation, visible result, and two or three useful experiments.
4. Add catalogue metadata in `app/content/visualizations.ts`.
5. Build and test the pure model in `app/lib/`.
6. Add a focused lesson component, or use a shared explorer when its structure fits naturally.
7. Check 375, 768, 1024, and 1440 px widths, both themes, keyboard use, and reduced motion.
8. Update `CHANGELOG.md` and run `npm run check`.

Do not publish copied lecture diagrams or large excerpts. Cite the source internally and write an original explanation.

## Versioning and deployment

The project uses Semantic Versioning and Conventional Commits. GitHub Actions deploys `main` to GitHub Pages after a successful build. Enable it under **Settings > Pages > Build and deployment > GitHub Actions**.

Public URL: `https://martinledl.github.io/concept-visualizer/`

## License

[MIT](LICENSE). Source material remains the property of its authors and institutions.
