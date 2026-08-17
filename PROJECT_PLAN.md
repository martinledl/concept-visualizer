# Project plan

## Product direction

Concept Visualizer should feel like a clear interactive textbook. It is a public catalogue organized by durable fields and topics, not by a particular school or syllabus.

Each lesson follows one practical example from input to result. Learners can change meaningful variables, inspect the underlying values, and understand what each operation does.

## Current foundation

- A responsive catalogue with field, topic, and search filters.
- Ten computer graphics lessons.
- Shared light and dark design tokens.
- Deterministic TypeScript models with unit tests.
- Static deployment through GitHub Pages.
- Contributor and AI authoring rules.

## Next priorities

1. Add URL state sharing to every lesson that benefits from it.
2. Add automated responsive and accessibility checks.
3. Move complex lessons into self-contained concept packages as their boundaries become clear.
4. Add a second subject area to test whether the catalogue and authoring workflow generalize.
5. Add content validation for metadata, routes, and source review status.

Accounts, social features, gamification, and a universal visualization builder remain out of scope until there is a clear need.

## Release gate

A lesson is ready when its input, operation, and result are obvious; every control has a visible effect; its model tests pass; keyboard and touch paths work; both themes are readable; and the layout works at 375, 768, 1024, and 1440 px.
