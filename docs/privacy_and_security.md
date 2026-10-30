# TeachSmarter: Privacy and Security Architecture

## 1. Regulatory Context

TeachSmarter is built to operate under strict educational and data protection frameworks:
* **Nigeria Data Protection Act (NDPA) 2023**: Mandates lawful basis, purpose limitation, child data protection, and cross-border transfer compliance for Nigerian educational deployments.
* **Family Educational Rights and Privacy Act (FERPA)**: 34 CFR Part 99 compliance regarding student educational records.
* **General Data Protection Regulation (GDPR) & UK GDPR**: Applicable to European and British partner schools.

> **Crucial Rule**: Pseudonymisation must **not** be misrepresented to school administrators as full irreversibility/anonymisation. Pseudonymisation is an essential defense-in-depth safeguard to protect data in transit to LLM inference providers.

---

## 2. Multi-Tenant Organisation Isolation

1. **Database Multi-Tenancy**: Every school-owned table contains an `organisation_id` foreign key.
2. **Authorization Enforcement**: Every incoming API request is authenticated via Clerk JWT. The backend resolves the user's active `org_id` and automatically scopes all database queries using repository filters.
3. **Cross-Tenant Access Prevention**: Attempting to query or modify a resource belonging to a different organisation returns an immediate `404 Not Found` or `403 Forbidden` and logs a security audit event.

---

## 3. PII De-Identification & LLM Boundary

Before sending student diagnostic records to external LLM providers (e.g. OpenAI, Anthropic, AWS Bedrock):
1. **Local Pseudonymization**: Real student names, emails, student ID numbers, and guardian details are stripped and replaced with deterministic pseudonymous tokens (e.g. `Student_Token_4A8F`).
2. **Minimal Payload Transmission**: Only academic performance metrics, question responses, and topic tags are passed to the model.
3. **No Sensitive PII in Logs**: Log formatters are configured to strip student names, emails, and parent phone numbers from CloudWatch logs.
4. **Rehydration**: AI-generated communication templates are populated with the student and guardian's real names on the secure backend server **after** receiving model output.

---

## 4. Human-in-the-Loop (HITL) Communication Safety

* **Zero Direct Agent Dispatch**: No AI agent has IAM permissions to trigger Amazon SES or send messages directly.
* **Mandatory Explicit Sign-Off**:
  * Outbound drafts remain in `status = 'PENDING'` until a teacher clicks **Approve** or **Send**.
  * When a draft is edited by a teacher, a new `content_version` is created and any previous approval is marked void.
  * The backend checks `approved_content_hash == sha256(current_body)` before allowing dispatch.
* **Demo Sandbox Protection**:
  * In `DEMO_MODE=True`, outbound SES calls are bypassed with a simulated log dispatcher. Real emails can never be dispatched from demo classrooms.

