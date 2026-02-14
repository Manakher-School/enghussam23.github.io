# System Architecture Diagram

## Manakher School Backend - Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATION                         │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Admin UI   │  │  Teacher UI  │  │  Student UI  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                            │                                         │
│                            ▼                                         │
│                  ┌──────────────────┐                               │
│                  │  PocketBase SDK  │                               │
│                  │   (JavaScript)   │                               │
│                  └──────────────────┘                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/WebSocket
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      POCKETBASE SERVER                               │
│                      Port: 8090                                      │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     REST API Layer                           │   │
│  │  /api/collections/{collection}/records                      │   │
│  │  /api/collections/users/auth-with-password                  │   │
│  │  /api/files/{collection}/{record}/{filename}               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             │                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   BUSINESS LOGIC HOOKS                       │   │
│  │                                                              │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                │   │
│  │  │ submissions.pb.js│  │enrollments.pb.js │                │   │
│  │  │   Auto-grading   │  │   Validation     │                │   │
│  │  └──────────────────┘  └──────────────────┘                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             │                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   ACCESS CONTROL LAYER                       │   │
│  │                                                              │   │
│  │  • Admin: Full access                                       │   │
│  │  • Teacher: Own classes only                                │   │
│  │  • Student: Enrolled classes only                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             │                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SQLITE DATABASE                           │   │
│  │                    (pb_data/data.db)                        │   │
│  │                                                              │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐              │   │
│  │  │   users    │ │  courses   │ │  classes   │              │   │
│  │  └────────────┘ └────────────┘ └────────────┘              │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐              │   │
│  │  │  lessons   │ │activities  │ │ questions  │              │   │
│  │  └────────────┘ └────────────┘ └────────────┘              │   │
│  │  ┌────────────┐ ┌────────────┐                              │   │
│  │  │submissions │ │enrollments │                              │   │
│  │  └────────────┘ └────────────┘                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   FILE STORAGE                               │   │
│  │              (pb_data/storage/)                             │   │
│  │  • Lesson attachments (PDF, PNG)                            │   │
│  │  • Protected by collection rules                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Authentication Flow

```
┌─────────┐                                              ┌──────────┐
│         │  1. POST /auth-with-password                │          │
│ Client  │─────────────────────────────────────────────▶│PocketBase│
│         │     { email, password }                      │          │
│         │                                              │          │
│         │  2. Validate credentials                     │          │
│         │◀─────────────────────────────────────────────│          │
│         │                                              │          │
│         │  3. Return token + user record               │          │
│         │◀─────────────────────────────────────────────│          │
│         │     { token, record: { id, role, ... } }    │          │
└─────────┘                                              └──────────┘
     │
     │ 4. Store token
     ▼
┌─────────┐
│localStorage│
│ or Cookie │
└─────────┘
```

---

### Student: View Class Content Flow

```
┌─────────┐                                              ┌──────────┐
│ Student │  1. GET /enrollments?filter=...            │PocketBase│
│  Login  │─────────────────────────────────────────────▶│          │
│         │     student_id='123' && status='active'      │          │
│         │                                              │          │
│         │  2. Return enrolled classes                  │          │
│         │◀─────────────────────────────────────────────│          │
│         │     [{ class_id: 'abc', ... }]              │          │
│         │                                              │          │
│         │  3. GET /lessons?filter=...                  │          │
│         │─────────────────────────────────────────────▶│          │
│         │     class_id='abc'                           │          │
│         │                                              │          │
│         │  4. Check enrollment (access rule)           │          │
│         │     ✓ Student enrolled & active              │          │
│         │                                              │          │
│         │  5. Return lessons                           │          │
│         │◀─────────────────────────────────────────────│          │
│         │     [{ id, title, content, ... }]           │          │
└─────────┘                                              └──────────┘
```

---

### Activity Submission Flow (Auto-grading)

