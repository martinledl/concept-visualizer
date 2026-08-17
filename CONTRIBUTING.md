# Contributing

Thanks for helping make difficult concepts easier to understand.

## Before starting

Open an issue for a new visualization or a substantial interaction change. Include the concept, intended source, primary learning objective, and the misconception or question the visualization should resolve.

For lecture-derived work, do not commit copyrighted slide decks or copied diagrams. Cite the source and create an original implementation and explanation.

## Development workflow

1. Fork the repository and create a focused branch such as `feat/clipping-lab`.
2. Install dependencies with `npm install`.
3. Run the site with `npm run dev`.
4. Follow `AGENTS.md` and the visualization contract in `PROJECT_PLAN.md`.
5. Add tests for mathematical or state-model behavior.
6. Add a concise entry under `Unreleased` in `CHANGELOG.md`.
7. Run `npm run check` before opening a pull request.

## Commit format

Use Conventional Commits:

```text
feat(rasterization): add multisample preset
fix(theme): preserve dark mode before hydration
docs(authoring): clarify source review process
test(clipping): cover boundary intersection cases
```

Use `feat` for user-visible capability, `fix` for defects, `docs` for documentation, `test` for tests, `refactor` for behavior-preserving structure changes, and `chore` for maintenance.

## Pull request expectations

- Explain the learning problem, not only the code change.
- Include the source and relevant page or slide numbers.
- Describe keyboard and touch behavior.
- Include screenshots or a short recording for visible changes.
- State which checks were run.
- Keep the change focused enough to review accurately.

## Releases

Maintainers use Semantic Versioning:

- Patch: fixes and small compatible teaching improvements.
- Minor: new visualizations or substantial compatible capabilities.
- Major: incompatible content-schema or public API changes.

Before a release, move relevant `Unreleased` notes into a dated version section, run `npm run check`, then use the matching `npm run version:*` command. Push the commit and tag together.
