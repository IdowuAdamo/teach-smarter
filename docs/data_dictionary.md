# TeachSmarter: Data Dictionary

## 1. Entities & Fields

### `organisations`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique tenant ID |
| `clerk_org_id` | VARCHAR(100) | Unique, Index | Clerk organisation identifier |
| `name` | VARCHAR(255) | Not Null | School or tutor organization name |
| `jurisdiction` | VARCHAR(50) | Default 'NG' | Compliance jurisdiction ('NG', 'US', 'UK', 'EU') |
| `created_at` | TIMESTAMP WITH TIME ZONE | Default NOW() | Creation timestamp |

### `users`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Internal user ID |
| `clerk_user_id` | VARCHAR(100) | Unique, Index | Clerk user ID |
| `email` | VARCHAR(255) | Not Null | User email address |
| `first_name` | VARCHAR(100) | | User given name |
| `last_name` | VARCHAR(100) | | User family name |
| `role` | VARCHAR(50) | Default 'TEACHER' | 'ADMIN', 'TEACHER', 'COORDINATOR' |

### `organisation_memberships`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Membership ID |
| `organisation_id` | UUID | FK -> organisations.id | Scoped tenant |
| `user_id` | UUID | FK -> users.id | Scoped user |
| `role` | VARCHAR(50) | Not Null | Role within this organisation |

### `classrooms`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Classroom ID |
| `organisation_id` | UUID | FK -> organisations.id | Scoped tenant |
| `name` | VARCHAR(255) | Not Null | e.g. "Grade 8 Mathematics" |
| `subject` | VARCHAR(100) | Not Null | Academic subject |
| `grade_level` | VARCHAR(50) | Not Null | Grade or year level |

### `students`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Internal student ID |
| `organisation_id` | UUID | FK -> organisations.id | Scoped tenant |
| `classroom_id` | UUID | FK -> classrooms.id | Primary enrolled classroom |
| `student_number` | VARCHAR(100) | Not Null | School-assigned student ID |
| `first_name` | VARCHAR(100) | Not Null | Student first name |
| `last_name` | VARCHAR(100) | Not Null | Student last name |
| `pseudonym_token` | VARCHAR(64) | Unique, Index | Anonymized token sent to external LLMs |

### `guardians`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Guardian ID |
| `student_id` | UUID | FK -> students.id | Linked student |
| `name` | VARCHAR(150) | Not Null | Parent / guardian name |
| `relationship` | VARCHAR(50) | | 'Mother', 'Father', 'Guardian' |
| `email` | VARCHAR(255) | Not Null | Contact email |
| `phone` | VARCHAR(50) | | Contact phone |
| `preferred_language` | VARCHAR(10) | Default 'en' | Preferred communication language ('en', 'es', 'yo', 'ha') |

### `assessments`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Assessment ID |
| `organisation_id` | UUID | FK -> organisations.id | Scoped tenant |
| `classroom_id` | UUID | FK -> classrooms.id | Associated classroom |
| `title` | VARCHAR(255) | Not Null | e.g. "Unit 3 Linear Equations Quiz" |
| `max_score` | NUMERIC(5,2) | Not Null | Maximum possible marks |
| `date_administered` | DATE | Not Null | Date test was taken |

### `assessment_items`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Item ID |
| `assessment_id` | UUID | FK -> assessments.id | Linked assessment |
| `item_number` | INT | Not Null | Question number in test |
| `prompt` | TEXT | | Question prompt / text |
| `correct_option` | VARCHAR(10) | | e.g. 'A', 'B', 'C', 'D' |
| `mark_allocation` | NUMERIC(4,2) | Default 1.00 | Max marks for question |
| `topic_tag` | VARCHAR(100) | | Curriculum topic tag |
| `difficulty_p` | NUMERIC(4,3) | | Deterministic $p$-value ($R/N$) |
| `discrimination_d` | NUMERIC(4,3) | | Deterministic $D$-value ($p_U - p_L$) |
| `point_biserial` | NUMERIC(4,3) | | Item-total correlation |
| `anomaly_flag` | VARCHAR(50) | | 'MISKEYED_SUSPECTED', 'POOR_DISCRIMINATION', 'AMBIGUOUS' |

### `student_submissions`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Submission ID |
| `student_id` | UUID | FK -> students.id | Submitting student |
| `assessment_id` | UUID | FK -> assessments.id | Targeted assessment |
| `total_score` | NUMERIC(5,2) | Not Null | Total marks scored |
| `percentage` | NUMERIC(5,2) | Not Null | Calculated percentage |
| `trajectory_label` | VARCHAR(50) | | 'IMPROVING', 'DECLINING', 'STABLE', 'INSUFFICIENT_DATA' |

### `question_responses`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Response ID |
| `submission_id` | UUID | FK -> student_submissions.id | Parent submission |
| `item_id` | UUID | FK -> assessment_items.id | Linked question |
| `selected_option` | VARCHAR(10) | | Option selected ('A', 'B', etc.) |
| `is_correct` | BOOLEAN | Not Null | Deterministic grading match |
| `score_awarded` | NUMERIC(4,2) | Not Null | Score for question |

### `communication_drafts`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Draft ID |
| `organisation_id` | UUID | FK -> organisations.id | Scoped tenant |
| `student_id` | UUID | FK -> students.id | Targeted student |
| `guardian_id` | UUID | FK -> guardians.id | Intended recipient |
| `subject` | VARCHAR(255) | Not Null | Message subject |
| `body` | TEXT | Not Null | Message body |
| `content_version` | INT | Default 1 | Increments on edit |
| `status` | VARCHAR(50) | Default 'PENDING' | 'PENDING', 'APPROVED', 'EDITED', 'SENT', 'REJECTED' |
| `approved_by` | UUID | FK -> users.id | Approving teacher |
| `approval_timestamp` | TIMESTAMP WITH TIME ZONE | | Time of approval |
| `approved_content_hash` | VARCHAR(64) | | SHA-256 hash of approved content |
| `sent_timestamp` | TIMESTAMP WITH TIME ZONE | | Time dispatched via SES |
| `delivery_status` | VARCHAR(50) | | 'PENDING', 'SENT', 'DELIVERED', 'FAILED' |
| `provider_message_id` | VARCHAR(255) | | SES Message ID |

### `audit_events`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Event ID |
| `organisation_id` | UUID | FK -> organisations.id | Scoped tenant |
| `user_id` | UUID | FK -> users.id | Action perpetrator |
| `action` | VARCHAR(100) | Not Null | e.g. 'APPROVE_COMMUNICATION', 'SEND_EMAIL' |
| `resource_type` | VARCHAR(100) | Not Null | Entity modified |
| `resource_id` | UUID | Not Null | Entity UUID |
| `metadata_snapshot` | JSONB | | Details of the action and context |
| `ip_address` | VARCHAR(45) | | Originating IP address |
| `created_at` | TIMESTAMP WITH TIME ZONE | Default NOW() | Event timestamp |