```
┌─────────┐                                              ┌──────────┐
│ Student │  1. GET /questions?filter=...&fields=...   │PocketBase│
│         │─────────────────────────────────────────────▶│          │
│         │     activity_id='xyz'                        │          │
│         │     fields: id,type,question,options         │          │
│         │     (exclude correct_answer)                 │          │
│         │                                              │          │
│         │  2. Return questions (no answers)            │          │
│         │◀─────────────────────────────────────────────│          │
│         │                                              │          │
│         │  3. Student answers questions                │          │
│         │                                              │          │
│         │  4. POST /submissions                        │          │
│         │─────────────────────────────────────────────▶│          │
│         │     { activity_id, student_id, answers }    │          │
│         │                                              │          │
│         │  5. Hook: Check enrollment                   │          │
│         │     ✓ Student enrolled in class              │          │
│         │                                              │          │
│         │  6. Hook: Check duplicate                    │          │
│         │     ✓ No existing submission                 │          │
│         │                                              │          │
│         │  7. Hook: Auto-grade                         │          │
│         │     • Fetch questions with correct_answer    │          │
│         │     • Compare student answers                │          │
│         │     • Calculate score                        │          │
│         │     • Set score field                        │          │
│         │                                              │          │
│         │  8. Return submission with score             │          │
│         │◀─────────────────────────────────────────────│          │
│         │     { id, score: 85, ... }                  │          │
└─────────┘                                              └──────────┘
```

---

### Teacher: Create Activity Flow

```
┌─────────┐                                              ┌──────────┐
│ Teacher │  1. POST /activities                        │PocketBase│
│         │─────────────────────────────────────────────▶│          │
│         │     { class_id, title, type, max_score }    │          │
│         │                                              │          │
│         │  2. Check: teacher owns class                │          │
│         │     ✓ class.teacher_id == user.id            │          │
│         │                                              │          │
│         │  3. Create activity                          │          │
│         │◀─────────────────────────────────────────────│          │
│         │     { id: 'activity_123', ... }             │          │
│         │                                              │          │
│         │  4. POST /questions (multiple)               │          │
│         │─────────────────────────────────────────────▶│          │
│         │     { activity_id, type, question,          │          │
│         │       options, correct_answer }              │          │
│         │                                              │          │
│         │  5. Create questions                         │          │
│         │◀─────────────────────────────────────────────│          │
│         │     { id: 'q1', ... }                       │          │
└─────────┘                                              └──────────┘
```

---

## Collection Relationships

```
┌──────────┐
│  users   │◀───────────┐
│  (auth)  │            │
└──────────┘            │
     │                  │
     │ teacher_id       │ student_id
     │                  │
     ▼                  │
┌──────────┐            │
│ classes  │            │
└──────────┘            │
     │                  │
     │ class_id         │
     ├──────────────┬───┴──────┬───────────┐
     ▼              ▼          ▼           ▼
┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐
│ lessons  │  │activities│ │enrollments│ │ courses  │
└──────────┘  └──────────┘ └──────────┘ └──────────┘
                   │             │             │
                   │ activity_id │             │ course_id
                   │             │             │
                   ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐ ┌──────────┐
              │questions │  │submissions│ │ classes  │
              └──────────┘  └──────────┘ └──────────┘
```

---

## Access Control Matrix

