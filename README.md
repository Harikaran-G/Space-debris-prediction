# 🛰️ Orbital Space Debris & Conjunction Assessment Tracker

A high-fidelity 3D WebGL aerospace command center for monitoring active satellites, debris fragments, rocket bodies, and predicting real-time conjunction encounters using live CelesTrak ephemeris data.

---

## 🚀 Live Working Model (Zero Mock Data)

- **Live Telemetry Stream**: Connects to official **CelesTrak GP REST API** (`https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=json`) in real-time.
- **Dynamic Astrodynamics Engine**: Computes 3D Cartesian ECI state vectors, velocity vectors, altitude, period, and sub-satellite coordinates directly from live Keplerian orbital elements ($a, e, i, \Omega, \omega, M$).
- **Live Conjunction Screener**: Automatically performs spatial proximity screening across all active objects to detect close approaches ($\text{miss distance} < 50\text{ km}$), calculate relative velocities ($\Delta v$), time-to-closest-approach (TCA), and ML collision probabilities.
- **Persistent Storage**: All imported CSV/Excel data and live telemetry automatically persist across browser refreshes via structured `localStorage` cache.
- **Dynamic Alert Center**: Real-time operational alert triggering with workflow investigation status management.
- **Maneuver Simulator**: Delta-V orbital maneuver planning for conjunction mitigation.

---

## 🐳 Running with Docker

You can launch the entire application in a containerized environment with a single command:

### 1. Build and Run Container
```bash
docker compose up --build
```

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Stop Container
```bash
docker compose down
```

---

## 🛠️ Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Build production bundle
npm run build
```

---

## 📁 Clean Developer Folder Structure

All features, components, and services are strictly folderized with clean barrel index exports. See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for full architectural documentation:

```
src/
├── components/             # Modular UI Components (Folderized by Domain)
│   ├── 3d/                 # Three.js 3D Earth, Orbits & ECI Trajectory canvas
│   ├── alerts/             # Real-time conjunction warning & triage center
│   ├── analytics/          # Risk distribution, population trends & telemetry KPIs
│   ├── conjunctions/       # Conjunction screening, close approach & risk assessment
│   ├── dashboard/          # Mission control KPI cards & executive risk charts
│   ├── debris/             # Space object catalog, CSV/Excel ingestion & export
│   ├── groundtrack/        # 2D Mercator sub-satellite ground track visualizer
│   ├── layout/             # Header, dynamic Sidebar & Footer chrome
│   ├── ml/                 # Machine Learning model architecture & evaluation metrics
│   ├── object-detail/      # Object deep-dive drawer & full telemetry view
│   ├── orbital/            # 3D canvas viewport & orbit filter controls
│   ├── settings/           # System settings, data purging & API configurations
│   ├── simulation/         # Orbital delta-V maneuver what-if simulator
│   └── index.ts            # Master barrel export for all components
├── services/               # Data & Machine Learning business logic
│   ├── dataService.ts      # Astrodynamics engine, CelesTrak API, CSV parser & localStorage
│   ├── mlService.ts        # Collision risk scoring, feature weights & SHAP calculations
│   └── index.ts            # Barrel export for services
├── types/                  # Strict TypeScript data contracts & enums
│   └── index.ts            # SpaceObject, Conjunction, Alert, RiskLevel types
├── App.css                 # Global theme variables & custom glassmorphism styles
├── App.tsx                 # Main application state orchestrator & view router
├── index.css               # Tailwind directives & typography presets
└── main.tsx                # React 18 application entry point
```
