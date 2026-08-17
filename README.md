# Concept Visualizer

Concept Visualizer is an open-source library of interactive explanations for difficult concepts. It is organized by broad fields and topics so learners can explore ideas independently of any particular course or institution.

The project favors small, accurate visual models over decorative animation. Every lesson should let a learner change a meaningful variable, observe the result, and connect that result to a concise explanation.

## Current release

The current library includes:

- A searchable, field-and-topic based concept catalogue.
- Ten interactive computer graphics lessons.
- Guided and free-exploration learning modes.
- Pointer, touch, keyboard, sliders, toggles, and reset controls where appropriate.
- Light and dark themes saved on the device.
- Responsive catalogue and lesson layouts for phones, tablets, and desktops.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run check
```

This runs linting, mathematical model tests, and the production build.

## Architecture

- `app/content/visualizations.ts` is the library manifest.
- `app/content/foundation-lessons.ts` contains guided teaching content.
- `app/lib/` contains deterministic concept models and URL-state logic.
- `app/components/` contains catalogue and lesson interactions.
- `app/learn/[slug]` contains lesson routes.
- `design-system/concept-visualizer/MASTER.md` records shared visual decisions.
- `PROJECT_PLAN.md` contains the complete roadmap and visualization contract.
- `AGENTS.md` explains how AI coding tools should add concepts safely.

SVG is used for interactive coordinate geometry, Canvas should be used for pixel-heavy scenes, and WebGL should be introduced only where genuine 3D interaction requires it.

## Adding a concept

Before implementing a new lesson:

1. Inspect the relevant primary source material and diagrams.
2. Write one primary learning objective.
3. Identify the learner-controlled variable and its visible consequence.
4. Add validated metadata to the library manifest.
5. Keep mathematical state separate from rendering.
6. Include meaningful presets, reset behavior, keyboard alternatives, and source references.
7. Add unit tests for the model and edge cases.
8. Run `npm run check` before opening a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for the full workflow.

## Versioning

The project follows Semantic Versioning and Conventional Commits. Releases are represented by the `version` in `package.json`, an entry in `CHANGELOG.md`, and a matching Git tag such as `v0.1.0`.

```bash
npm run version:patch
npm run version:minor
npm run version:major
```

Do not run a version command until the changelog and release scope are ready, because `npm version` creates a Git commit and tag.

## Deployment

The public site is deployed with GitHub Pages.

The repository also includes `.github/workflows/pages.yml`. It builds and packages a separate static export with the correct project-site paths, then deploys `dist/client` whenever `main` changes.

To enable it once:

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Push `main`, or manually run **Deploy GitHub Pages** from the Actions tab.

The resulting project URL is `https://martinledl.github.io/concept-visualizer/`.

## License

MIT. Lecture material remains the property of its respective author or institution; this repository stores original explanations and code, not copies of the source slides.
