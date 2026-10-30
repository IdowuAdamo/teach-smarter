# TeachSmarter: Product Requirements Document (PRD)

## 1. Problem Statement
Teachers spend up to 15+ hours weekly on non-teaching administrative burdens: manually grading spreadsheets, attempting to detect student trajectory declines, calculating test fairness, formulating differentiated lesson groups, and drafting parent emails. At the same time, school administrators fear unvetted AI hallucinations, student privacy breaches (NDPA, FERPA, GDPR), and unreviewed autonomous communications sent to parents.

## 2. Product Objectives
1. **Reduce Teacher Burnout**: Automate spreadsheet ingestion, diagnostic trend calculations, item validity checks, and personalized draft authoring.
2. **Guarantee Math Precision**: Run classical psychometric and longitudinal analysis via deterministic code, never LLM guesswork.
3. **Ensure Teacher Sovereignty (HITL)**: All AI findings are presented as evidence-grounded suggestions. External messages require explicit teacher approval.
4. **Enforce Tenant Isolation**: Strict organisation scoping for all data, accounts, and operations.

## 3. Core Functional Requirements

### 3.1 Spreadsheet Ingestion & Validation
- **FR-1.1**: The system must ingest CSV and XLSX gradebooks.
- **FR-1.2**: Column mapping must attempt deterministic header matching (e.g., Student ID, Name, Test Score, Topic) first.
- **FR-1.3**: When mappings are ambiguous, use an LLM to interpret headers and generate a mapping proposal.
- **FR-1.4**: Ambiguous imports must require teacher confirmation before committing to the database.
- **FR-1.5**: Data validation must reject out-of-range scores and missing mandatory identifiers with clear error reports.

### 3.2 Psychometric Assessment Intelligence
- **FR-2.1**: Calculate Item Difficulty ($p$-value) for all dichotomous questions:
  $$p = \frac{R}{N}$$
- **FR-2.2**: Calculate Item Discrimination ($D$-value) using Kelley's 27% upper/lower group method:
  $$D = p_U - p_L$$
- **FR-2.3**: Calculate Point-Biserial Correlation ($r_{pbis}$) where score distributions permit.
- **FR-2.4**: Generate Distractor Analysis reporting selection frequencies per answer option by performance group.
- **FR-2.5**: Flag suspected miskeyed questions ($D < 0.00$), ambiguous phrasing, or low discrimination, presenting plain-English explanations.

### 3.3 Longitudinal Student Diagnostics
- **FR-3.1**: Compute rolling performance trajectories across comparable assessments.
- **FR-3.2**: Enforce minimum-data thresholds (minimum 3 assessments) before assigning trend labels (`IMPROVING`, `DECLINING`, `STABLE`).
- **FR-3.3**: Detect topic-level learning gaps when question topic metadata is available.
- **FR-3.4**: Do not infer neurological or learning difficulties from single score drops.

### 3.4 Teaching Strategy & Differentiated Grouping
- **FR-4.1**: Receive validated diagnostic findings and propose actionable instructional remedies.
- **FR-4.2**: Suggest concrete peer pairings and small-group remediation (e.g., pairing high-mastery students with struggling peers on a specific sub-topic).
- **FR-4.3**: Provide remedial and extension exercises tied to curriculum objectives.

### 3.5 Parent Communication Approval Hub
- **FR-5.1**: Generate personalized parent update drafts (progress summaries, breakthrough praise, intervention notices).
- **FR-5.2**: Provide 1-click tone adjustments: *“Soften Tone”*, *“Add Home Practice Tips”*, *“Translate to Spanish/French/Yoruba/Hausa”*.
- **FR-5.3**: Enforce strict approval gating: messages can only be sent via Amazon SES when verified by the teacher.
- **FR-5.4**: Any edit to a previously approved message or recipient must invalidate the approval state.
- **FR-5.5**: In demo mode, live email dispatch must be disabled.

### 3.6 Built-in Synthetic Demo Classroom
- **FR-6.1**: Provide a pre-loaded Grade 8 Mathematics demo class with 25 students.
- **FR-6.2**: Embed controlled anomalies: miskeyed question (Q7), poorly discriminating question (Q12), ambiguous wording (Q15), improving student (Sarah), declining student (Marcus), consistently high performer (Chloe), student needing support (David), and non-English guardian (Mateo).

