# TeachSmarter

An AI-powered teaching assistant platform with strict human-in-the-loop (HITL) oversight, designed to assist educators in analyzing student assessment data, identifying curriculum gaps, and drafting targeted parent communications.

## Overview

I designed and built TeachSmarter to address two primary issues in educational technology: teacher burnout and unverified AI hallucinations. Many current AI tools attempt to automate classroom decisions autonomously. In high-stakes educational environments, unverified AI outputs introduce unacceptable risks around privacy, grading accuracy, and biased feedback.

TeachSmarter operates as an AI co-pilot where teachers maintain full authority over all instructional interventions and external communications. All statistical evaluations are computed deterministically using standard psychometric equations, while LLMs are strictly reserved for qualitative synthesis and contextual drafting.

## Core Capabilities

### 1. Classroom Overview and Performance Distribution
* Dynamic summary cards displaying class mean, median, standard deviation, and sample size.
* Visual score distribution histograms and longitudinal progress benchmarks.
* Topic-level learning gap identification comparing cohort performance against curriculum benchmarks (such as the NERDC JSS 2 Mathematics benchmark).

### 2. Assessment Validity and Classical Item Psychometrics
* Item Difficulty Index (p-value): Proportion of students answering correctly.
* Kelley's Upper-Lower Discrimination Index (D): Difference between the top 27% and bottom 27% cohorts.
* Point-Biserial Correlation (r_pbis): Pearson correlation between item success and total score.
* Distractor Frequency Analysis: Distribution of incorrect selections across all options to detect misconceptions or miskeyed questions (such as questions with negative discrimination).

### 3. Student Longitudinal Diagnostics and Trajectories
* Multi-assessment baseline tracking (comparing recent test scores against rolling historical averages).
* Trajectory classification: Breakthrough, Improving, Stable, and Declining.
* Data privacy and pseudonymization: Student identities are shielded behind deterministic tokens (such as Student_XXXXXXXX) prior to any model processing.

### 4. Teaching Strategy and Differentiated Instruction
* Automated grouping recommendations: Remedial small groups (10 to 15 minutes), peer-tutoring pairs, and high-mastery extension challenges.
* Concrete curriculum links: Direct assignment of targeted exercises from approved textbooks (such as New General Mathematics for JSS Book 2).
* Teacher control: Grouping proposals require explicit acceptance before being marked as scheduled.

### 5. Human-in-the-Loop Communication Approval Hub
* Triage queue for guardian communications (breakthrough praise, intervention alerts, and progress summaries).
* Zero automated dispatches: No message can leave the platform without explicit teacher review and sign-off.
* Invalidation on edit: Any edit to an approved message immediately invalidates its prior approval state, requiring re-approval before dispatch.
* Quick tone modifiers: One-click actions to soften tone, add home practice tips, or format concise SMS and WhatsApp notifications.

## Engineering and Architectural Principles

1. No LLMs for calculations: All psychometric statistics, test percentiles, and trajectory deltas are computed using pure Python (NumPy, SciPy, and pandas). LLMs never compute scores.
2. Evidence-backed findings: Every recommendation references explicit question items, raw scores, and observed historical deltas.
3. Strict data isolation: Multi-tenant database design isolates records by school and classroom.
4. Immutable approval audit trail: Approved communications retain a versioned hash to prove teacher oversight.

## Technology Stack

* Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide React.
* Backend: Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, aiosqlite (local development) / asyncpg (PostgreSQL).
* Package and Environment Management: uv for Python, npm for Node.js.
* Cloud Services (Target Architecture): AWS Lambda, Step Functions, Amazon S3, Amazon SES, Secrets Manager.
* Authentication: Multi-tenant organization scoping with Clerk JWT verification.

## Project Structure

```
TeachSmarter/
├── agents/                   # Agent pipelines (ingestion agent, schema matching, prompts)
├── backend/
│   ├── app/
│   │   ├── analytics/        # Deterministic math engine (difficulty, discrimination, distractors, trajectories)
│   │   ├── api/v1/           # FastAPI REST endpoints
│   │   ├── core/             # Configuration, database session, FERPA tokenization
│   │   ├── models/           # SQLAlchemy 2.0 async ORM models
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   └── services/         # Business logic, demo seeder, ingestion engine
│   └── tests/                # Pytest integration and unit tests (32 tests)
├── frontend/
│   ├── app/                  # Next.js 15 App Router pages and layout
│   ├── components/           # UI components (Overview, ItemAnalysis, Diagnostics, Strategy, ApprovalHub)
│   └── lib/                  # Frontend utilities
├── data/
│   └── synthetic/            # 25-student cohort generator and CSV/XLSX gradebooks
├── docs/                     # Technical architecture and specifications
└── README.md
```

## Getting Started

### Prerequisites
* Python 3.11 or newer (uv package manager recommended)
* Node.js 18 or newer and npm

### 1. Backend Setup

Navigate to the backend directory:
```powershell
cd backend
```

Create virtual environment and install dependencies:
```powershell
uv sync
```

Run the FastAPI development server:
```powershell
uv run uvicorn app.main:app --reload --port 8000
```

Verify backend health at:
http://127.0.0.1:8000/health

Interactive API documentation (Swagger UI) is available at:
http://127.0.0.1:8000/docs

### 2. Frontend Setup

In a separate terminal, navigate to the frontend directory:
```powershell
cd frontend
```

Install Node dependencies:
```powershell
npm install
```

Start the Next.js development server:
```powershell
npm run dev
```

Open your browser to:
http://localhost:3000

## Verification and Testing

### Backend Test Suite
Run all unit and integration tests using pytest:
```powershell
cd backend
uv run pytest
```
All 32 tests validate psychometric calculations, trajectory slope algorithms, multi-agent pipelines, and approval revocation mechanics.

### Frontend Type Safety and Production Build
Verify TypeScript types:
```powershell
cd frontend
npx tsc --noEmit
```

Run ESLint:
```powershell
npm run lint
```

Run production build:
```powershell
npm run build
```

To serve the production build:
```powershell
npm run start
```

## Demo Cohort Dataset

The project includes a realistic 25-student cohort based on JSS 2 Mathematics at Greenwood Academy, Lagos:
* 3 historical assessments: Unit 1 (Foundations of Algebra), Unit 2 (Linear Relationships), and Unit 3 (Linear Equations and Exponents).
* 15 multiple-choice questions in Unit 3 with controlled anomalies:
  * Question 7: Miskeyed item (designated key is B, but mathematically sound option C is chosen by top quartile students; negative discrimination).
  * Question 12: Low discrimination item (roughly equal distribution across ability tiers).
  * Sarah Jenkins: Verified breakthrough student (+28.2% jump).
  * Marcus Vance: Declining performance specifically on negative exponent inversion.
  * Elijah Danjuma: Severe drop requiring immediate early warning.

To reset the database to this baseline at any time, click "Reset Demo Classroom" in the UI header or call `POST /api/v1/demo/load`.