```
┌─────────────┬────────┬─────────┬─────────┬─────────┬─────────┐
│ Collection  │ List   │ View    │ Create  │ Update  │ Delete  │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ users       │        │         │         │         │         │
│  - admin    │ All    │ All     │ System  │ All     │ All     │
│  - teacher  │ All    │ All     │ System  │ Self    │ None    │
│  - student  │ All    │ All     │ System  │ Self    │ None    │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ courses     │        │         │         │         │         │
│  - admin    │ All    │ All     │ Yes     │ Yes     │ Yes     │
│  - teacher  │ All    │ All     │ No      │ No      │ No      │
│  - student  │ All    │ All     │ No      │ No      │ No      │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ classes     │        │         │         │         │         │
│  - admin    │ All    │ All     │ Yes     │ Yes     │ Yes     │
│  - teacher  │ Own    │ Own     │ No      │ No      │ No      │
│  - student  │ None   │ None    │ No      │ No      │ No      │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ lessons     │        │         │         │         │         │
│  - admin    │ All    │ All     │ Yes     │ Yes     │ Yes     │
│  - teacher  │ Own    │ Own     │ Own cls │ Own cls │ Own cls │
│  - student  │ Enroll │ Enroll  │ No      │ No      │ No      │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ activities  │        │         │         │         │         │
│  - admin    │ All    │ All     │ Yes     │ Yes     │ Yes     │
│  - teacher  │ Own    │ Own     │ Own cls │ Own cls │ Own cls │
│  - student  │ Enroll │ Enroll  │ No      │ No      │ No      │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ questions   │        │         │         │         │         │
│  - admin    │ All    │ All     │ Yes     │ Yes     │ Yes     │
│  - teacher  │ Own*   │ Own*    │ Own cls │ Own cls │ Own cls │
│  - student  │ None** │ None**  │ No      │ No      │ No      │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ submissions │        │         │         │         │         │
│  - admin    │ All    │ All     │ No      │ Yes     │ Yes     │
│  - teacher  │ Own cls│ Own cls │ No      │ No      │ No      │
│  - student  │ Own    │ Own     │ Yes***  │ No      │ No      │
├─────────────┼────────┼─────────┼─────────┼─────────┼─────────┤
│ enrollments │        │         │         │         │         │
│  - admin    │ All    │ All     │ Yes     │ Yes     │ Yes     │
│  - teacher  │ Own cls│ Own cls │ No      │ No      │ No      │
│  - student  │ Own    │ Own     │ No      │ No      │ No      │
└─────────────┴────────┴─────────┴─────────┴─────────┴─────────┘

Legend:
  Own       = Records where teacher_id matches user
  Own cls   = Records from classes where teacher_id matches user
  Enroll    = Records from classes where student is enrolled (status='active')
  *         = Can view questions with correct_answer
  **        = Can fetch questions WITHOUT correct_answer field
  ***       = Can create if enrolled and no existing submission
```

---

## Auto-grading Logic Flow

```
┌───────────────────────────────────────────────────────────┐
│  Submission Created (POST /submissions)                   │
└───────────────────────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────┐
│  Hook: onRecordBeforeCreateRequest                        │
│                                                            │
│  1. Extract data:                                         │
│     - activity_id                                         │
│     - student_id                                          │
│     - answers = { q1: 'ans1', q2: true, q3: 'Paris' }   │
│                                                            │
│  2. Validate enrollment:                                  │
│     ✓ Student enrolled in activity's class               │
│     ✓ Enrollment status = 'active'                        │
│                                                            │
│  3. Check duplicate:                                      │
│     ✓ No existing submission for this student/activity   │
│                                                            │
│  4. Fetch activity:                                       │
│     - max_score = 100                                     │
│                                                            │
│  5. Fetch all questions:                                  │
│     [                                                      │
│       { id: 'q1', type: 'mcq', correct_answer: '4' },   │
│       { id: 'q2', type: 'tf', correct_answer: true },   │
│       { id: 'q3', type: 'short', correct_answer: 'Paris'} │
│     ]                                                      │
│                                                            │
│  6. Grade each question:                                  │
│     q1: answers['q1'] === '4' → ✓ correct                │
│     q2: answers['q2'] === true → ✓ correct               │
│     q3: answers['q3'].toLowerCase() === 'paris' → ✓      │
│                                                            │
│  7. Calculate score:                                      │
│     correctCount = 3                                      │
│     totalQuestions = 3                                    │
│     score = (3/3) * 100 = 100                            │
│                                                            │
│  8. Set score on record:                                  │
│     record.set('score', 100)                             │
│                                                            │
└───────────────────────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────┐
│  Submission saved with auto-calculated score              │
│  { id: 'sub123', score: 100, answers: {...} }           │
└───────────────────────────────────────────────────────────┘
```

---

## Role-Based UI Flow

```
                    ┌─────────────┐
                    │   Login     │
                    └──────┬──────┘
                           │
                   ┌───────▼────────┐
                   │ Check user.role│
                   └───────┬────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐     ┌───────────┐     ┌──────────┐
   │  Admin   │     │  Teacher  │     │ Student  │
   └────┬─────┘     └─────┬─────┘     └────┬─────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌──────────────┐  ┌─────────────┐
│ Full Access   │  │ Own Classes  │  │ Enrolled    │
│ - All users   │  │ - My classes │  │ - My classes│
│ - All courses │  │ - Lessons    │  │ - Lessons   │
│ - All classes │  │ - Activities │  │ - Activities│
│ - Enrollments │  │ - Questions  │  │ - Submit    │
│ - Submissions │  │ - Submissions│  │ - My scores │
└───────────────┘  └──────────────┘  └─────────────┘
```

