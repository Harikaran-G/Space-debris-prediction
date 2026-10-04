# 📁 Project Directory & Architecture Guide

Welcome to the **Orbital Space Debris & Conjunction Assessment Tracker** codebase. This guide explains how the project is folderized, where components and services live, and how developers can navigate and extend the system.

---

## 🗂️ High-Level Directory Layout

```
dharshanaa/
├── .agents/                    # Agent & skill configuration rules
├── public/                     # Static assets (Earth textures, icons, manifest)
├── src/                        # Core Application Source Code
│   ├── assets/                 # SVGs and static image assets
│   ├── components/             # Modular UI Components (Folderized by Domain)
│   │   ├── 3d/                 # Three.js 3D Earth, Orbits & ECI Trajectory canvas
│   │   ├── alerts/             # Real-time conjunction warning & triage center
│   │   ├── analytics/          # Risk distribution, population trends & telemetry KPIs
│   │   ├── conjunctions/       # Conjunction screening, close approach & risk assessment
│   │   ├── dashboard/          # Mission control KPI cards & executive risk charts
│   │   ├── debris/             # Space object catalog, CSV/Excel ingestion & export
│   │   ├── groundtrack/        # 2D Mercator sub-satellite ground track visualizer
│   │   ├── layout/             # Header, dynamic Sidebar & Footer chrome
│   │   ├── ml/                 # Machine Learning model architecture & evaluation metrics
│   │   ├── object-detail/      # Object deep-dive drawer & full telemetry view
│   │   ├── orbital/            # 3D canvas viewport & orbit filter controls
│   │   ├── settings/           # System settings, data purging & API configurations
│   │   ├── simulation/         # Orbital delta-V maneuver what-if simulator
│   │   └── index.ts            # Master barrel export for all components
│   ├── services/               # Data & Machine Learning business logic
│   │   ├── dataService.ts      # Astrodynamics engine, CelesTrak API, CSV parser & localStorage
│   │   ├── mlService.ts        # Collision risk scoring, feature weights & SHAP calculations
│   │   └── index.ts            # Barrel export for services
│   ├── types/                  # Strict TypeScript data contracts & enums
│   │   └── index.ts            # SpaceObject, Conjunction, Alert, RiskLevel types
│   ├── App.css                 # Global theme variables & custom glassmorphism styles
│   ├── App.tsx                 # Main application state orchestrator & view router
│   ├── index.css               # Tailwind directives & typography presets
│   └── main.tsx                # React 18 application entry point
├── Dockerfile                  # Multi-stage production Nginx container build
├── docker-compose.yml          # Container orchestration (Port 3000)
├── nginx.conf                  # Production SPA reverse proxy with gzip compression
├── package.json                # Project dependencies & build scripts
├── tailwind.config.js          # IN PIECES dark-theme palette & custom utilities
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite bundling & asset pipeline configuration
```

---

## 🧩 Component Subfolder Breakdown

Each folder in `src/components/` is dedicated to a distinct functional domain with its own `index.ts` barrel export:

| Folder | Primary Component | Description |
| :--- | :--- | :--- |
| **`3d/`** | `OrbitalCanvas.tsx` | High-fidelity WebGL 3D Earth with lighting, atmosphere, starfield, and orbital trajectory splines. |
| **`alerts/`** | `AlertCenter.tsx` | Conjunction alerting console with triage status (`New`, `Investigating`, `Dismissed`). |
| **`analytics/`** | `AnalyticsPage.tsx` | Historical trend lines, altitude density histograms, and risk breakdowns. |
| **`conjunctions/`** | `CollisionPredictionPage.tsx` | Detailed close approach screening, miss distance vectors, and collision probability. |
| **`dashboard/`** | `KpiCards.tsx`, `CriticalConjunctions.tsx`, etc. | Executive mission control dashboard summarizing active orbital threats. |
| **`debris/`** | `DebrisTable.tsx` | Sortable and filterable table of all orbital objects with CSV/Excel import/export. |
| **`groundtrack/`** | `GroundTrackMap.tsx` | 2D Mercator world map plotting real-time sub-satellite tracks and footprints. |
| **`layout/`** | `Header.tsx`, `Sidebar.tsx`, `Footer.tsx` | Responsive shell navigation with dynamic state-based alert indicators. |
| **`ml/`** | `MLModelPage.tsx` | Random Forest / Gradient Boosting model evaluation metrics, ROC curves, and SHAP explainability. |
| **`object-detail/`** | `ObjectDetailsDrawer.tsx`, `ObjectDetailsView.tsx` | Detailed telemetry inspect panel for any selected satellite or debris piece. |
| **`orbital/`** | `OrbitalMapControls.tsx` | Filter bar for 3D canvas (Regime: LEO/MEO/GEO, Object Type, Time offset). |
| **`settings/`** | `SettingsPage.tsx` | User preferences, catalog purging, storage management, and cache controls. |
| **`simulation/`** | `WhatIfSimulator.tsx` | Interactive $\Delta v$ thruster burn planning to test conjunction avoidance maneuvers. |

---

## ⚡ Services Architecture (`src/services/`)

### 1. `dataService.ts`
- **Orbital Mechanics**: Calculates 3D Cartesian coordinates $(x, y, z)$ from Keplerian orbital elements $(a, e, i, \Omega, \omega, \nu)$.
- **Live Ingestion**: Directly fetches live Two-Line Element sets and General Perturbation records from **CelesTrak**.
- **Proximity Screener**: Calculates close encounters, relative velocity ($\text{km/s}$), and radial/in-track/cross-track miss distances.
- **Persistence (`localStorage`)**: Saves imported CSVs, Excel files, and custom objects to the browser's persistent store across page reloads.

### 2. `mlService.ts`
- Computes collision risk probability using orbital altitude density, miss distance, approach velocity, and object cross-sectional area.
- Generates SHAP (SHapley Additive exPlanations) values to explain why an encounter is flagged as `Critical`, `High`, `Medium`, or `Low`.

---

## 🎨 Clean Import Syntax for Developers

With the barrel export structure, you can import components and services with clean, short paths:

```typescript
// Components
import { Header, Sidebar, Footer } from '@/components/layout';
import { OrbitalCanvas } from '@/components/3d';
import { KpiCards, CriticalConjunctions } from '@/components/dashboard';
import { DebrisTable } from '@/components/debris';

// Services & Models
import { dataService, mlService } from '@/services';

// Data Types
import { SpaceObject, Conjunction, AlertItem } from '@/types';
```

---

## 🚀 Development Workflow

```bash
# Start Vite Development Server
npm run dev

# Run TypeScript Validation & Production Build
npm run build

# Run via Docker
docker compose up --build
```
