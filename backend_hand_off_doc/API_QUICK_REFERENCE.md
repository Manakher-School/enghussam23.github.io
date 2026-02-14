# API Quick Reference Card
## Frontend Developer Cheat Sheet

---

## 🔐 Authentication

```javascript
// Login
const auth = await pb.collection('users').authWithPassword(email, password);
// Returns: { token, record: { id, email, name, role, ... } }

// Check if authenticated
pb.authStore.isValid

// Get current user
pb.authStore.model

// Get current token
pb.authStore.token

// Logout
pb.authStore.clear()
```

---

## 📚 Collections Overview

| Collection | What it stores |
|-----------|----------------|
| `users` | Admin, teacher, student accounts |
| `courses` | Course catalog |
| `classes` | Class instances (course + teacher) |
| `lessons` | Lesson content with files |
| `activities` | Quizzes and exams |
| `questions` | Activity questions |
| `submissions` | Student answers (auto-graded) |
| `enrollments` | Student-class links |

---

## 🎯 Common Queries

### Get All Records
```javascript
const records = await pb.collection('courses').getFullList();
```

### Get Paginated List
```javascript
const result = await pb.collection('lessons').getList(1, 20, {
  sort: '-created'
});
// result.items, result.totalPages, result.totalItems
```

### Get One Record
```javascript
const course = await pb.collection('courses').getOne('RECORD_ID');
```

### Create Record
```javascript
const record = await pb.collection('courses').create({
  title: 'Math 101',
  description: 'Introduction to Math'
});
```

### Update Record
```javascript
const record = await pb.collection('courses').update('RECORD_ID', {
  title: 'Updated Title'
});
```

### Delete Record
```javascript
await pb.collection('courses').delete('RECORD_ID');
```

---

## 🔍 Filtering

```javascript
// Single condition
filter: `role='teacher'`

// Multiple conditions (AND)
filter: `role='teacher' && active=true`

// OR condition
filter: `type='quiz' || type='exam'`

// Greater than / Less than
filter: `score>80`
filter: `created>='2024-01-01'`

// Contains
filter: `title~'math'`

// Relation filtering
filter: `class.teacher_id='USER_ID'`

// Array contains
filter: `attachments?~'pdf'`
```

---

## ↕️ Sorting

```javascript
sort: '-created'  // Descending (newest first)
sort: '+title'    // Ascending (A-Z)
sort: '-score,+name' // Multiple fields
```

---

## 🔗 Expanding Relations

```javascript
// Single relation
expand: 'course_id'

// Multiple relations
expand: 'course_id,teacher_id'

// Nested relations
expand: 'class_id.course_id'

// Access expanded data
const lesson = await pb.collection('lessons').getOne('ID', {
  expand: 'class_id.course_id'
});
console.log(lesson.expand.class_id.expand.course_id.title);
```

---

## 📝 Field Selection

```javascript
// Include only specific fields
fields: 'id,title,created'

// Exclude correct_answer (for students)
fields: 'id,type,question,options'
```

---

## 👤 Student Queries

### Get Enrolled Classes
```javascript
const enrollments = await pb.collection('enrollments').getList(1, 50, {
  filter: `student_id='${userId}' && status='active'`,
  expand: 'class_id.course_id'
});
const classes = enrollments.items.map(e => e.expand.class_id);
```

### Get Lessons for Class
```javascript
const lessons = await pb.collection('lessons').getList(1, 50, {
  filter: `class_id='${classId}'`,
  sort: 'created'
});
```

### Get Activity Questions (WITHOUT answers)
```javascript
const questions = await pb.collection('questions').getList(1, 100, {
  filter: `activity_id='${activityId}'`,
  fields: 'id,type,question,options', // ⚠️ No correct_answer
  sort: 'created'
});
```

### Submit Answers
```javascript
const submission = await pb.collection('submissions').create({
  activity_id: 'ACTIVITY_ID',
  student_id: 'STUDENT_ID',
  answers: {
    "question_id_1": "option_b",
    "question_id_2": true,
    "question_id_3": "Paris"
  }
});
// submission.score is auto-calculated
```

### Get My Submissions
```javascript
const submissions = await pb.collection('submissions').getList(1, 100, {
  filter: `student_id='${userId}'`,
  expand: 'activity_id',
  sort: '-created'
});
```

---

## 👨‍🏫 Teacher Queries

