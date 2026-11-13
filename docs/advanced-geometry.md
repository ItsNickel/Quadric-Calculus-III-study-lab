# Advanced Geometry

Open **Advanced Geometry** in navigation (`#Advanced%20Geometry`). The existing 13 surface types, Quiz, Challenge, Learn, Explorer, and original progress are preserved.

All three requested implementation phases are complete within this supported scope:

| Phase | Implemented |
| --- | --- |
| 1: Restricted surfaces | Half/quarter lateral cylinders, upper hemispherical surfaces, axially clipped paraboloids, and upper cone nappes/frusta. Coordinate half-spaces, translations, and cyclic axis orientations restrict the actual mesh. No caps are added to surface patches. |
| 2: Composite and coordinate regions | Solid cylinders, paraboloid/plane solids, two-paraboloid lenses, spherical caps and hemispheres, coaxial cylinder–sphere intersections, and cylinders clipped by sloped planes. Cylindrical sectors, annuli, cone/plane solids, bands between cones or paraboloids; spherical hemispheres, wedges, shells, and sectors inside cones. Three difficulty levels. |
| 3: Study and inspection tools | Reverse identification of cylindrical bounds; colored boundary components, independent visibility, full-boundary restore, opacity, boundary-edge highlights, keyboard shortcuts, separate accuracy by five categories, and persistent attempt review. |

The 20 region families vary radii, heights, height-law coefficients, angular intervals, and applicable positions/orientations. Intermediate focuses on single restrictions and simple solids; Hard adds intersections, shells, and coordinate bounds; Exam Challenge adds sloped clipping, curved intersections, and simultaneous radial/angular restrictions. Reverse questions progress from cylinder sectors to annular sectors and regions between paraboloids. Their radial and axial dimensions are supplied explicitly; the angular cut is read from the displayed mesh.

Forward questions hide the viewer until submission. Reverse questions intentionally show the graph first. Use **1–4** to select, **Enter** to check/advance, and **R** to reset the visible camera. Select difficulty or question type to start a new question. Open **Progress** to see category accuracy and review saved advanced attempts. Advanced history and original quiz history have independent reset controls.

## Coordinate convention and geometry

Cylindrical coordinates use `x = r cos θ`, `y = r sin θ`. Spherical coordinates use `x = ρ sin φ cos θ`, `y = ρ sin φ sin θ`, `z = ρ cos φ`, with φ measured **downward from positive z**. Standard cylindrical/spherical questions use world coordinates. Translated/reoriented Cartesian questions explicitly define local `(u,v,w)`; `w` follows the selected axis. Angular intervals can cross `2π`; endpoints remain included.

Equalities select surfaces; inequalities select filled regions. Solid meshes depict the actual boundary, including planar cuts and caps where applicable. Lower and upper curved boundaries are restricted to their shared valid domain. Two paraboloids meet at a derived circle; the renderer does not draw either complete paraboloid beyond it. Feedback explains that intersection and each original constraint.

## Architecture

- `src/advanced/model.ts`: typed radial-height and spherical bounds, coordinate transforms, membership tests, and validation.
- `generate.ts`: valid region construction and difficulty pools, without equation parsing or arbitrary mesh unions.
- `display.ts`: KaTeX constraint systems, frame definitions, interpretations, and feedback.
- `geometry.ts`: constrained boundary patches. Caps are absent only for surface questions or collapsed boundaries.
- `question.ts`: structured correct/distractor regions and grading. Distractors change actual restrictions, classification, or frame. Answer text does not determine correctness.
- `progress.ts`: `quadric-advanced-progress-v1`, separate from `quadric-progress-v1`. Scores, streaks, times, category performance, and history are derived from attempts. Resetting one dataset leaves the other intact.
- `Advanced.tsx`: quiz, reverse questions, feedback, dashboard, and review. Both original and advanced modes share `MathBlock` and `Viewer`.

Run `npm test` and `npm run build` (or `npm.cmd` on restricted PowerShell). Tests cover all original surface families and advanced boundary equations/membership, intersection rims, angular endpoints/wrap, translations, spherical conversion, thin sectors, invalid bounds, unique forward/reverse choices, separate persistence, reveal behavior, viewer controls, and original-mode navigation. DOM tests mock WebGL and check application state rather than GPU rendering.

## Limits and intentionally unsupported extensions

- The engine supports analytic region families. It is not general CSG, a free-form inequality parser, or a solver for arbitrary rotated/off-center intersections. Cylinder–sphere questions share a center and axis.
- Curves are sampled into triangles. Sampled vertices satisfy the boundary equations; flat triangle interiors approximate curvature. Very thin regions can be difficult to see. No volumetric ray marching or interior tetrahedral mesh is used.
- Edge highlights trace patch perimeters, including intersection rims and parameter seams. They are not a general intersection-curve extraction algorithm.
- Reverse questions currently cover cylindrical-coordinate regions. General spherical and Cartesian reverse questions remain optional future extensions.
- Validation checks basic bounds and samples height ordering. The shipped generators guarantee validity by analytic construction and regression tests; the validator is not a symbolic proof system for arbitrary height laws.
- A real WebGL browser is needed to visually inspect lighting, transparency, and touch gestures. DOM tests do not replace GPU/browser visual verification.

No backend or deployment change is needed. Relative Vite paths, hash navigation, and the existing GitHub Actions workflow continue to support GitHub Pages repository subpaths.
