# Database Specification - Al-Manakhir School Platform

**Project**: School Educational Platform (مدرسة المناخر الأساسية)  
**Current State**: Mock JSON data (client-side)  
**Target**: PostgreSQL relational database

---

## Current Data Structure

The app currently uses JSON files in `/src/data/`:

- `homework.json` - Homework assignments
- `materials.json` - Educational materials
- `quizzes.json` - Quizzes with questions
- `news.json` - School announcements
- `grades.json` - Grade level mappings

Client-side storage (localforage/IndexedDB) for:

- Homework submissions
- Quiz attempts
- News comments

---

## Required Database Schema

### User Management

**users**

- id (UUID, PK)
- username, email (unique)
- password_hash
- role_id (FK → roles: student/teacher/admin)
- Standard timestamps

**user_profiles** (1:1 with users)

- Bilingual names (Arabic/English)
- DOB, phone, parent contact
- Profile picture URL

**user_grade_sections**

- Maps students to grade + section
- Academic year tracking
- `is_current` flag

---

### Academic Structure

**grades**: KG, 1-11, Tawjihi (bilingual labels)

**sections**: A, B, C, D per grade

**subjects**: Math, Science, Arabic, English, etc. (with icons/colors)

---

### Content Tables

**homework**

- Bilingual title/content
- subject_id, grade_id, section_id (nullable), teacher_id
- due_date, points
- allow_file_submission, allow_text_submission flags
- is_published, soft deletes

**homework_submissions**

- homework_id, student_id (unique together)
- submission_text
- status: draft/submitted/graded
- score, stars (1-5), feedback_text
- submitted_at, graded_at

**materials**

- Bilingual title/content/description
- subject_id, grade_id, teacher_id
- file_type, file_url, file_size_kb
- download_count, view_count

**quizzes**

- Bilingual title
- subject_id, grade_id, teacher_id
- quiz_date, duration_minutes, total_points
- max_attempts, shuffle_questions flags

**questions** (quiz questions)

- quiz_id
- Bilingual question text
- question_type: multiple_choice/true_false/short_answer
- correct_answer_index (for MC)
- points, display_order

**question_options** (for multiple choice)

- question_id
- Bilingual option text
- option_order

**quiz_attempts**

- quiz_id, student_id, attempt_number
- score, percentage, status
- started_at, submitted_at, time_taken_seconds

**student_answers**

- attempt_id, question_id
- selected_option_index or answer_text
- is_correct, points_earned

**news**

- Bilingual title/content
- category (bilingual)
- author_id, is_important, is_published
- published_at, view_count

**comments** (on news)

- news_id, user_id
- comment_text
- is_approved, parent_comment_id (for replies)

---

### File Management

**files**

- original_filename, stored_filename, file_path
- file_size_bytes, mime_type
- uploaded_by (FK → users)
- checksum, download_count

**submission_files** (links submissions to files)

- submission_id, file_id

---

## Key Requirements

### Multilingual Support

Almost all content has `_ar` and `_en` fields for Arabic/English

### RBAC

- Students: view own grade content, submit work
- Teachers: create/grade content
- Admins: full access

### Soft Deletes

Important tables use `deleted_at` timestamp instead of hard deletes

### Audit Trail

`created_at`, `updated_at`, `deleted_at` on most tables

### Indexing Needs

- Foreign keys
- grade_id + is_published (filtering)
- due dates, quiz dates
- User email/username (login)

---

## Sample Data Volumes (Initial)

- Users: ~500 students, ~30 teachers
- Grades: 13 fixed (KG through Tawjihi)
- Subjects: ~8 core subjects
- Homework: ~100 active assignments
- Materials: ~200 resources
- Quizzes: ~50 active
- News: ~20 articles

---

## Tech Stack Preferences

- **Database**: PostgreSQL 15+ (JSONB support needed)
- **Backend**: Node.js/Express or ASP.NET Core
- **ORM**: Prisma or Knex.js
- **Auth**: JWT-based
- **File Storage**: Local initially, S3/Azure Blob later

---

## Migration Notes

Need script to migrate from JSON → DB:

- Map JSON structure to relational schema
- Create default teacher users (content has no authors currently)
- Preserve homework/quiz IDs for continuity
- Migrate localforage data (submissions/attempts) per student

---

## Questions for Backend Developer

1. Preference for ORM vs raw SQL?
2. File upload strategy (local/cloud)?
3. Real-time features needed? (WebSocket for quiz timer?)
4. Backup/restore approach?
5. API design: REST or GraphQL?

---

## Current JSON Schema Examples

**Homework:**

```json
{
  "id": "hw-kg-1",
  "title": { "ar": "واجب التلوين", "en": "Coloring Homework" },
  "content": { "ar": "...", "en": "..." },
  "subject": { "ar": "فنون", "en": "Arts" },
  "grade": "KG",
  "dueDate": "2026-02-05T23:59:59Z",
  "allowFileSubmission": true,
  "allowTextSubmission": false
}
```

**Quiz:**

```json
{
  "id": "quiz-kg-1",
  "title": { "ar": "اختبار الأشكال", "en": "Shapes Quiz" },
  "subject": { "ar": "رياضيات", "en": "Mathematics" },
  "grade": "KG",
  "duration": 15,
  "totalPoints": 6,
  "questions": [
    {
      "id": "q1",
      "question": { "ar": "...", "en": "..." },
      "options": [
        { "ar": "2", "en": "2" },
        { "ar": "3", "en": "3" }
      ],
      "correctAnswer": 1,
      "points": 2
    }
  ]
}
```

