# TeachSmarter Backend Service

FastAPI async backend service powering deterministic psychometrics, longitudinal student trajectory calculations, multi-agent AI workflows, and human-in-the-loop parent communications.

## Tech Stack

* Python 3.12
* FastAPI with Pydantic v2
* SQLAlchemy 2.0 (Async) with SQLite (aiosqlite) / PostgreSQL (asyncpg)
* NumPy and SciPy for deterministic psychometrics and Ordinary Least Squares trajectory regressions
* Clerk authentication with JWT signature verification and multi-tenant scoping
* Pytest for comprehensive unit and integration testing

## Getting Started

### 1. Install Dependencies
```powershell
uv sync
```

### 2. Run the Development Server
```powershell
uv run uvicorn app.main:app --reload --port 8000
```

* API Health Check: `http://127.0.0.1:8000/health`
* Swagger Interactive Docs: `http://127.0.0.1:8000/docs`
* ReDoc Documentation: `http://127.0.0.1:8000/redoc`

### 3. Run Test Suite
```powershell
uv run pytest
```
All 32 tests validate deterministic psychometric math, longitudinal slope regressions, FERPA pseudonymization, and human-in-the-loop approval workflows.

## Architecture

* `app/analytics/`: Deterministic mathematical algorithms (Classical Test Theory, Item Discrimination, Longitudinal Trajectories). Zero LLM hallucinations for all numeric metrics.
* `app/api/v1/`: REST API endpoints for classrooms, assessments, psychometrics, parent communications, and gradebook import.
* `app/core/`: Application settings, database session factories, and security configurations.
* `app/models/`: SQLAlchemy 2.0 async ORM models with cascading relationships.
* `app/security/`: Multi-tenant organization scoping and Clerk authentication token validation.
* `app/services/`: Business logic, demo dataset seeder, and spreadsheet ingestion.