### Get My Classes
```javascript
const classes = await pb.collection('classes').getList(1, 50, {
  filter: `teacher_id='${userId}'`,
  expand: 'course_id'
});
```

### Create Activity
```javascript
const activity = await pb.collection('activities').create({
  class_id: 'CLASS_ID',
  title: 'Chapter 1 Quiz',
  type: 'quiz',
  time_limit: 30,
  max_score: 100
});
```

### Create Question
```javascript
// MCQ
await pb.collection('questions').create({
  activity_id: 'ACTIVITY_ID',
  type: 'mcq',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correct_answer: '4'
});

// True/False
await pb.collection('questions').create({
  activity_id: 'ACTIVITY_ID',
  type: 'tf',
  question: 'The Earth is flat.',
  correct_answer: false
});

// Short Answer
await pb.collection('questions').create({
  activity_id: 'ACTIVITY_ID',
  type: 'short',
  question: 'Capital of France?',
  correct_answer: 'Paris'
});
```

### Get Student Submissions
```javascript
const submissions = await pb.collection('submissions').getList(1, 100, {
  filter: `activity_id='${activityId}'`,
  expand: 'student_id',
  sort: '-score'
});
```

### Create Lesson with Files
```javascript
const formData = new FormData();
formData.append('class_id', 'CLASS_ID');
formData.append('title', 'Introduction to Algebra');
formData.append('content', '<p>Today we will learn...</p>');
formData.append('attachments', pdfFile);  // File object
formData.append('attachments', imageFile); // Can add multiple

const lesson = await pb.collection('lessons').create(formData);
```

---

## 🗂️ File Handling

### Get File URL
```javascript
const fileUrl = pb.files.getUrl(record, filename);

// Example
const pdfUrl = pb.files.getUrl(lesson, lesson.attachments[0]);
```

### Download File (in React)
```javascript
<a href={pb.files.getUrl(lesson, filename)} download>
  Download {filename}
</a>
```

### Display Image
```javascript
<img src={pb.files.getUrl(lesson, filename)} alt="Attachment" />
```

### Upload Files
```javascript
const formData = new FormData();
formData.append('field_name', fileObject);
formData.append('field_name', anotherFile); // Multiple files

const record = await pb.collection('lessons').create(formData);
```

**Constraints**:
- Types: PDF, PNG
- Max: 5 files per lesson
- Size: 5MB per file

---

## 📡 Real-time Subscriptions

### Subscribe to All Changes
```javascript
pb.collection('lessons').subscribe('*', (e) => {
  console.log(e.action); // 'create', 'update', 'delete'
  console.log(e.record); // The changed record
});
```

### Subscribe to Specific Record
```javascript
pb.collection('lessons').subscribe('RECORD_ID', (e) => {
  console.log(e.action, e.record);
});
```

### Unsubscribe
```javascript
pb.collection('lessons').unsubscribe();
// or specific record
pb.collection('lessons').unsubscribe('RECORD_ID');
```

### React Example
```javascript
useEffect(() => {
  // Subscribe
  pb.collection('lessons').subscribe('*', (e) => {
    if (e.action === 'create') {
      setLessons(prev => [...prev, e.record]);
    }
  });
  
  // Cleanup
  return () => pb.collection('lessons').unsubscribe();
}, []);
```

---

## ⚠️ Error Handling

### Try-Catch Pattern
```javascript
try {
  const record = await pb.collection('submissions').create(data);
} catch (error) {
  if (error.status === 400) {
    console.error('Validation error:', error.data);
  } else if (error.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.status === 403) {
    // Forbidden - insufficient permissions
  }
}
```

### Check Specific Errors
```javascript
try {
  await pb.collection('submissions').create(data);
} catch (error) {
  if (error.message.includes('already submitted')) {
    alert('You have already submitted this activity');
  } else if (error.message.includes('not enrolled')) {
    alert('You are not enrolled in this class');
  } else {
    console.error('Error:', error);
  }
}
```

---

## 🛡️ Security Best Practices

### ✅ DO

```javascript
// Exclude sensitive fields for students
const questions = await pb.collection('questions').getList(1, 50, {
  fields: 'id,type,question,options' // No correct_answer
});

// Check enrollment before showing content
const isEnrolled = await checkEnrollment(studentId, classId);

// Validate user role before rendering UI
if (user.role === 'teacher') {
  return <TeacherDashboard />;
}

// Store token securely
localStorage.setItem('token', pb.authStore.token);
```

