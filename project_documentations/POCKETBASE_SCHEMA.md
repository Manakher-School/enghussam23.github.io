# PocketBase Collections Schema
## Complete Schema for Al-Manakhir School Platform

This document defines all PocketBase collections based on the PostgreSQL design, adapted for PocketBase's structure.

---

## 📋 Collections Overview

### Core Collections (10 total)
1. **users** - Built-in PocketBase auth collection
2. **user_profiles** - Extended user information
3. **grades** - Grade levels (KG to Tawjihi)
4. **sections** - Class sections (A, B, C, D)
5. **subjects** - Academic subjects
6. **activities** - Homework, Quizzes, Exams (unified)
7. **lessons** - Educational materials with attachments
8. **submissions** - Student homework/quiz submissions
9. **news** - School announcements and news
10. **comments** - Comments on news items

---

## 1. users (PocketBase Auth Collection)

**Type:** Auth Collection (Built-in)

**Additional Fields to Add:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| role | Select | Yes | Options: `student`, `teacher`, `admin` |
| is_active | Bool | Yes | Default: true |
| last_login | Date | No | - |
| phone | Text | No | Max: 20 |

**API Rules:**
- List: Admins only
- View: Self or Admin
- Create: Admin only
- Update: Self or Admin
- Delete: Admin only

---

## 2. user_profiles

**Purpose:** Extended user information (bilingual)

| Field | Type | Required | Options |
|-------|------|----------|---------|
| user_id | Relation | Yes | Relation to `users`, Display fields: `email` |
| first_name | Text | Yes | Min: 2, Max: 100 |
| last_name | Text | Yes | Min: 2, Max: 100 |
| first_name_ar | Text | No | Max: 100 |
| last_name_ar | Text | No | Max: 100 |
| date_of_birth | Date | No | - |
| gender | Select | No | Options: `male`, `female` |
| parent_phone | Text | No | Max: 20 |
| address | Text | No | Max: 500 |
| profile_picture | File | No | Max: 1 file, 5MB, Images only |
| national_id | Text | No | Max: 50 (encrypted) |
| enrollment_date | Date | No | - |
| graduation_date | Date | No | - |
| grade | Relation | No | Relation to `grades` |
| section | Relation | No | Relation to `sections` |

**Indexes:**
- `user_id` (unique)

**API Rules:**
- List: Admins & Teachers
- View: Self, Teachers, Admins
- Create: Self or Admin
- Update: Self or Admin
- Delete: Admin only

---

## 3. grades

**Purpose:** Grade levels configuration

| Field | Type | Required | Options |
|-------|------|----------|---------|
| code | Text | Yes | Unique, Max: 20 (e.g., "KG", "10", "Tawjihi") |
| name | JSON | Yes | `{"ar": "...", "en": "..."}` |
| display_order | Number | Yes | For sorting |
| is_active | Bool | Yes | Default: true |

**Sample Data:**
```json
[
  {"code": "KG", "name": {"ar": "روضة", "en": "Kindergarten"}, "display_order": 1},
  {"code": "1", "name": {"ar": "الصف الأول", "en": "Grade 1"}, "display_order": 2},
  {"code": "10", "name": {"ar": "الصف العاشر", "en": "Grade 10"}, "display_order": 11},
  {"code": "Tawjihi", "name": {"ar": "التوجيهي", "en": "Tawjihi"}, "display_order": 13}
]
```

**API Rules:**
- List: Public
- View: Public
- Create/Update/Delete: Admin only

---

## 4. sections

**Purpose:** Class sections within grades

| Field | Type | Required | Options |
|-------|------|----------|---------|
| name | Text | Yes | Max: 10 (e.g., "A", "B", "C") |
| grade | Relation | Yes | Relation to `grades` |
| teacher | Relation | No | Relation to `users` (where role=teacher) |
| max_students | Number | No | Default: 30 |
| is_active | Bool | Yes | Default: true |

**Indexes:**
- Unique: `grade` + `name`

**API Rules:**
- List: Public
- View: Public
- Create/Update/Delete: Admin only

---

## 5. subjects

**Purpose:** Academic subjects with styling

| Field | Type | Required | Options |
|-------|------|----------|---------|
| code | Text | Yes | Unique, Max: 20 (e.g., "MATH", "SCI") |
| name | JSON | Yes | `{"ar": "...", "en": "..."}` |
| description | JSON | No | `{"ar": "...", "en": "..."}` |
| icon | Text | No | Emoji or icon class (e.g., "📐") |
| color | Text | No | Hex color (e.g., "#2196F3") |
| is_active | Bool | Yes | Default: true |

