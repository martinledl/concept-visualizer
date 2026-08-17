# AI Authoring Guide

This repository is designed to be extended with AI coding tools. Follow this guide whenever adding or changing a visualization.

## Non-negotiable product rules

- Teach one mental model per lesson.
- Make causality visible: each control must change something meaningful immediately.
- Keep source claims traceable to lecture pages or another named source.
- Separate deterministic concept logic from UI rendering.
- Do not add a universal visualization abstraction merely to reduce file count.
- Use shared colors, typography, controls, and teaching patterns from the design system.
- Support pointer, keyboard, and single-click alternatives to dragging.
- Preserve reduced-motion behavior, visible focus, and 44 by 44 px touch targets.
- Never publish an AI-generated explanation as verified without human subject review.

## Definition of a visualization package

A complete concept has:

- Metadata in `app/content/visualizations.ts`.
- A stable route under `app/learn/<slug>/`.
- A pure model module with initial state, state transitions, and serialization where useful.
- A client visualization component.
- A concise guided explanation and an explore mode when the concept benefits from both.
- Source slides, glossary terms, keyboard instructions, reset behavior, and meaningful presets.
- Unit tests for normal behavior and edge cases.

As more lessons are added, move each mature concept into `visualizations/<slug>/` with `meta.ts`, `model.ts`, `Visualization.tsx`, `presets.ts`, and `model.test.ts`. Do this when the second visualization is implemented, when the shared boundary is evident.

## Rendering choices

- Prefer semantic HTML and CSS for application layout.
- Use SVG for interactive geometry, axes, and a moderate number of marks.
- Use Canvas for dense pixel or particle work.
- Use WebGL only for real 3D interaction or scale that SVG and Canvas cannot support.
- Keep renderers local to lessons. Share teaching and control primitives, not low-level rendering assumptions.

## Change workflow

1. Read the relevant source material completely.
2. Write a teaching brief: misconception, manipulated variable, visible consequence, edge cases.
3. Implement or update the pure model and tests first.
4. Build the smallest complete interaction.
5. Add explanation, presets, responsive behavior, theme support, and accessibility.
6. Verify at 375, 768, 1024, and 1440 px.
7. Run `npm run check`.
8. Update `CHANGELOG.md` under `Unreleased`.

## Git conventions

- Branches: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`.
- Commits: Conventional Commits, for example `feat(rasterization): add edge-rule preset`.
- Pull requests should contain one coherent concept or platform change.
- Never mix a lesson implementation with unrelated formatting or dependency churn.
- Versions follow Semantic Versioning. See `CONTRIBUTING.md`.
