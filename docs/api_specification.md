# TeachSmarter: REST API Specification

**Base URL**: `/api/v1`  
**Authentication**: Bearer JWT (Clerk Session Token with `org_id` claim)

All responses follow standard HTTP status codes. Errors return `{ "detail": "error message", "code": "ERROR_CODE" }`.

---

## 1. Imports & Ingestion

### `POST /api/v1/imports`
Initiates a new spreadsheet import job. Uploads file to Amazon S3.
* **Request**: `multipart/form-data` with `file`, `classroom_id`.
* **Response**: `202 Accepted`
  ```json
  {
    "import_id": "uuid",
    "filename": "math_quiz_3.xlsx",
    "status": "PROCESSING",
    "columns_detected": ["Student ID", "Full Name", "Q1", "Q2", "Total"]
  }
  ```

### `GET /api/v1/imports/{id}`
Returns the inspection and proposed column mapping report.

### `POST /api/v1/imports/{id}/validate`
Validates data against suggested column mapping. Returns row-by-row error report.

### `POST /api/v1/imports/{id}/commit`
Explicit teacher confirmation. Commits validated records into `assessments`, `students`, and `submissions`.

---

## 2. Classrooms & Students

### `GET /api/v1/classrooms`
Lists classrooms for the authenticated organisation.

### `POST /api/v1/classrooms`
Creates a new classroom.

### `GET /api/v1/classrooms/{id}`
Retrieves classroom details, enrolled students, and recent assessments.

### `GET /api/v1/classrooms/{id}/analytics`
Returns aggregate classroom analytics: score distribution, historical averages, identified learning gaps.

### `GET /api/v1/students/{id}`
Retrieves individual student profile and guardian contacts.

### `GET /api/v1/students/{id}/performance`
Retrieves longitudinal performance records and topic mastery radar data for a student.

---

## 3. Assessments & Psychometrics

### `POST /api/v1/assessments`
Creates a new assessment record.

### `GET /api/v1/assessments/{id}/item-analysis`
Returns deterministic Classical Item Analysis statistics:
* Item Difficulty ($p$-value).
* Item Discrimination ($D$-value).
* Point-Biserial Correlation ($r_{pbis}$).
* Distractor breakdown (Option selection by ability quartile).

### `POST /api/v1/assessments/{id}/reviews`
Triggers the Assessment Intelligence Agent to interpret psychometric data and suggest question revisions.

### `GET /api/v1/assessments/{id}/reviews`
Retrieves AI-generated assessment reviews and anomaly flags.

---

## 4. Teaching Recommendations

### `POST /api/v1/recommendations`
Triggers the Teaching Strategy Agent for a specific assessment or topic gap.

### `GET /api/v1/recommendations?classroom_id={id}`
Lists teaching recommendations with status (`PENDING`, `ACCEPTED`, `REJECTED`, `MODIFIED`).

### `PATCH /api/v1/recommendations/{id}`
Teacher accepts, modifies, or rejects a recommendation.

---

## 5. Parent Communications & Approval Hub

### `POST /api/v1/communications/drafts`
Requests Parent Communication Agent to generate draft messages for selected students.

### `GET /api/v1/communications?classroom_id={id}&status={status}`
Lists communication drafts in the Approval Hub.

### `PATCH /api/v1/communications/{id}`
Teacher edits draft body or recipient. **Note:** Invalidate existing approval if previously approved.

### `POST /api/v1/communications/{id}/adjust-tone`
Applies a 1-click micro-adjustment (`soften_tone`, `add_home_tips`, `translate`).
* **Request**: `{ "action": "soften_tone", "target_language": "es" }`

### `POST /api/v1/communications/{id}/approve`
Records verified teacher sign-off with content hash and timestamp.

### `POST /api/v1/communications/{id}/send`
Dispatches the verified message via Amazon SES (or simulates in demo mode).

---

## 6. Workflows & Audit

### `GET /api/v1/workflows/{id}`
Polls status of asynchronous Step Functions executions.

### `GET /api/v1/audit-events`
Returns paginated organisation audit log.

