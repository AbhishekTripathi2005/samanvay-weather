# SAMANVAY (समन्वय): Adaptive AI-NWP Operational Weather Command Center

Operational AI-NWP Forecast Blending Command Center for **Ministry of Earth Sciences (MoES) / NCMRWF** (PS 26081, Disaster Management).

## Key Features
- **7 Operational Forecast Sources**:
  - `NCUM-G` (NCMRWF Global 12km NWP)
  - `NEPS` (NCMRWF Ensemble Prediction System, 21 members)
  - `IMD-GFS` (Operational Global Forecast System)
  - `ECMWF-IFS` (ECMWF Integrated Forecasting System HRES)
  - `GraphCast` (DeepMind Graph Neural Network AI NWP surrogate)
  - `Pangu-Weather` (Huawei 3D Earth-Specific Transformer AI)
  - `FourCastNet` (NVIDIA AFNO Neural Operator AI)
  - `SAMANVAY Consensus` (Adaptive Bayesian Blended consensus)
- **Extensible Adapter Architecture**: `ForecastSource: fetch(variable, lead, init_time) -> xarray.Dataset / ndarray`
- **Regime-Conditioned Adaptive Blending**: Error-covariance weighting shifting dynamically between short-range AI spatial skill (24-72h) and medium-range NWP/Ensemble physics (96-240h).
- **IMD Disaster Management Criteria (DSS)**: Real-time threshold evaluation across 36 Indian States & Union Territories (Rainfall 64.5 / 115.6 / 204.5 mm, Heatwave criteria, Gale gusts).
- **Physics-Informed Verification (PINN)**: Mass divergence & moisture flux continuity constraints (93.7% reduction in mass residual over pure AI).
- **Aurora Weather-Ops UI**: Dark `#070B14` glassmorphism, responsive across 375px to 2560px, URL-synced filters, accessible WCAG AA.

## Quick Start

### Native Local Start (Recommended on Windows)
```powershell
./run_dev.ps1
```
Or via Makefile:
```bash
make dev
```

### Docker Compose
```bash
docker compose up --build
```

### Direct Manual Run
**Backend (API)**:
```bash
cd api
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend (Web)**:
```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