**Sample Data:**
```json
[
  {"code": "MATH", "name": {"ar": "رياضيات", "en": "Mathematics"}, "icon": "📐", "color": "#2196F3"},
  {"code": "SCI", "name": {"ar": "علوم", "en": "Science"}, "icon": "🔬", "color": "#4CAF50"},
  {"code": "ARAB", "name": {"ar": "لغة عربية", "en": "Arabic"}, "icon": "📖", "color": "#FF5722"}
]
```

**API Rules:**
- List: Public
- View: Public
- Create/Update/Delete: Admin & Teachers

---

## 6. activities (Unified: Homework, Quizzes, Exams)

**Purpose:** All student activities in one collection

| Field | Type | Required | Options |
|-------|------|----------|---------|
| type | Select | Yes | Options: `homework`, `quiz`, `exam` |
| title | JSON | Yes | `{"ar": "...", "en": "..."}` |
| content | JSON | No | `{"ar": "...", "en": "..."}` |
| description | JSON | No | `{"ar": "...", "en": "..."}` |
| subject | JSON | Yes | `{"ar": "...", "en": "..."}` or Relation to subjects |
| grade | Text | Yes | e.g., "Grade 10" |
| section | Text | No | e.g., "A" |
| teacher | Relation | Yes | Relation to `users` (teacher) |
| due_date | Date | No | For homework |
| start_date | Date | No | For quizzes/exams |
| end_date | Date | No | For quizzes/exams |
| duration | Number | No | Minutes (for quizzes) |
| points | Number | No | Total points available |
| passing_score | Number | No | Minimum score to pass (for quizzes) |
| allow_file_submission | Bool | No | Default: true (homework) |
| allow_text_submission | Bool | No | Default: true (homework) |
| max_file_size_mb | Number | No | Default: 10 |
| allowed_file_types | Text | No | e.g., "pdf,docx,jpg,png" |
| allow_retake | Bool | No | For quizzes, default: false |
| max_attempts | Number | No | For quizzes, default: 1 |
| questions | JSON | No | Array of question objects (for quizzes) |
| attachments | File | No | Multiple files, Max: 50MB total |
| is_published | Bool | Yes | Default: false |

**Indexes:**
- `type`
- `grade`
- `is_published`
- `due_date`

**API Rules:**
- List: `is_published=true` OR `teacher=@request.auth.id`
- View: `is_published=true` OR `teacher=@request.auth.id`
- Create: Teachers & Admins
- Update: Own content or Admin
- Delete: Own content or Admin

---

## 7. lessons (Educational Materials)

**Purpose:** Learning materials with file attachments

| Field | Type | Required | Options |
|-------|------|----------|---------|
| title | JSON | Yes | `{"ar": "...", "en": "..."}` |
| content | JSON | No | `{"ar": "...", "en": "..."}` |
| description | JSON | No | `{"ar": "...", "en": "..."}` |
| subject | JSON | Yes | `{"ar": "...", "en": "..."}` |
| grade | Text | Yes | e.g., "Grade 10" |
| teacher | Relation | Yes | Relation to `users` (teacher) |
| attachments | File | No | Multiple files, Images/PDFs/Docs |
| file_size | Text | No | Display file size (e.g., "2.5 MB") |
| download_count | Number | No | Track downloads |
| view_count | Number | No | Track views |
| tags | Text | No | Comma-separated tags |
| is_published | Bool | Yes | Default: false |

**Indexes:**
- `grade`
- `is_published`
- `teacher`

**API Rules:**
- List: `is_published=true` OR `teacher=@request.auth.id`
- View: `is_published=true` OR `teacher=@request.auth.id`
- Create: Teachers & Admins
- Update: Own content or Admin
- Delete: Own content or Admin

---

## 8. submissions

**Purpose:** Student homework and quiz submissions

| Field | Type | Required | Options |
|-------|------|----------|---------|
| activity_id | Relation | Yes | Relation to `activities` |
| student_id | Relation | Yes | Relation to `users` (student) |
| submission_text | Text | No | Max: 10000 characters |
| submission_files | File | No | Multiple files |
| answers | JSON | No | For quizzes: `{"question_1": "A", "question_2": "B"}` |
| status | Select | Yes | Options: `draft`, `submitted`, `graded`, `returned` |
| score | Number | No | Student's score |
| max_score | Number | No | Total possible score |
| percentage | Number | No | Auto-calculated |
| stars | Number | No | 0-5 rating |
| feedback | JSON | No | Teacher feedback `{"ar": "...", "en": "..."}` |
| graded_by | Relation | No | Relation to `users` (teacher) |
| submitted_at | Date | No | Submission timestamp |
| graded_at | Date | No | Grading timestamp |
| is_late | Bool | No | Auto-calculated based on due_date |
| time_taken_seconds | Number | No | For quizzes |
| attempt_number | Number | No | For quizzes with retakes |

