# Frontend Integration Guide
## Manakher School Backend API

**Version**: 1.0  
**Backend**: PocketBase 0.22.0  
**API Base URL**: `http://127.0.0.1:8090/api/`  
**Admin UI**: `http://127.0.0.1:8090/_/`  
**Date**: February 14, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
5. [Access Control & Permissions](#access-control--permissions)
6. [File Uploads](#file-uploads)
7. [Real-time Subscriptions](#real-time-subscriptions)
8. [Error Handling](#error-handling)
9. [Code Examples](#code-examples)
10. [Testing Credentials](#testing-credentials)

---

## Overview

### Technology Stack

- **Backend Framework**: PocketBase 0.22.0
- **Database**: SQLite (embedded)
- **Authentication**: Email + Password (JWT tokens)
- **Real-time**: WebSocket subscriptions
- **File Storage**: Built-in file handling

### Key Features

✅ **Auto-grading System** - Submissions automatically scored  
✅ **Role-based Access Control** - Admin, Teacher, Student roles  
✅ **Enrollment Management** - Students enrolled in classes  
✅ **File Attachments** - PDF and images on lessons  
✅ **Real-time Updates** - WebSocket subscriptions available  

### Server Information

```javascript
// Production (update with your production URL)
const API_URL = 'http://127.0.0.1:8090/api/'

// Health check endpoint
GET /api/health
```

---

## Authentication

### Authentication Flow

```javascript
// 1. Login
POST /api/collections/users/auth-with-password
Content-Type: application/json

{
  "identity": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "record": {
    "id": "RECORD_ID",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "teacher", // "admin", "teacher", or "student"
    "active": true,
    "created": "2024-01-15 10:00:00.000Z",
    "updated": "2024-01-15 10:00:00.000Z"
  }
}
```

### Using the Token

```javascript
// Include in all authenticated requests
Authorization: Bearer YOUR_TOKEN_HERE

// Example
fetch('http://127.0.0.1:8090/api/collections/courses/records', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Token Management

- **Storage**: Store token in localStorage or secure cookie
- **Expiration**: Tokens expire after session (implement refresh logic)
- **Validation**: Check token validity before requests
- **Logout**: Clear token from storage

### User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access - manage all collections |
| `teacher` | Manage assigned classes, lessons, activities |
| `student` | View enrolled classes, submit answers |

---

## Data Models

### 1. Users Collection (Auth)

**Collection Name**: `users`  
**Type**: `auth`

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  active: boolean;
  created: string; // ISO 8601
  updated: string; // ISO 8601
}
```

**Access**:
- List/View: Any authenticated user
- Create: Public (handled by PocketBase)
- Update: Self or Admin
- Delete: Admin only

---

### 2. Courses Collection

**Collection Name**: `courses`  
**Type**: `base`

```typescript
interface Course {
  id: string;
  title: string;
  description: string; // Rich text/HTML
  created: string;
  updated: string;
}
```

**Access**:
- List/View: Any authenticated user
- Create/Update/Delete: Admin only

**Example**:
```json
{
  "id": "jlzwi5jhmp8bgid",
  "title": "Mathematics Grade 10",
  "description": "<p>Algebra, Geometry, and Trigonometry</p>",
  "created": "2024-01-15 10:00:00.000Z",
  "updated": "2024-01-15 10:00:00.000Z"
}
```

---

### 3. Classes Collection

**Collection Name**: `classes`  
**Type**: `base`

```typescript
interface Class {
  id: string;
  course_id: string; // Relation to courses
  teacher_id: string; // Relation to users
  created: string;
  updated: string;
  
  // Expanded relations (use ?expand=course_id,teacher_id)
  expand?: {
    course_id?: Course;
    teacher_id?: User;
  };
}
```

**Access**:
- List/View: Admin or assigned teacher
- Create/Update/Delete: Admin only

**Important**: Teachers can only see classes where `teacher_id` matches their user ID.

---

### 4. Lessons Collection

**Collection Name**: `lessons`  
**Type**: `base`

```typescript
interface Lesson {
  id: string;
  class_id: string; // Relation to classes
  title: string;
  content: string; // Rich text/HTML
  attachments: string[]; // Array of file names
  created: string;
  updated: string;
  
  expand?: {
    class_id?: Class;
  };
}
```

**Access**:
- List/View: Admin, Teacher (own classes), Student (enrolled classes)
- Create/Update/Delete: Admin or Teacher (own classes)

**File Attachments**:
- Types allowed: PDF, PNG, APNG
- Max files: 5 per lesson
- Max size: 5MB per file

**File URLs**:
```javascript
// Format
`${API_URL}/files/${collectionId}/${recordId}/${filename}`

// Example
`http://127.0.0.1:8090/api/files/lessons/abc123/lesson1_xyz.pdf`
```

---

### 5. Activities Collection

**Collection Name**: `activities`  
**Type**: `base`

```typescript
interface Activity {
  id: string;
  class_id: string; // Relation to classes
  title: string;
  type: 'quiz' | 'exam';
  time_limit: number; // Minutes (optional)
  max_score: number;
  created: string;
  updated: string;
  
  expand?: {
    class_id?: Class;
  };
}
```

**Access**:
- List/View: Admin, Teacher (own classes), Student (enrolled classes)
- Create/Update/Delete: Admin or Teacher (own classes)

---

### 6. Questions Collection

**Collection Name**: `questions`  
**Type**: `base`

```typescript
interface Question {
  id: string;
  activity_id: string; // Relation to activities
  type: 'mcq' | 'tf' | 'short'; // Multiple choice, True/False, Short answer
  question: string;
  options?: string[]; // For MCQ only - array of options
  correct_answer: string | boolean; // Hidden from students
  created: string;
  updated: string;
}

// For MCQ
{
  "type": "mcq",
  "question": "What is 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correct_answer": "4" // or index: 1
}

// For True/False
{
  "type": "tf",
  "question": "The Earth is flat.",
  "correct_answer": false
}

// For Short Answer
{
  "type": "short",
  "question": "What is the capital of France?",
  "correct_answer": "Paris"
}
```

**Access**:
- List/View: Admin, Teacher (own classes)
- Create/Update/Delete: Admin or Teacher (own classes)

**⚠️ CRITICAL**: Students should NOT see `correct_answer` field!

**Student Query** (use fields parameter):
```javascript
GET /api/collections/questions/records?filter=(activity_id='ID')&fields=id,type,question,options

// Response excludes correct_answer
```

---

### 7. Submissions Collection

**Collection Name**: `submissions`  
**Type**: `base`

```typescript
interface Submission {
  id: string;
  activity_id: string; // Relation to activities
  student_id: string; // Relation to users
  answers: Record<string, any>; // JSON object: { questionId: answer }
  score: number; // Auto-calculated (read-only for students)
  created: string;
  updated: string;
}
```

**Answer Format**:
```json
{
  "answers": {
    "question_id_1": "4",           // MCQ answer
    "question_id_2": true,          // True/False answer
    "question_id_3": "Paris"        // Short answer
  }
}
```

**Access**:
- List/View: Admin, Teacher (own classes), Student (own submissions only)
- Create: Student (must be enrolled in class)
- Update/Delete: Admin only

**Business Rules**:
- ✅ One submission per student per activity
- ✅ Must be enrolled in class to submit
- ✅ Score auto-calculated on creation
- ❌ Students cannot modify after submission

---

### 8. Enrollments Collection

**Collection Name**: `enrollments`  
**Type**: `base`

```typescript
interface Enrollment {
  id: string;
  student_id: string; // Relation to users
  class_id: string; // Relation to classes
  enrolled_at: string; // Date
  status: 'active' | 'completed' | 'dropped';
  created: string;
  updated: string;
  
  expand?: {
    student_id?: User;
    class_id?: Class;
  };
}
```

**Access**:
- List/View: Admin, Teacher (own classes), Student (own enrollments)
- Create/Update/Delete: Admin only

**Business Rules**:
- ✅ One enrollment per student per class (unique constraint)
- ✅ Students can only access content in enrolled classes
- ✅ Status tracking for class completion

---

## API Endpoints

### Base URL Structure

```
GET    /api/collections/{collection}/records
GET    /api/collections/{collection}/records/{id}
POST   /api/collections/{collection}/records
PATCH  /api/collections/{collection}/records/{id}
DELETE /api/collections/{collection}/records/{id}
```

### Common Query Parameters

```javascript
// Pagination
?page=1&perPage=30

// Filtering
?filter=(field='value')
?filter=(field>'value' && field2='value')

// Sorting
?sort=-created  // Descending
?sort=+title    // Ascending

// Field selection (exclude sensitive data)
?fields=id,title,content

// Expand relations
?expand=course_id,teacher_id

// Combined
?page=1&perPage=20&filter=(active=true)&sort=-created&expand=course_id
```

### Filter Operators

```javascript
// Equality
?filter=(role='teacher')

// Comparison
?filter=(max_score>50)
?filter=(created>='2024-01-01')

// Logical operators
?filter=(role='teacher' && active=true)
?filter=(type='quiz' || type='exam')

// Relations
?filter=(class.teacher_id='USER_ID')

// Array contains
?filter=(options?~'Option A')
```

---

## Access Control & Permissions

### Permission Matrix

| Collection | Admin | Teacher | Student |
|------------|-------|---------|---------|
| **users** | Full | Read All | Read All |
| **courses** | Full | Read Only | Read Only |
| **classes** | Full | Read (own) | None |
| **lessons** | Full | CRUD (own) | Read (enrolled) |
| **activities** | Full | CRUD (own) | Read (enrolled) |
| **questions** | Full | CRUD (own) | None* |
| **submissions** | Full | Read (own) | Create/Read (own) |
| **enrollments** | Full | Read (own) | Read (own) |

*Students can get questions but without `correct_answer` field

### Access Rules Explained

#### Student Access to Lessons/Activities

Students can only access content if:
1. Authenticated
2. Enrolled in the class (`enrollments.student_id = user.id`)
3. Enrollment status is `active`
4. Class matches the content's class_id

```javascript
// Backend rule (automatic)
@request.auth.role = "student" && 
  @collection.enrollments.student_id = @request.auth.id && 
  @collection.enrollments.class_id = class_id && 
  @collection.enrollments.status = "active"
```

#### Teacher Access to Content

Teachers can only access content from their assigned classes:

```javascript
// Backend rule (automatic)
@request.auth.role = "teacher" && 
  @collection.classes.teacher_id = @request.auth.id
```

---

## File Uploads

### Uploading Files (Lesson Attachments)

```javascript
// Using FormData
const formData = new FormData();
formData.append('class_id', classId);
formData.append('title', 'Lesson Title');
formData.append('content', '<p>Lesson content...</p>');
formData.append('attachments', file1); // File object
formData.append('attachments', file2); // Can add multiple

fetch(`${API_URL}/collections/lessons/records`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type - browser will set it with boundary
  },
  body: formData
});
```

### File Constraints

- **Allowed Types**: `application/pdf`, `image/png`, `image/vnd.mozilla.apng`
- **Max Files**: 5 per lesson
- **Max Size**: 5MB per file
- **Field Name**: `attachments` (multiple)

### Accessing Files

```javascript
// File URL format
const fileUrl = `${API_URL}/files/${collectionName}/${recordId}/${filename}`;

// Example
const pdfUrl = `http://127.0.0.1:8090/api/files/lessons/abc123/lecture_notes.pdf`;

// Files require authentication
fetch(fileUrl, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Deleting Files

```javascript
// To remove a file, update the record with remaining files
PATCH /api/collections/lessons/records/{id}

{
  "attachments": ["file1.pdf"] // Only keep file1, others removed
}

// To remove all files
{
  "attachments": []
}
```

---

## Real-time Subscriptions

PocketBase supports WebSocket subscriptions for real-time updates.

### JavaScript SDK Example

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Authenticate first
await pb.collection('users').authWithPassword('email', 'password');

// Subscribe to collection
pb.collection('lessons').subscribe('*', function (e) {
  console.log(e.action); // create, update, delete
  console.log(e.record); // The changed record
});

// Subscribe to specific record
pb.collection('lessons').subscribe('RECORD_ID', function (e) {
  console.log(e.action);
  console.log(e.record);
});

// Unsubscribe
pb.collection('lessons').unsubscribe();
```

### Use Cases

- **Real-time lesson updates**: Teacher updates lesson, students see changes
- **New activities**: Notify students when new quiz is added
- **Submission feedback**: Notify students when grading is complete
- **Class announcements**: Real-time updates to class roster

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad Request | Check request data |
| 401 | Unauthorized | Re-authenticate |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Contact backend team |

### Error Response Format

```json
{
  "code": 400,
  "message": "Failed to create record.",
  "data": {
    "title": {
      "code": "validation_required",
      "message": "Missing required value."
    }
  }
}
```

### Common Errors

#### 1. Authentication Failed
```json
{
  "code": 400,
  "message": "Failed to authenticate.",
  "data": {}
}
```
**Solution**: Check email/password

#### 2. Not Enrolled
```json
{
  "code": 400,
  "message": "Student is not enrolled in this class"
}
```
**Solution**: Verify enrollment exists with `status='active'`

#### 3. Duplicate Submission
```json
{
  "code": 400,
  "message": "You have already submitted this activity"
}
```
**Solution**: Check existing submissions before creating

#### 4. Unauthorized Access
```json
{
  "code": 403,
  "message": "Forbidden"
}
```
**Solution**: Verify user has correct role/permissions

---

## Code Examples

### React/TypeScript Examples

#### 1. Setup API Client

```typescript
// api/client.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

export default pb;
```

#### 2. Authentication Hook

```typescript
// hooks/useAuth.ts
import { create } from 'zustand';
import { pb } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    set({ 
      user: authData.record as User, 
      token: authData.token,
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    pb.authStore.clear();
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
```

#### 3. Fetch Courses

```typescript
// api/courses.ts
import { pb } from './client';

export async function getCourses() {
  const records = await pb.collection('courses').getList(1, 50, {
    sort: '-created',
  });
  return records;
}

export async function getCourse(id: string) {
  const record = await pb.collection('courses').getOne(id);
  return record;
}
```

#### 4. Fetch Student's Enrolled Classes

```typescript
// api/enrollments.ts
import { pb } from './client';

export async function getStudentClasses(studentId: string) {
  const enrollments = await pb.collection('enrollments').getList(1, 50, {
    filter: `student_id='${studentId}' && status='active'`,
    expand: 'class_id.course_id,class_id.teacher_id',
    sort: '-created'
  });
  
  return enrollments.items.map(enrollment => enrollment.expand?.class_id);
}
```

#### 5. Fetch Lessons for Class

```typescript
// api/lessons.ts
import { pb } from './client';

export async function getLessonsByClass(classId: string) {
  const lessons = await pb.collection('lessons').getList(1, 50, {
    filter: `class_id='${classId}'`,
    sort: 'created',
  });
  return lessons;
}

export async function getLesson(id: string) {
  const lesson = await pb.collection('lessons').getOne(id, {
    expand: 'class_id'
  });
  return lesson;
}

// Get file URLs
export function getLessonFileUrl(lesson: Lesson, filename: string) {
  return pb.files.getUrl(lesson, filename);
}
```

#### 6. Submit Activity Answers

```typescript
// api/submissions.ts
import { pb } from './client';

interface SubmissionData {
  activity_id: string;
  student_id: string;
  answers: Record<string, any>;
}

export async function submitAnswers(data: SubmissionData) {
  // Check if already submitted
  const existing = await pb.collection('submissions').getList(1, 1, {
    filter: `activity_id='${data.activity_id}' && student_id='${data.student_id}'`
  });
  
  if (existing.items.length > 0) {
    throw new Error('Already submitted');
  }
  
  // Create submission (score auto-calculated by backend)
  const submission = await pb.collection('submissions').create(data);
  return submission;
}

export async function getStudentSubmissions(studentId: string) {
  const submissions = await pb.collection('submissions').getList(1, 100, {
    filter: `student_id='${studentId}'`,
    expand: 'activity_id',
    sort: '-created'
  });
  return submissions;
}
```

#### 7. Get Questions (Student View)

```typescript
// api/questions.ts
import { pb } from './client';

// For students - exclude correct_answer
export async function getActivityQuestionsForStudent(activityId: string) {
  const questions = await pb.collection('questions').getList(1, 100, {
    filter: `activity_id='${activityId}'`,
    fields: 'id,type,question,options', // Exclude correct_answer
    sort: 'created'
  });
  return questions;
}

// For teachers - include correct_answer
export async function getActivityQuestionsForTeacher(activityId: string) {
  const questions = await pb.collection('questions').getList(1, 100, {
    filter: `activity_id='${activityId}'`,
    sort: 'created'
  });
  return questions;
}
```

#### 8. Teacher: Create Activity with Questions

```typescript
// api/activities.ts
import { pb } from './client';

export async function createActivity(classId: string, data: {
  title: string;
  type: 'quiz' | 'exam';
  time_limit?: number;
  max_score: number;
}) {
  const activity = await pb.collection('activities').create({
    class_id: classId,
    ...data
  });
  return activity;
}

export async function createQuestion(activityId: string, data: {
  type: 'mcq' | 'tf' | 'short';
  question: string;
  options?: string[];
  correct_answer: any;
}) {
  const question = await pb.collection('questions').create({
    activity_id: activityId,
    ...data
  });
  return question;
}
```

#### 9. Real-time Subscription Component

```typescript
// components/LessonList.tsx
import { useEffect, useState } from 'react';
import { pb } from '../api/client';

export function LessonList({ classId }: { classId: string }) {
  const [lessons, setLessons] = useState([]);
  
  useEffect(() => {
    // Initial fetch
    pb.collection('lessons').getList(1, 50, {
      filter: `class_id='${classId}'`,
      sort: 'created'
    }).then(result => setLessons(result.items));
    
    // Subscribe to changes
    pb.collection('lessons').subscribe('*', (e) => {
      if (e.action === 'create') {
        setLessons(prev => [...prev, e.record]);
      } else if (e.action === 'update') {
        setLessons(prev => prev.map(l => l.id === e.record.id ? e.record : l));
      } else if (e.action === 'delete') {
        setLessons(prev => prev.filter(l => l.id !== e.record.id));
      }
    });
    
    return () => {
      pb.collection('lessons').unsubscribe();
    };
  }, [classId]);
  
  return (
    <div>
      {lessons.map(lesson => (
        <div key={lesson.id}>{lesson.title}</div>
      ))}
    </div>
  );
}
```

#### 10. File Upload Component

```typescript
// components/LessonForm.tsx
import { useState } from 'react';
import { pb } from '../api/client';

export function LessonForm({ classId }: { classId: string }) {
  const [files, setFiles] = useState<FileList | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append('class_id', classId);
    
    // Add files
    if (files) {
      Array.from(files).forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    await pb.collection('lessons').create(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Lesson Title" required />
      <textarea name="content" placeholder="Content" />
      <input 
        type="file" 
        multiple 
        accept=".pdf,.png"
        onChange={(e) => setFiles(e.target.files)}
      />
      <button type="submit">Create Lesson</button>
    </form>
  );
}
```

---

## Testing Credentials

### Creating Test Users

Use the Admin UI to create test users:

1. Visit: `http://127.0.0.1:8090/_/`
2. Go to **Collections > users**
3. Create users with different roles:

```javascript
// Admin User
{
  "email": "admin@school.com",
  "password": "Admin123!",
  "name": "Admin User",
  "role": "admin",
  "active": true
}

// Teacher User
{
  "email": "teacher@school.com",
  "password": "Teacher123!",
  "name": "John Teacher",
  "role": "teacher",
  "active": true
}

// Student User
{
  "email": "student@school.com",
  "password": "Student123!",
  "name": "Jane Student",
  "role": "student",
  "active": true
}
```

### Test Data Setup

1. **Create a Course** (as admin)
2. **Create a Class** (assign to teacher)
3. **Enroll Student** (link student to class)
4. **Create Lesson** (as teacher)
5. **Create Activity** (as teacher)
6. **Add Questions** (as teacher)
7. **Submit Answers** (as student)

---

## PocketBase JavaScript SDK

### Installation

```bash
npm install pocketbase
# or
yarn add pocketbase
```

### SDK Reference

```typescript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Auth
await pb.collection('users').authWithPassword(email, password);
pb.authStore.clear(); // Logout
pb.authStore.token; // Current token
pb.authStore.model; // Current user

// CRUD
await pb.collection('courses').getList(page, perPage, options);
await pb.collection('courses').getOne(id, options);
await pb.collection('courses').getFullList(options); // All records
await pb.collection('courses').create(data);
await pb.collection('courses').update(id, data);
await pb.collection('courses').delete(id);

// Realtime
pb.collection('lessons').subscribe('*', callback);
pb.collection('lessons').subscribe(recordId, callback);
pb.collection('lessons').unsubscribe();

// Files
pb.files.getUrl(record, filename);
```

**Documentation**: https://github.com/pocketbase/js-sdk

---

## Best Practices

### 1. Always Check Enrollment

Before showing class content to students:

```typescript
async function checkEnrollment(studentId: string, classId: string) {
  const enrollments = await pb.collection('enrollments').getList(1, 1, {
    filter: `student_id='${studentId}' && class_id='${classId}' && status='active'`
  });
  return enrollments.items.length > 0;
}
```

### 2. Never Expose Correct Answers to Students

```typescript
// ❌ BAD - fetches all fields
const questions = await pb.collection('questions').getList();

// ✅ GOOD - excludes correct_answer
const questions = await pb.collection('questions').getList(1, 50, {
  fields: 'id,type,question,options'
});
```

### 3. Handle Duplicate Submissions

```typescript
async function submitActivity(data) {
  try {
    return await pb.collection('submissions').create(data);
  } catch (error) {
    if (error.message.includes('already submitted')) {
      // Show user-friendly message
      alert('You have already submitted this activity');
    }
    throw error;
  }
}
```

### 4. Cache User Role

```typescript
// Store role in state/context after login
const { role } = authData.record;

// Use for conditional rendering
{role === 'teacher' && <TeacherDashboard />}
{role === 'student' && <StudentDashboard />}
{role === 'admin' && <AdminPanel />}
```

### 5. Optimize List Queries

```typescript
// Use pagination
const result = await pb.collection('lessons').getList(1, 20);

// Filter on backend, not frontend
const filtered = await pb.collection('lessons').getList(1, 50, {
  filter: `class_id='${classId}'`
});

// Select only needed fields
const minimal = await pb.collection('lessons').getList(1, 50, {
  fields: 'id,title,created'
});
```

### 6. Handle File URLs Properly

```typescript
// Generate file URLs using SDK
const fileUrl = pb.files.getUrl(lesson, lesson.attachments[0]);

// For authenticated files, include token
fetch(fileUrl, {
  headers: {
    'Authorization': `Bearer ${pb.authStore.token}`
  }
});
```

---

## Common Integration Patterns

### Student Dashboard Flow

1. **Login** → Get user data with role
2. **Fetch Enrollments** → Get enrolled classes
3. **For each class**:
   - Fetch lessons
   - Fetch activities
   - Check submission status
4. **Display** content with real-time updates

### Teacher Dashboard Flow

1. **Login** → Get user data
2. **Fetch Classes** → Where `teacher_id = user.id`
3. **For each class**:
   - Show/edit lessons
   - Show/edit activities
   - View student submissions
   - Manage questions

### Activity Submission Flow

1. **Check Enrollment** → Verify student enrolled
2. **Fetch Questions** → Without correct_answer field
3. **Student Answers** → Collect in UI
4. **Submit** → POST to submissions
5. **Auto-Grade** → Backend calculates score
6. **Show Result** → Display score to student

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause**: Token expired or invalid  
**Solution**: Re-authenticate user

```typescript
if (error.status === 401) {
  // Clear auth and redirect to login
  pb.authStore.clear();
  router.push('/login');
}
```

### Issue: 403 Forbidden

**Cause**: User lacks permission  
**Solution**: Check user role and access rules

```typescript
// Verify role before showing UI
if (user.role !== 'teacher') {
  return <AccessDenied />;
}
```

### Issue: Empty File URLs

**Cause**: Using wrong file URL format  
**Solution**: Use SDK method

```typescript
// ❌ Wrong
const url = `${API_URL}/files/${lesson.id}/${filename}`;

// ✅ Correct
const url = pb.files.getUrl(lesson, filename);
```

### Issue: Can't See Questions

**Cause**: Student trying to fetch questions (not allowed)  
**Solution**: Use fields parameter to exclude correct_answer

```typescript
const questions = await pb.collection('questions').getList(1, 50, {
  filter: `activity_id='${activityId}'`,
  fields: 'id,type,question,options' // Exclude correct_answer
});
```

---

## Contact & Support

### Backend Team

- **Repository**: `Manakher-School/backend_repo`
- **Server**: `http://127.0.0.1:8090`
- **Documentation**: See `README.md`, `QUICK_REFERENCE.md`

### For Issues

1. Check this guide first
2. Review [PocketBase documentation](https://pocketbase.io/docs/)
3. Check backend logs for errors
4. Contact backend team with:
   - Request URL
   - Request payload
   - Error message
   - Expected behavior

---

## Appendix

### A. Complete Type Definitions

```typescript
// types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  active: boolean;
  created: string;
  updated: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  created: string;
  updated: string;
}

export interface Class {
  id: string;
  course_id: string;
  teacher_id: string;
  created: string;
  updated: string;
  expand?: {
    course_id?: Course;
    teacher_id?: User;
  };
}

export interface Lesson {
  id: string;
  class_id: string;
  title: string;
  content: string;
  attachments: string[];
  created: string;
  updated: string;
  expand?: {
    class_id?: Class;
  };
}

export interface Activity {
  id: string;
  class_id: string;
  title: string;
  type: 'quiz' | 'exam';
  time_limit?: number;
  max_score: number;
  created: string;
  updated: string;
  expand?: {
    class_id?: Class;
  };
}

export interface Question {
  id: string;
  activity_id: string;
  type: 'mcq' | 'tf' | 'short';
  question: string;
  options?: string[];
  correct_answer?: any; // Only for teachers
  created: string;
  updated: string;
}

export interface Submission {
  id: string;
  activity_id: string;
  student_id: string;
  answers: Record<string, any>;
  score: number;
  created: string;
  updated: string;
  expand?: {
    activity_id?: Activity;
    student_id?: User;
  };
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped';
  created: string;
  updated: string;
  expand?: {
    student_id?: User;
    class_id?: Class;
  };
}
```

### B. Environment Variables

```bash
# .env
VITE_API_URL=http://127.0.0.1:8090
VITE_API_BASE=/api/
```

### C. Useful Admin Queries

```sql
-- Check all collections
SELECT name, type FROM _collections ORDER BY name;

-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Active enrollments
SELECT COUNT(*) FROM enrollments WHERE status='active';

-- Submission statistics
SELECT AVG(score) as avg_score, MAX(score) as max_score 
FROM submissions WHERE activity_id='ACTIVITY_ID';
```

---

**Last Updated**: February 14, 2026  
**Version**: 1.0  
**Backend Version**: PocketBase 0.22.0

---

*For any questions or clarifications, please contact the backend team.*
