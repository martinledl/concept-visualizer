# Concept Visualizer Design System

This is the product-wide source of truth. Page-specific files under `pages/` may override it only when a concept genuinely needs a different composition; they must keep the same semantic tokens and interaction vocabulary.

## Direction

**Quiet Lab**: a calm, precise learning workspace with Swiss-style structure, generous room around the visualization, restrained color, and minimal chrome. Borrow Editorial Atlas's inline annotation and glossary patterns without its expressive serif typography.

Design dials:

- Variance: 3/10 - centered and disciplined.
- Motion: 4/10 - short feedback and spatial continuity only.
- Density: 5/10 - readable explanations with capable inspection panels.
- Light and dark themes have equal status.

## Principles

1. The visualization is the largest and most prominent element on a lesson page.
2. Explanations stay adjacent to the state they explain.
3. Color communicates category, but never carries meaning alone.
4. Controls are visible, labeled, and immediately responsive.
5. Decorative effects never compete with the concept.
6. Guided and explore modes share the same model state.
7. Public navigation is organized by durable fields and topics, never by a specific course syllabus.

## Color tokens

### Light

| Role | Value | Purpose |
| --- | --- | --- |
| Page | `#F6F7F5` | Quiet neutral backdrop |
| Surface | `#FFFFFF` | Panels and visualization frame |
| Soft surface | `#F0F2EF` | Secondary controls and plot field |
| Ink | `#151B26` | Primary text |
| Soft ink | `#53606F` | Explanations |
| Border | `#DFE3E1` | Structure |
| Primary | `#315BE8` | Navigation, focus, active modes |
| Primary soft | `#E8EDFF` | Selected instructional state |
| Geometry | `#ED6A4A` | Primitive boundaries and vertices |
| Success | `#247A59` | Ready and verified states |

### Dark

| Role | Value | Purpose |
| --- | --- | --- |
| Page | `#0D1117` | Low-glare backdrop |
| Surface | `#131922` | Panels and visualization frame |
| Soft surface | `#19212C` | Secondary controls and plot field |
| Ink | `#EEF2F7` | Primary text |
| Soft ink | `#AAB4C0` | Explanations |
| Border | `#2A3441` | Structure |
| Primary | `#7F9CFF` | Navigation, focus, active modes |
| Primary soft | `#202D55` | Selected instructional state |
| Geometry | `#FF8B70` | Primitive boundaries and vertices |
| Success | `#61C99B` | Ready and verified states |

Future lessons should reserve additional semantic colors for samples, fragments, depth, warnings, and comparison states. Check accessible contrast against both themes before adding a token.

## Typography

- Family: Geist Sans for all interface and learning text.
- Numeric and coordinate data: Geist Mono.
- Body: 16px minimum for narrative content, 1.5 or greater line height.
- Labels: 10-12px only for short metadata, paired with sufficient contrast and spacing.
- Headings: compact sans-serif with restrained negative tracking.
- Mathematical notation may use KaTeX's math fonts; do not introduce a decorative display typeface.

## Layout

- Marketing/library maximum width: 1240-1380px.
- Lesson desktop: outline, flexible visualization workspace, explanation/inspector.
- Below 1180px: explanation moves beneath the workspace.
- Below 820px: outline becomes a compact horizontal step selector.
- No fixed-width element may force horizontal scrolling at 375px.

## Components

### Buttons

- Minimum target: 44 by 44px, except visibly grouped compact controls that still preserve a 40px minimum.
- Radius: 8-9px.
- Primary actions use the primary token; geometry actions may use the geometry token.
- Hover changes color or border, never layout dimensions.
- Disabled states remain legible and visibly inactive.

### Panels and cards

- 1px semantic border, 11-16px radius.
- Shadows are reserved for available/interactive surfaces and overlays.
- Avoid stacking cards inside cards when a divider provides enough hierarchy.

### Visualization surfaces

- Always include an accessible title and description.
- Label axes, units, sample rules, and model simplifications.
- Geometry is coral; navigation and selected teaching state are blue.
- Handles have a visible hit area larger than the rendered point.
- Dragging must have keyboard and single-click alternatives.

### Inspector

- Guided mode prioritizes explanation, key terms, and one timely caveat.
- Explore mode prioritizes live values and direct manipulation.
- Values use monospace and align consistently.

## Motion

- Standard feedback: 160-220ms.
- Motion must explain state or improve continuity.
- Never autoplay learning steps.
- Respect `prefers-reduced-motion` and render the complete final state without transitional dependence.

## Accessibility checklist

- Text contrast is at least 4.5:1.
- Every interactive item has a visible focus indicator.
- Pointer targets are at least 44 by 44px when independently placed.
- Drag interactions provide keyboard and button alternatives.
- Toggle state is exposed with `aria-checked` or `aria-pressed`.
- Visualization meaning does not rely on color alone.
- Test 375, 768, 1024, and 1440px widths.
- No content sits under the header or creates unintended horizontal scroll.

## Avoid

- Decorative serif typography.
- Purple AI-product clichés, gradients, glow, or glassmorphism.
- Generic dashboard card walls.
- Hover-only explanations.
- Dense tool chrome in guided mode.
- Emoji icons or mixed icon families.
- Animation without reduced-motion behavior.
