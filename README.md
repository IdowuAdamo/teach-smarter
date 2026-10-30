# TeachSmarter

> **AI-Powered Teaching Assistant with Human-in-the-Loop Oversight**

TeachSmarter is a serverless, event-driven, multi-agent platform designed to help teachers make informed instructional decisions using classroom data while maintaining strict privacy (Nigeria Data Protection Act 2023, FERPA, GDPR), data isolation, and human-in-the-loop (HITL) approval.

---

## Core Capabilities

1. **Student Performance Analytics**: Deterministic score distributions, longitudinal trajectories, and topic-level learning gaps.
2. **Assessment Quality Review & Psychometrics**: Classical Item Analysis (Difficulty $p$-value, Kelley's Discrimination $D$-value, Point-Biserial correlation, and Distractor frequency analysis) combined with plain-English pedagogical explanations.
3. **Teaching Strategy & Intervention Recommendations**: Tailored remedial exercises, peer-instruction groupings, and extension activities tied directly to evidence.
4. **Parent & Student Communication Assistance**: Policy-governed drafts with 1-click tone modifiers and translations, requiring explicit teacher sign-off before dispatch via Amazon SES.
5. **Central Dashboard & Approval Hub**: Centralized triage queue for managing AI recommendations and student progress.

---

## Architectural Principles & Development Rules

1. **Build one complete workflow at a time.**
2. **Do not implement all agents simultaneously.**
3. **Do not introduce unnecessary infrastructure or services.**
4. **Do not use LLMs for deterministic calculations.** All psychometric formulas are executed in pure Python (`numpy`, `scipy`, `pandas`).
5. **Do not fabricate student performance findings.** All findings must cite concrete data and sample sizes.
6. **Do not generate recommendations unsupported by available records.**
7. **Do not allow agents to perform privileged application actions directly.**
8. **Do not allow communication delivery without verified teacher approval.** Editing an approved message invalidates previous approval.
9. **Keep application configuration, school settings, and agent prompts separate.**
10. **Write unit and integration tests alongside implementation.**
11. **Keep the architecture modular.**

---

## Tech Stack

* **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Recharts, React Hook Form, Zod.
* **Authentication**: Clerk (Org-level tenant isolation and role management).
* **Application Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2.
* **Cloud Infrastructure**: AWS Lambda, Step Functions, S3, RDS PostgreSQL, Amazon SES, Secrets Manager, CloudWatch.
* **Analytics**: pandas, NumPy, SciPy (pure deterministic math engine).

---

## Initial Development Priority

Build the complete **spreadsheet-to-student-analytics workflow** using synthetic data. Once it works end to end, introduce the diagnostics and teaching recommendation agents.

---

## Repository Structure

```
teach-smarter/
├── frontend/             # Next.js 15 application with Clerk & shadcn/ui
├── backend/              # FastAPI application & core analytics engine
│   ├── app/
│   │   ├── api/          # Versioned REST endpoints (/api/v1)
│   │   ├── core/         # Config, logging, database sessions
│   │   ├── models/       # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/      # Pydantic v2 validation schemas
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic & workflow execution
│   │   ├── analytics/    # Deterministic psychometrics & statistics
│   │   └── security/     # Clerk JWT verification & tenant scoping
│   ├── migrations/       # Alembic migrations
│   └── tests/            # Pytest test suite
├── agents/               # Independently deployable agent services
│   ├── ingestion/
│   ├── assessment_intelligence/
│   ├── student_diagnostics/
│   ├── teaching_strategy/
│   ├── parent_communication/
│   └── shared/
├── workflows/            # AWS Step Functions ASL definitions
├── infrastructure/       # Terraform & Lambda deployment configurations
├── data/
│   ├── synthetic/        # Programmatic Grade 8 Math demo generator
│   └── templates/        # CSV/XLSX sample gradebook templates
└── docs/                 # Architecture, requirements, API specs, security
```