---

## File Upload/Download Flow

```
┌─────────┐                                              ┌──────────┐
│ Teacher │  1. Create FormData                         │          │
│ (Upload)│     - class_id, title, content              │          │
│         │     - attachments[] = [file1.pdf, img.png]  │          │
│         │                                              │          │
│         │  2. POST /lessons (multipart/form-data)      │          │
│         │─────────────────────────────────────────────▶│PocketBase│
│         │                                              │          │
│         │  3. Validate files:                          │          │
│         │     ✓ Type: PDF, PNG                         │          │
│         │     ✓ Count: ≤ 5                             │          │
│         │     ✓ Size: ≤ 5MB each                       │          │
│         │                                              │          │
│         │  4. Store files in pb_data/storage/          │          │
│         │     lesson_abc123_file1.pdf                  │          │
│         │     lesson_abc123_img.png                    │          │
│         │                                              │          │
│         │  5. Return lesson record                     │          │
│         │◀─────────────────────────────────────────────│          │
│         │     { id: 'abc123',                          │          │
│         │       attachments: ['file1.pdf', 'img.png']} │          │
└─────────┘                                              └──────────┘

┌─────────┐                                              ┌──────────┐
│ Student │  1. GET /lessons/abc123                     │PocketBase│
│(Download)│─────────────────────────────────────────────▶│          │
│         │                                              │          │
│         │  2. Return lesson with attachments           │          │
│         │◀─────────────────────────────────────────────│          │
│         │     { attachments: ['file1.pdf', 'img.png']} │          │
│         │                                              │          │
│         │  3. Build file URLs:                         │          │
│         │     pb.files.getUrl(lesson, 'file1.pdf')    │          │
│         │                                              │          │
│         │  4. GET /files/lessons/abc123/file1.pdf      │          │
│         │─────────────────────────────────────────────▶│          │
│         │     Authorization: Bearer token              │          │
│         │                                              │          │
│         │  5. Check access (enrolled?)                 │          │
│         │     ✓ Student enrolled in lesson's class     │          │
│         │                                              │          │
│         │  6. Return file data                         │          │
│         │◀─────────────────────────────────────────────│          │
└─────────┘                                              └──────────┘
```

---

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND STACK                        │
├─────────────────────────────────────────────────────────┤
│ Framework:     PocketBase 0.22.0                       │
│ Language:      Go (PocketBase core)                    │
│ Hooks:         JavaScript (Goja runtime)               │
│ Database:      SQLite 3                                │
│ Auth:          JWT (JSON Web Tokens)                   │
│ Storage:       File system (pb_data/storage/)          │
│ Realtime:      WebSocket (Server-Sent Events)          │
│ API:           RESTful JSON API                        │
│ Migrations:    JavaScript migration files              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              RECOMMENDED FRONTEND STACK                 │
├─────────────────────────────────────────────────────────┤
│ Framework:     React / Vue / Svelte (your choice)      │
│ Language:      TypeScript (recommended)                │
│ SDK:           pocketbase (npm package)                │
│ State:         Zustand / Redux / Context               │
│ Routing:       React Router / Vue Router               │
│ Forms:         React Hook Form / Formik               │
│ Styling:       Tailwind / MUI / your choice            │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Stats

```
┌────────────────────────────────────────┐
│        BACKEND STATISTICS              │
├────────────────────────────────────────┤
│ Collections:         8                 │
│ Hooks:               2                 │
│ Migrations:         32                 │
│ User Roles:          3                 │
│ Access Rules:       ~40                │
│ API Endpoints:      40+                │
│ File Types:          2 (PDF, PNG)      │
│ Max File Size:      5MB                │
│ Auto-grading:       ✅ Yes              │
│ Real-time:          ✅ Yes              │
│ Documentation:     150+ pages          │
└────────────────────────────────────────┘
```

---

This visual guide complements the detailed `FRONTEND_INTEGRATION_GUIDE.md`.
