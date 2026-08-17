# Contributing

A useful contribution makes a difficult idea easier to inspect through a concrete example.

## Before you start

Open an issue for a new lesson or a large interaction change. Include the concept, primary source, learning question, concrete input, and visible result.

Do not commit copyrighted slide decks or copied diagrams. Cite the source and create an original model and explanation.

## Workflow

1. Fork the repository and create a focused branch such as `feat/clipping-lab`.
2. Install dependencies with `npm install` and run `npm run dev`.
3. Follow the lesson contract in `README.md` and `AGENTS.md`.
4. Add tests for the model and important edge cases.
5. Add a short entry under `Unreleased` in `CHANGELOG.md`.
6. Run `npm run check` before opening a pull request.

## Commits

Use Conventional Commits:

```text
feat(rasterization): add multisample preset
fix(theme): preserve dark mode before hydration
docs(authoring): clarify source review
test(clipping): cover boundary intersections
```

## Pull requests

Explain the learning problem, source, keyboard and touch behavior, and checks you ran. Include screenshots or a short recording for visible changes. Keep the change small enough to review accurately.

## Releases

The project uses Semantic Versioning. A patch fixes or refines existing behavior, a minor release adds a compatible lesson or capability, and a major release changes a public contract incompatibly.