**Indexes:**
- Unique: `activity_id` + `student_id` + `attempt_number`
- `student_id`
- `status`

**API Rules:**
- List: Own submissions OR graded_by=@request.auth.id OR Admin
- View: Own submissions OR graded_by=@request.auth.id OR Admin
- Create: Students (own submissions)
- Update: Own submissions (if not graded) OR Teacher (for grading)
- Delete: Admin only

---

## 9. news

**Purpose:** School announcements and news (Already created)

| Field | Type | Required | Options |
|-------|------|----------|---------|
| title | JSON | Yes | `{"ar": "...", "en": "..."}` |
| content | JSON | Yes | `{"ar": "...", "en": "..."}` |
| excerpt | Text | No | Max: 500 |
| image | File | No | 1 file, 5MB, Images only |
| category | Select | Yes | Options: `General`, `Exams`, `Events`, `Urgent` |
| author | Relation | No | Relation to `users` (teacher/admin) |
| grade | Text | No | Target grade (empty = all) |
| tags | Text | No | Comma-separated |
| view_count | Number | No | Track views |
| is_published | Bool | Yes | Default: true |
| is_pinned | Bool | No | Pin to top |
| important | Bool | No | Highlight as important |

**Indexes:**
- `is_published`
- `category`
- `is_pinned`

**API Rules:**
- List: `is_published=true`
- View: `is_published=true`
- Create: Teachers & Admins
- Update: Own content or Admin
- Delete: Own content or Admin

---

## 10. comments

**Purpose:** Comments on news items

| Field | Type | Required | Options |
|-------|------|----------|---------|
| news_id | Relation | Yes | Relation to `news` |
| author | Relation | Yes | Relation to `users` |
| content | Text | Yes | Max: 1000 |
| parent_comment | Relation | No | Relation to `comments` (for replies) |
| is_approved | Bool | Yes | Default: false (moderation) |
| likes | Number | No | Default: 0 |

**Indexes:**
- `news_id`
- `author`
- `is_approved`

**API Rules:**
- List: `is_approved=true` OR `author=@request.auth.id`
- View: `is_approved=true` OR `author=@request.auth.id`
- Create: Authenticated users
- Update: Own comments only
- Delete: Own comments or Admin

---

## 🔧 Implementation Steps

### 1. Create Collections in PocketBase Admin UI

1. Start PocketBase: `./pocketbase serve`
2. Open Admin UI: `http://127.0.0.1:8090/_/`
3. Create each collection with fields as specified above

### 2. Configure API Rules

For each collection, set the rules as documented above using PocketBase's rule syntax.

### 3. Seed Initial Data

Create initial records for:
- `grades` - All grade levels
- `subjects` - All subjects with icons/colors
- `sections` - Class sections for each grade

### 4. Test API Access

Use the PocketBase SDK to test CRUD operations for each collection.

---

## 📊 Data Relationships

```
users (auth)
  ↓ 1:1
user_profiles
  ↓ 1:many
submissions
  ↑ many:1
activities
  ↑ many:1
subjects, grades

lessons → attachments (files)
activities → attachments (files)
submissions → submission_files (files)

news → comments → author (user)
```

---

## 🔐 Security Considerations

1. **File Size Limits:** Set appropriate limits per collection
2. **File Types:** Restrict to safe file types (no executables)
3. **API Rules:** Always verify ownership before allowing updates
4. **Sensitive Data:** Encrypt `national_id` at application level
5. **Rate Limiting:** Set up rate limits in PocketBase for submissions

---

## 📝 Notes

- **Bilingual Fields:** Always use JSON for Arabic/English content
- **Soft Deletes:** PocketBase handles this automatically with built-in timestamps
- **File Storage:** PocketBase stores files locally or in S3-compatible storage
- **Real-time:** Use PocketBase realtime subscriptions for live updates
- **Backups:** Set up automated backups of PocketBase data directory

---

**Last Updated:** February 13, 2026  
**Version:** 1.0 (PocketBase Schema)
