# 📋 Frontend Team Handoff - Quick Summary

**Date**: February 14, 2026  
**Backend Status**: ✅ Production Ready  
**Full Documentation**: See `FRONTEND_INTEGRATION_GUIDE.md`

---

## 🎯 What Frontend Needs to Know

### Server Details

```
API Base URL:  http://127.0.0.1:8090/api/
Admin UI:      http://127.0.0.1:8090/_/
Auth Method:   JWT Bearer Token
Data Format:   JSON
```

### Quick Start

```bash
# Install SDK
npm install pocketbase

# Basic usage
import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');

// Login
const authData = await pb.collection('users').authWithPassword(
  'user@example.com', 
  'password'
);

// Use token automatically in all requests
const courses = await pb.collection('courses').getList();
```

---

## 📊 Data Structure Overview

### 8 Collections

1. **users** (auth) - Admin, teacher, student accounts
2. **courses** - Course catalog
3. **classes** - Class instances (course + teacher)
4. **lessons** - Lesson content with file attachments
5. **activities** - Quizzes and exams
6. **questions** - Activity questions (MCQ, T/F, Short answer)
7. **submissions** - Student answers (auto-graded)
8. **enrollments** - Student-class relationships

### Relationships

```
Course → Class → Lessons
             ↓
         Activities → Questions
             ↓
        Submissions (students)

Student → Enrollment → Class
```

---

## 👥 User Roles & Access

| Role | Can Do |
|------|--------|
| **Admin** | Everything - full system control |
| **Teacher** | Manage own classes, lessons, activities, questions |
| **Student** | View enrolled classes, submit answers |

**Critical Rules**:
- ⚠️ Students CANNOT see `correct_answer` field in questions
- ⚠️ Students can only access enrolled classes (status='active')
- ⚠️ Teachers can only access their assigned classes
- ⚠️ One submission per student per activity

---

## 🔐 Authentication Flow

```typescript
// 1. Login
const auth = await pb.collection('users').authWithPassword(email, password);
// Returns: { token, record: { id, email, name, role, ... } }

// 2. Store user info
localStorage.setItem('user', JSON.stringify(auth.record));
localStorage.setItem('token', auth.token);

// 3. Token auto-used in subsequent requests
const data = await pb.collection('courses').getList();

// 4. Logout
pb.authStore.clear();
localStorage.clear();
```

---

## 📝 Common Operations

### Student: Get Enrolled Classes

```typescript
const enrollments = await pb.collection('enrollments').getList(1, 50, {
  filter: `student_id='${userId}' && status='active'`,
  expand: 'class_id.course_id,class_id.teacher_id'
});

const classes = enrollments.items.map(e => e.expand.class_id);
```

### Student: Get Lessons for Class

```typescript
const lessons = await pb.collection('lessons').getList(1, 50, {
  filter: `class_id='${classId}'`,
  sort: 'created'
});
```

### Student: Get Quiz Questions (WITHOUT answers)

```typescript
const questions = await pb.collection('questions').getList(1, 100, {
  filter: `activity_id='${activityId}'`,
  fields: 'id,type,question,options' // ⚠️ EXCLUDE correct_answer
});
```

### Student: Submit Answers

```typescript
const submission = await pb.collection('submissions').create({
  activity_id: activityId,
  student_id: userId,
  answers: {
    "question_id_1": "answer1",
    "question_id_2": true,
    "question_id_3": "Paris"
  }
});

console.log('Auto-graded score:', submission.score);
```

### Teacher: Get Own Classes

```typescript
const classes = await pb.collection('classes').getList(1, 50, {
  filter: `teacher_id='${userId}'`,
  expand: 'course_id'
});
```

### Teacher: Create Activity with Questions

```typescript
// 1. Create activity
const activity = await pb.collection('activities').create({
  class_id: classId,
  title: 'Chapter 1 Quiz',
  type: 'quiz',
  time_limit: 30,
  max_score: 100
});

// 2. Add questions
await pb.collection('questions').create({
  activity_id: activity.id,
  type: 'mcq',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correct_answer: '4'
});
```

### Teacher: View Student Submissions

```typescript
const submissions = await pb.collection('submissions').getList(1, 100, {
  filter: `activity_id='${activityId}'`,
  expand: 'student_id',
  sort: '-score'
});
```

---

## 📎 File Handling

### Upload Files (Lesson Attachments)

```typescript
const formData = new FormData();
formData.append('class_id', classId);
formData.append('title', 'Lesson Title');
formData.append('content', '<p>Content...</p>');
formData.append('attachments', pdfFile);    // File object
formData.append('attachments', imageFile);  // Can add multiple

await pb.collection('lessons').create(formData);
```

### Get File URLs

```typescript
// For each attachment
const fileUrl = pb.files.getUrl(lesson, lesson.attachments[0]);

// Display
<a href={fileUrl} target="_blank">View PDF</a>
<img src={fileUrl} alt="Attachment" />
```

