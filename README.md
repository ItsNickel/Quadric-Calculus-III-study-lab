# Quadric — Calculus III Study Lab

An interactive web application designed to help students study Calculus III by identifying, visualizing, and exploring 3D surfaces.

Built with **React, TypeScript, Three.js, React Three Fiber, Drei, KaTeX, Tailwind CSS, and Lucide React**.

No server, accounts, or API keys required.

**[Launch Quadric](https://itsnickel.github.io/Quadric-Calculus-III-study-lab/)**

---

## Features

### Surface Quiz
Test your ability to recognize 3D surfaces from randomly generated equations.

- Multiple-choice questions with four possible answers
- Randomized coefficients, orientations, and equations
- Progressive hints to help identify unfamiliar surfaces
- Instant feedback with detailed mathematical explanations
- Interactive 3D visualization revealed after answering
- Score, accuracy, and streak tracking

### Challenge Mode
Practice more difficult equations to prepare for exams.

- Translated and reoriented surfaces
- Standard and expanded equation forms
- No hints during questions
- Completion time tracking
- More challenging equation identification

### Surface Library
Explore common Calculus III surfaces and learn how to recognize them.

- Standard equations and mathematical properties
- Recognition tips and explanations
- Interactive 3D graphs
- Examples of different surface orientations

### Equation Explorer
Experiment with equations and observe how changes affect their 3D graphs.

- Adjust scales and translations
- Change the principal axis and opening direction
- View equations in standard or expanded form
- Watch 3D visualizations update in real time

### Progress Tracking
Monitor your performance and focus on areas that need improvement.

- Overall accuracy and question history
- Performance statistics by surface type
- Weakest-topic practice
- Review previous questions and their 3D graphs
- Reset progress when needed

Progress is saved locally in your browser using LocalStorage. No account is required.

---

## Interactive 3D Visualization

Quadric uses Three.js to render mathematical surfaces in an interactive 3D environment.

**Graph controls:**

| Action | Control |
|---|---|
| Rotate graph | Left-click and drag |
| Zoom | Scroll wheel or pinch |
| Pan | Right-click and drag |
| Reset camera | Press `R` |
| Change perspective | XY, XZ, YZ, or Isometric presets |

The viewer includes labeled coordinate axes, adjustable camera perspectives, and mathematically accurate surface geometry.

Open or infinite surfaces are displayed within a finite viewing window.

**Note:** A browser with WebGL support is required for 3D rendering.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `1`–`4` | Select a multiple-choice answer |
| `Enter` | Submit an answer or advance |
| `H` | Reveal a hint in Quiz Mode |
| `R` | Reset the 3D camera |

Keyboard shortcuts do not interfere with text inputs.

---

## Supported Mathematical Surfaces

Quadric includes 13 surface patterns commonly encountered in Calculus III.

| Category | Surface |
|---|---|
| Quadric | Sphere |
| Quadric | Ellipsoid |
| Quadric | Elliptic Paraboloid |
| Quadric | Hyperbolic Paraboloid |
| Quadric | Hyperboloid of One Sheet |
| Quadric | Hyperboloid of Two Sheets |
| Quadric | Elliptic Cone |
| Cylinder | Circular Cylinder |
| Cylinder | Elliptic Cylinder |
| Cylinder | Hyperbolic Cylinder |
| Cylinder | Parabolic Cylinder |
| Linear | Plane |
| Additional | Product Surface (`w = uv`) |

The product surface is mathematically a hyperbolic paraboloid and is also recognized as a saddle surface.

Equations can include randomized coefficients, translations, and orientations to provide a wider variety of practice problems.

---

## Running Locally

### Prerequisites

- Node.js 22.12+ or a compatible newer LTS version
- npm

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/ItsNickel/Quadric-Calculus-III-study-lab.git
```

**2. Navigate to the project directory**

```bash
cd Quadric-Calculus-III-study-lab
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

### Additional Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run test` | Run automated tests |
| `npm run build` | Build the production application |
| `npm run preview` | Preview the production build locally |

**Windows users:** If PowerShell blocks npm scripts because of execution policies, use `npm.cmd` instead of `npm`.

---

## Technical Overview

The application uses a structured mathematical model defined in `src/math.ts`.

Each generated surface contains information about its mathematical family, scale, position, orientation, opening direction, and equation format.

This shared model drives:

- Random equation generation
- Equation formatting
- Surface classification
- Mathematical explanations
- 3D mesh generation
- Equation validation

Using a common mathematical representation helps ensure that the displayed equation and its corresponding 3D graph remain consistent.

The application supports canonical and expanded equations, coordinate transformations, and parameterized surface geometry.

### Mathematical Accuracy

Automated tests cover:

- Surface classification and equation generation
- Coordinate translations and axis permutations
- Expanded polynomial equations
- Geometry sampling and mathematical consistency
- Disconnected surface components
- Answer grading and progress tracking

### Extending the Application

Additional surface types can be implemented by extending the mathematical definitions and corresponding generation, equation, geometry, and recognition functions in `src/math.ts`.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application logic |
| Vite | Development and build tooling |
| Three.js | 3D graphics rendering |
| React Three Fiber | React integration for Three.js |
| Drei | 3D visualization helpers and controls |
| KaTeX | Mathematical equation rendering |
| Tailwind CSS | Styling and responsive layouts |
| Lucide React | Icons |
| LocalStorage | Browser-based progress persistence |

---

## Data and Privacy

Quadric operates entirely in the browser.

- No user accounts or authentication
- No backend or database
- No API keys required
- No cloud-based progress tracking

Study progress is stored locally using browser LocalStorage. Clearing browser site data may erase saved progress, and progress does not automatically synchronize across devices.

---

## License

No license has been specified for this project.

---

Built to make Calculus III a little easier to visualize.

## Advanced Geometry extension

The navigation now includes **Advanced Geometry**: restricted surfaces, composite bounded solids, cylindrical/spherical regions, difficulty levels, reverse bounds questions, and independent progress/history. See [the Advanced Geometry guide](docs/advanced-geometry.md) for completed phases, mathematical conventions, architecture, tests, and renderer limitations.