### ❌ DON'T

```javascript
// Don't expose correct answers to students
const questions = await pb.collection('questions').getFullList(); // ❌

// Don't skip enrollment checks
// Just because you have classId doesn't mean student can access it

// Don't store sensitive data in plain text
localStorage.setItem('password', password); // ❌

// Don't trust client-side role checks alone
// Backend enforces access rules regardless
```

---

## 🔄 Common Patterns

### Fetch with Pagination
```javascript
const [items, setItems] = useState([]);
const [page, setPage] = useState(1);

const fetchItems = async () => {
  const result = await pb.collection('lessons').getList(page, 20);
  setItems(result.items);
};
```

### Infinite Scroll
```javascript
const [items, setItems] = useState([]);
const [page, setPage] = useState(1);

const loadMore = async () => {
  const result = await pb.collection('lessons').getList(page, 20);
  setItems(prev => [...prev, ...result.items]);
  setPage(prev => prev + 1);
};
```

### Search/Filter
```javascript
const [searchTerm, setSearchTerm] = useState('');

const filteredItems = await pb.collection('courses').getList(1, 50, {
  filter: `title~'${searchTerm}'`,
  sort: '-created'
});
```

### Create with Validation
```javascript
const createLesson = async (data) => {
  // Client-side validation
  if (!data.title || !data.class_id) {
    throw new Error('Title and class required');
  }
  
  try {
    const lesson = await pb.collection('lessons').create(data);
    return lesson;
  } catch (error) {
    // Handle server validation errors
    console.error('Server error:', error.data);
    throw error;
  }
};
```

---

## 🎨 Answer Format Reference

### MCQ (Multiple Choice)
```javascript
// Question
{
  type: 'mcq',
  options: ['Option A', 'Option B', 'Option C'],
  correct_answer: 'Option B'
}

// Student Answer
answers: {
  "question_id": "Option B"  // or index: 1
}
```

### True/False
```javascript
// Question
{
  type: 'tf',
  correct_answer: false
}

// Student Answer
answers: {
  "question_id": false
}
```

### Short Answer
```javascript
// Question
{
  type: 'short',
  correct_answer: 'Paris'
}

// Student Answer
answers: {
  "question_id": "Paris"
}
```

---

## 📊 HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad Request | Check validation errors |
| 401 | Unauthorized | Re-authenticate |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Contact backend team |

---

## 🧪 Testing

### Create Test User
```javascript
// Use Admin UI: http://127.0.0.1:8090/_/
// Or via API (admin only)
await pb.collection('users').create({
  email: 'test@example.com',
  password: 'Test123!',
  passwordConfirm: 'Test123!',
  name: 'Test User',
  role: 'student',
  active: true
});
```

### Test Data Flow
1. Create course (admin)
2. Create class with teacher (admin)
3. Enroll student (admin)
4. Create lesson (teacher)
5. Create activity (teacher)
6. Add questions (teacher)
7. Submit answers (student)
8. View score (student)

---

## 📦 SDK Installation

```bash
npm install pocketbase
# or
yarn add pocketbase
```

```javascript
// Import
import PocketBase from 'pocketbase';

// Initialize
const pb = new PocketBase('http://127.0.0.1:8090');

// Use
const courses = await pb.collection('courses').getFullList();
```

---

## 🔗 Useful Links

- **Backend Docs**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Quick Start**: `FRONTEND_HANDOFF.md`
- **Architecture**: `ARCHITECTURE_DIAGRAM.md`
- **PocketBase SDK**: https://github.com/pocketbase/js-sdk
- **PocketBase Docs**: https://pocketbase.io/docs/

---

## 💡 Pro Tips

1. **Cache user role** in state after login for conditional rendering
2. **Use TypeScript** for better type safety
3. **Implement token refresh** logic for long sessions
4. **Use real-time subscriptions** for live updates
5. **Always filter sensitive data** server-side (backend enforces this)
6. **Batch requests** when possible to reduce API calls
7. **Handle loading states** for better UX
8. **Implement error boundaries** in React
9. **Use optimistic updates** for better perceived performance
10. **Test with all three roles** (admin, teacher, student)

---

**Last Updated**: February 14, 2026  
**Backend**: PocketBase 0.22.0  
**Status**: ✅ Production Ready