**Constraints**:
- Types: PDF, PNG only
- Max: 5 files per lesson
- Size: 5MB per file

---

## ⚡ Real-time Updates

```typescript
// Subscribe to lessons
pb.collection('lessons').subscribe('*', (e) => {
  if (e.action === 'create') {
    // New lesson added
    setLessons(prev => [...prev, e.record]);
  } else if (e.action === 'update') {
    // Lesson updated
    setLessons(prev => prev.map(l => 
      l.id === e.record.id ? e.record : l
    ));
  }
});

// Cleanup
pb.collection('lessons').unsubscribe();
```

---

## ⚠️ Critical Things to Remember

### 1. Never Show Correct Answers to Students
```typescript
// ❌ BAD
const questions = await pb.collection('questions').getList();

// ✅ GOOD
const questions = await pb.collection('questions').getList(1, 50, {
  fields: 'id,type,question,options' // No correct_answer
});
```

### 2. Check Enrollment Before Showing Content
```typescript
const isEnrolled = await pb.collection('enrollments').getList(1, 1, {
  filter: `student_id='${userId}' && class_id='${classId}' && status='active'`
});

if (isEnrolled.items.length === 0) {
  return <NotEnrolled />;
}
```

### 3. Handle Duplicate Submissions
```typescript
try {
  await pb.collection('submissions').create(data);
} catch (error) {
  if (error.message.includes('already submitted')) {
    alert('You already submitted this activity');
  }
}
```

### 4. Handle 401 (Token Expired)
```typescript
pb.afterSend = function (response, data) {
  if (response.status === 401) {
    pb.authStore.clear();
    router.push('/login');
  }
  return data;
};
```

---

## 🧪 Test Users

Create these in Admin UI for testing:

```javascript
// Admin
{ email: 'admin@school.com', password: 'Admin123!', role: 'admin' }

// Teacher
{ email: 'teacher@school.com', password: 'Teacher123!', role: 'teacher' }

// Student
{ email: 'student@school.com', password: 'Student123!', role: 'student' }
```

**Setup Flow**:
1. Create course (as admin)
2. Create class with teacher (as admin)
3. Enroll student in class (as admin)
4. Create lessons/activities (as teacher)
5. Submit answers (as student)

---

## 📚 TypeScript Types

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  active: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Lesson {
  id: string;
  class_id: string;
  title: string;
  content: string; // HTML
  attachments: string[]; // File names
}

interface Activity {
  id: string;
  class_id: string;
  title: string;
  type: 'quiz' | 'exam';
  time_limit?: number; // minutes
  max_score: number;
}

interface Question {
  id: string;
  activity_id: string;
  type: 'mcq' | 'tf' | 'short';
  question: string;
  options?: string[]; // For MCQ
  correct_answer?: any; // Only teachers see this
}

interface Submission {
  id: string;
  activity_id: string;
  student_id: string;
  answers: Record<string, any>;
  score: number; // Auto-calculated
}

interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped';
}
```

**Full types**: See `FRONTEND_INTEGRATION_GUIDE.md` Appendix A

---

## 🔍 Query Tips

```typescript
// Pagination
.getList(page, perPage, options)

// Filtering
filter: `role='teacher'`
filter: `score>50 && status='active'`

// Sorting
sort: '-created'  // Descending
sort: '+title'    // Ascending

// Expand relations
expand: 'course_id,teacher_id'

// Select fields
fields: 'id,title,created'

// Combined
.getList(1, 20, {
  filter: `class_id='${id}' && active=true`,
  sort: '-created',
  expand: 'teacher_id'
})
```

---

## 📖 Resources

1. **Full Integration Guide**: `FRONTEND_INTEGRATION_GUIDE.md` (150+ pages)
2. **Backend Quick Ref**: `QUICK_REFERENCE.md`
3. **Backend Status**: `CLEANUP_SUMMARY.md`
4. **PocketBase JS SDK**: https://github.com/pocketbase/js-sdk
5. **PocketBase Docs**: https://pocketbase.io/docs/

---

## 🤝 Backend Team Contact

- **Repository**: Manakher-School/backend_repo
- **Server**: http://127.0.0.1:8090
- **Status**: ✅ Running and validated

**For Issues**: Include request URL, payload, error message, expected behavior

---

## ✅ Next Steps for Frontend

1. ✅ Read `FRONTEND_INTEGRATION_GUIDE.md`
2. ✅ Install PocketBase JS SDK
3. ✅ Set up test users in Admin UI
4. ✅ Implement authentication
5. ✅ Build role-based routing
6. ✅ Test data fetching with different roles
7. ✅ Implement file upload/download
8. ✅ Add real-time subscriptions (optional)

---

**Backend is ready for integration! 🚀**
