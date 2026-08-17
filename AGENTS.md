# AI authoring guide

Use this guide whenever an AI coding tool adds or changes a lesson.

## Teaching contract

Every lesson must show a concrete input, a named operation, and a visible result. The picture, live values, and explanation must come from the same state.

- Teach one mental model at a time.
- Let every control change something meaningful immediately.
- Use a real example instead of a decorative diagram.
- Explain what the operation does in plain language.
- Give the learner a useful experiment or edge case to try.
- Keep deterministic concept logic separate from rendering.
- Do not force unrelated lessons into one rendering abstraction.
- Never present AI-written factual content as verified without human subject review.

## A complete lesson

A contribution needs:

- Catalogue metadata and a stable route.
- A short guided sequence and direct exploration when useful.
- A pure model with tests for normal and edge cases.
- Live values that expose the calculation or decision.
- Reset behavior and meaningful defaults.
- Pointer, keyboard, and single-click alternatives to dragging.
- Visible focus, reduced-motion support, and touch targets of at least 44 by 44 px.
- Source notes kept out of the public course structure.

Create a dedicated folder under `visualizations/<slug>/` when a lesson needs several local files or a custom renderer. Share design tokens, teaching patterns, and controls. Keep lesson-specific drawing logic local.

## Rendering choices

- Use semantic HTML and CSS for the application shell.
- Use SVG for interactive geometry and diagrams.
- Use Canvas for dense pixel or particle work.
- Use WebGL only when real 3D interaction or scale requires it.

## Workflow

1. Read the relevant source material.
2. Write the learning question, input, operation, result, and edge cases.
3. Implement the model and tests first.
4. Build the smallest complete interaction.
5. Add concise copy, responsive behavior, theme support, and accessibility.
6. Check 375, 768, 1024, and 1440 px widths.
7. Run `npm run check`.
8. Update `CHANGELOG.md` under `Unreleased`.

## Git

- Use focused branches such as `feat/clipping-lab` or `fix/theme-toggle`.
- Use Conventional Commits, such as `feat(rasterization): add edge-rule preset`.
- Keep each pull request to one coherent lesson or platform change.
- Avoid unrelated formatting or dependency churn.
- Follow Semantic Versioning as described in `CONTRIBUTING.md`.
