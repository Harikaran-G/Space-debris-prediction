# 🌐 API Documentation & Customization Guide

This document explains the telemetry API used in the **Orbital Space Debris Tracker**, where it is configured, and how to change or extend it.

---

## 🛰️ 1. Currently Configured API

The application connects to the official **CelesTrak General Perturbations (GP) REST API**:

- **Current Endpoint**:
  ```
  https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=json
  ```
- **Provider**: CelesTrak / NORAD (North American Aerospace Defense Command)
- **Authentication**: Free, public, open-access (no API key required)
- **Response Format**: JSON array of General Perturbation orbital records
- **Data Attributes Provided**:
  - `OBJECT_NAME`: Spacecraft / debris designation (e.g. `ISS (ZARYA)`, `COSMOS 2251 DEB`)
  - `NORAD_CAT_ID`: NORAD catalog satellite identification number
  - `OBJECT_TYPE`: `PAYLOAD`, `ROCKET BODY`, or `DEBRIS`
  - `MEAN_MOTION`: Revolutions per day (used to derive semi-major axis $a$)
  - `ECCENTRICITY`: Orbital eccentricity ($e$)
  - `INCLINATION`: Orbital inclination angle in degrees ($i$)
  - `RA_OF_ASC_NODE`: Right Ascension of Ascending Node ($\Omega$)
  - `ARG_OF_PERICENTER`: Argument of Perigee ($\omega$)
  - `MEAN_ANOMALY`: Mean Anomaly at epoch ($M$)
  - `EPOCH`: UTC timestamp of the orbital state vector

---

## 📍 2. File Location in Codebase

The API fetch call is located in:
📂 `src/services/dataService.ts` (inside the `fetchLiveTelemetry()` method):

```typescript
// Path: src/services/dataService.ts
async fetchLiveTelemetry(): Promise<SpaceObject[]> {
  const response = await fetch(
    'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=json',
    { signal: controller.signal }
  );
  // ...
}
```

---

## 🔄 3. How to Change or Customize the API

### Option A: Change CelesTrak Target Satellite Group
You can switch the `GROUP=` query parameter to pull different subsets of orbital objects:

| Satellite Category | Endpoint URL |
| :--- | :--- |
| **100 (Brightest Visual Objects)** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=json` *(Current Default)* |
| **Active Satellites** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json` |
| **Starlink Mega-Constellation** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json` |
| **Space Stations (ISS, Tiangong)** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json` |
| **Cosmos 2251 Collision Debris** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=1993-036&FORMAT=json` |
| **Fengyun-1C Anti-Satellite Debris** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=1999-025&FORMAT=json` |
| **GNSS / GPS Navigation Satellites** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=json` |
| **Weather & Earth Observation** | `https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=json` |

---

### Option B: Connect to a Custom Backend Server
If you develop your own backend API (Python FastAPI, Node.js, Express, Go, etc.) to stream satellite telemetry:

1. Update the fetch URL in `src/services/dataService.ts`:
   ```typescript
   const response = await fetch('http://localhost:8000/api/v1/telemetry/live', {
     signal: controller.signal
   });
   ```

2. Expected JSON response schema:
   ```json
   [
     {
       "OBJECT_NAME": "SAT-01",
       "NORAD_CAT_ID": 25544,
       "OBJECT_TYPE": "PAYLOAD",
       "MEAN_MOTION": 15.5,
       "ECCENTRICITY": 0.0001,
       "INCLINATION": 51.64,
       "RA_OF_ASC_NODE": 120.5,
       "ARG_OF_PERICENTER": 45.2,
       "MEAN_ANOMALY": 75.0,
       "EPOCH": "2026-10-04T12:00:00.000Z"
     }
   ]
   ```

---

### Option C: Use Environment Variables (`.env`)
To make the API configurable per deployment environment without editing source code:

1. Create a `.env` file in the root directory:
   ```env
   VITE_CELESTRAK_API_URL=https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=json
   ```

2. In `src/services/dataService.ts`:
   ```typescript
   const API_URL =
     import.meta.env.VITE_CELESTRAK_API_URL ||
     'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=json';

   const response = await fetch(API_URL, { signal: controller.signal });
   ```