---

## ER Diagram

```mermaid
erDiagram
    USERS ||--o{ HOMEWORK_SUBMISSIONS : submits
    USERS ||--o{ QUIZ_ATTEMPTS : takes
    USERS ||--o{ COMMENTS : writes
    USERS ||--|| USER_PROFILES : has
    USERS }o--|| ROLES : "assigned to"
    USERS ||--o{ USER_GRADE_SECTIONS : enrolled
    USERS ||--o{ FILES : uploads
    USERS ||--o{ HOMEWORK : creates
    USERS ||--o{ MATERIALS : creates
    USERS ||--o{ QUIZZES : creates
    USERS ||--o{ NEWS : authors
    
    USER_GRADE_SECTIONS }o--|| GRADES : "belongs to"
    USER_GRADE_SECTIONS }o--o| SECTIONS : "in section"
    
    GRADES ||--o{ HOMEWORK : "assigned to"
    GRADES ||--o{ MATERIALS : "for grade"
    GRADES ||--o{ QUIZZES : "for grade"
    GRADES ||--o{ SECTIONS : contains
    
    SECTIONS }o--o| USERS : "taught by"
    
    SUBJECTS ||--o{ HOMEWORK : categorizes
    SUBJECTS ||--o{ MATERIALS : categorizes
    SUBJECTS ||--o{ QUIZZES : categorizes
    
    HOMEWORK ||--o{ HOMEWORK_SUBMISSIONS : "has submissions"
    
    HOMEWORK_SUBMISSIONS ||--o{ SUBMISSION_FILES : contains
    
    SUBMISSION_FILES }o--|| FILES : references
    
    QUIZZES ||--o{ QUESTIONS : contains
    QUIZZES ||--o{ QUIZ_ATTEMPTS : "has attempts"
    
    QUESTIONS ||--o{ QUESTION_OPTIONS : "has options"
    QUESTIONS ||--o{ STUDENT_ANSWERS : "answered in"
    
    QUIZ_ATTEMPTS ||--o{ STUDENT_ANSWERS : contains
    
    NEWS ||--o{ COMMENTS : "has comments"
    NEWS ||--o{ NEWS_IMAGES : "contains images"
    
    USERS {
        uuid id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        int role_id FK
        boolean is_active
        timestamp created_at
    }
    
    ROLES {
        int id PK
        varchar name UK
        varchar name_ar
        varchar name_en
        jsonb permissions
    }
    
    USER_PROFILES {
        uuid id PK
        uuid user_id FK
        varchar first_name
        varchar last_name
        varchar first_name_ar
        varchar last_name_ar
        date date_of_birth
    }
    
    GRADES {
        int id PK
        varchar code UK
        varchar name_ar
        varchar name_en
        int display_order
    }
    
    SECTIONS {
        int id PK
        varchar name
        int grade_id FK
        uuid teacher_id FK
    }
    
    SUBJECTS {
        int id PK
        varchar code UK
        varchar name_ar
        varchar name_en
        varchar icon
        varchar color
    }
    
    HOMEWORK {
        uuid id PK
        varchar title_ar
        varchar title_en
        text content_ar
        text content_en
        int subject_id FK
        int grade_id FK
        uuid teacher_id FK
        timestamp due_date
        boolean is_published
    }
    
    HOMEWORK_SUBMISSIONS {
        uuid id PK
        uuid homework_id FK
        uuid student_id FK
        text submission_text
        varchar status
        decimal score
        int stars
        timestamp submitted_at
    }
    
    MATERIALS {
        uuid id PK
        varchar title_ar
        varchar title_en
        int subject_id FK
        int grade_id FK
        varchar file_url
        boolean is_published
    }
    
    QUIZZES {
        uuid id PK
        varchar title_ar
        varchar title_en
        int subject_id FK
        int grade_id FK
        int duration_minutes
        int total_points
    }
    
    QUESTIONS {
        uuid id PK
        uuid quiz_id FK
        text question_text_ar
        text question_text_en
        int correct_answer_index
        int points
    }
    
    QUESTION_OPTIONS {
        uuid id PK
        uuid question_id FK
        varchar option_text_ar
        varchar option_text_en
        int option_order
    }
    
    QUIZ_ATTEMPTS {
        uuid id PK
        uuid quiz_id FK
        uuid student_id FK
        int attempt_number
        decimal percentage
        varchar status
    }
    
    STUDENT_ANSWERS {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        int selected_option_index
        boolean is_correct
    }
    
    NEWS {
        uuid id PK
        varchar title_ar
        varchar title_en
        text content_ar
        text content_en
        uuid author_id FK
        boolean is_important
    }
    
    COMMENTS {
        uuid id PK
        uuid news_id FK
        uuid user_id FK
        text comment_text
        boolean is_approved
    }
    
    FILES {
        uuid id PK
        varchar original_filename
        varchar file_path
        bigint file_size_bytes
        uuid uploaded_by FK
    }
```

---

**That's the complete spec.** Full schema SQL and migration scripts are available in `/database/` folder if needed.
