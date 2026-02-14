# PocketBase API Service - Quick Reference

## 🎯 Import

```javascript
import {
  // Data Fetching
  fetchHomework,
  fetchQuizzes,
  fetchMaterials,
  fetchNews,
  fetchExams,
  
  // Submissions
  submitHomework,
  submitQuiz,
  getStudentSubmissions,
  
  // Helpers
  getBilingualValue,
  getCurrentLanguage,
  getFileUrl,
  
  // Auth
  isAuthenticated,
  getCurrentUser,
  login,
  logout,
  
  // Direct PocketBase instance
  pb
} from '../services/api';
```

---

## 📚 API Functions

### `fetchHomework(grade?)`
Fetch homework assignments from PocketBase.

```javascript
// All homework
const homework = await fetchHomework();

// Filtered by grade
const grade10Homework = await fetchHomework('Grade 10');

// Returns:
[
  {
    id: "abc123",
    title: { ar: "واجب الرياضيات", en: "Math Homework" },
    content: { ar: "حل التمارين", en: "Solve exercises" },
    subject: { ar: "رياضيات", en: "Math" },
    grade: "Grade 10",
    dueDate: "2026-02-15T23:59:59Z",
    type: "homework",
    allowFileSubmission: true,
    allowTextSubmission: true
  }
]
```

---

### `fetchQuizzes(grade?)`
Fetch quizzes from PocketBase.

```javascript
const quizzes = await fetchQuizzes('Grade 11');

// Returns:
[
  {
    id: "quiz123",
    title: { ar: "اختبار الفيزياء", en: "Physics Quiz" },
    content: { ar: "...", en: "..." },
    subject: { ar: "فيزياء", en: "Physics" },
    grade: "Grade 11",
    duration: 30, // minutes
    totalPoints: 100,
    questions: [...],
    type: "quiz"
  }
]
```

---

### `fetchMaterials(grade?, subject?)`
Fetch learning materials from PocketBase.

```javascript
// All materials
const materials = await fetchMaterials();

// Filtered by grade
const grade10Materials = await fetchMaterials('Grade 10');

// Filtered by grade and subject
const mathMaterials = await fetchMaterials('Grade 10', 'Math');

// Returns:
[
  {
    id: "mat123",
    title: { ar: "كتاب الرياضيات", en: "Math Textbook" },
    content: { ar: "...", en: "..." },
    subject: { ar: "رياضيات", en: "Math" },
    grade: "Grade 10",
    files: [
      {
        name: "chapter1.pdf",
        url: "http://127.0.0.1:8090/api/files/...",
        type: "pdf"
      }
    ],
    type: "material"
  }
]
```

---

### `fetchNews(grade?, limit?)`
Fetch news items from PocketBase.

```javascript
// All news
const news = await fetchNews();

// Limited to 5 items
const recentNews = await fetchNews(null, 5);

// For specific grade
const grade10News = await fetchNews('Grade 10');

// Returns:
[
  {
    id: "news123",
    title: { ar: "أخبار المدرسة", en: "School News" },
    content: { ar: "...", en: "..." },
    category: "Events",
    imageUrl: "http://127.0.0.1:8090/api/files/.../image.jpg",
    imageThumbnail: "http://.../image_300x300.jpg",
    publishedAt: "2026-02-10T09:00:00Z",
    important: false,
    type: "news"
  }
]
```

---

### `fetchExams(grade?)`
Fetch exam schedule from PocketBase.

```javascript
const exams = await fetchExams('Grade 10');

// Returns:
[
  {
    id: "exam123",
    title: { ar: "امتحان الرياضيات", en: "Math Exam" },
    subject: { ar: "رياضيات", en: "Math" },
    grade: "Grade 10",
    date: "2026-03-01T09:00:00Z",
    startTime: "08:00",
    endTime: "10:00",
    room: { ar: "غرفة 101", en: "Room 101" },
    duration: 120
  }
]
```

---

### `submitHomework(homeworkId, studentId, submission)`
Submit homework to PocketBase.

```javascript
const result = await submitHomework(
  'homework_id_123',
  'student_id_456',
  {
    text: 'My homework answer',
    files: ['file1.pdf', 'file2.jpg']
  }
);

// Returns:
{
  success: true,
  submissionId: "sub123",
  message: "Homework submitted successfully"
}
```

---

### `submitQuiz(quizId, studentId, answers)`
Submit quiz answers to PocketBase.

```javascript
const result = await submitQuiz(
  'quiz_id_123',
  'student_id_456',
  {
    'question_1': 'A',
    'question_2': 'B',
    'question_3': 'C'
  }
);

// Returns:
{
  success: true,
  submissionId: "sub456",
  score: 85,
  totalPoints: 100,
  message: "Quiz submitted successfully"
}
```

---

### `getStudentSubmissions(studentId, activityType?)`
Fetch all submissions for a student.

```javascript
// All submissions
const submissions = await getStudentSubmissions('student_id_456');

// Only homework submissions
const homeworkSubmissions = await getStudentSubmissions(
  'student_id_456',
  'homework'
);

// Returns PocketBase records array
```

---

### `getBilingualValue(bilingualObj, lang?)`
Extract value from bilingual JSON object.

```javascript
const title = {
  ar: "واجب الرياضيات",
  en: "Math Homework"
};

// Get Arabic
const arTitle = getBilingualValue(title, 'ar');
// => "واجب الرياضيات"

// Get English
const enTitle = getBilingualValue(title, 'en');
// => "Math Homework"

// Auto-detect from i18next
const currentTitle = getBilingualValue(title);
// => Returns based on current language
```

---

### `getCurrentLanguage()`
Get current language from localStorage/i18next.

```javascript
const lang = getCurrentLanguage();
// => 'ar' or 'en'
```

---

### `getFileUrl(record, filename)`
Build PocketBase file URL.

```javascript
const lesson = await pb.collection('lessons').getOne('lesson_id');
const fileUrl = getFileUrl(lesson, lesson.attachments[0]);
// => "http://127.0.0.1:8090/api/files/lessons/lesson_id/file.pdf"
```

---

### `isAuthenticated()`
Check if user is logged in.

```javascript
if (isAuthenticated()) {
  console.log('User is logged in');
}
```

---

### `getCurrentUser()`
Get current logged-in user.

```javascript
const user = getCurrentUser();
if (user) {
  console.log('User:', user.email, user.role);
}
```

---

### `login(email, password)`
Login to PocketBase.

```javascript
try {
  const result = await login('student@school.com', 'password123');
  console.log('Logged in:', result.user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

---

### `logout()`
Logout and clear auth data.

```javascript
logout();
console.log('Logged out');
```

---

## 🎨 Common Usage Patterns

### Pattern 1: Basic Component Data Fetch

```javascript
import { useState, useEffect } from 'react';
import { fetchHomework, getBilingualValue } from '../services/api';
import { useTranslation } from 'react-i18next';

function HomeworkList() {
  const { i18n } = useTranslation();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomework('Grade 10')
      .then(data => setHomework(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {homework.map(item => (
        <div key={item.id}>
          <h3>{getBilingualValue(item.title, i18n.language)}</h3>
        </div>
      ))}
    </div>
  );
}
```

---

### Pattern 2: Custom Hook

```javascript
function useHomework(grade) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchHomework(grade)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [grade]);

  return { data, loading, error };
}

// Usage:
const { data: homework, loading, error } = useHomework('Grade 10');
```

---

### Pattern 3: With Error Handling & Offline

```javascript
async function loadData() {
  try {
    const data = await fetchNews();
    setNews(data);
    localStorage.setItem('cached_news', JSON.stringify(data));
  } catch (error) {
    console.error('Error:', error);
    
    // Fallback to cache
    const cached = localStorage.getItem('cached_news');
    if (cached) {
      setNews(JSON.parse(cached));
    }
  }
}
```

---

### Pattern 4: Bilingual Content Display

```javascript
import { getBilingualValue } from '../services/api';

function NewsCard({ news, language }) {
  return (
    <div>
      <h2>{getBilingualValue(news.title, language)}</h2>
      <p>{getBilingualValue(news.content, language)}</p>
      {news.imageUrl && <img src={news.imageUrl} alt="News" />}
    </div>
  );
}
```

---

### Pattern 5: File Downloads

```javascript
function MaterialCard({ material }) {
  return (
    <div>
      <h3>{getBilingualValue(material.title)}</h3>
      <div>
        {material.files?.map((file, index) => (
          <a 
            key={index}
            href={file.url}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            {file.name} ({file.type})
          </a>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 Error Handling

All API functions throw errors that should be caught:

```javascript
try {
  const data = await fetchHomework();
  // Success
} catch (error) {
  console.error('Failed:', error.message);
  // Show user-friendly error
  alert('Failed to load homework. Please try again.');
}
```

---

## 📝 TypeScript Support (Future)

If you add TypeScript later:

```typescript
interface BilingualText {
  ar: string;
  en: string;
}

interface Homework {
  id: string;
  title: BilingualText;
  content: BilingualText;
  subject: BilingualText;
  grade: string;
  dueDate: string;
  type: 'homework';
  allowFileSubmission: boolean;
  allowTextSubmission: boolean;
}
```

---

## 🚀 Performance Tips

1. **Cache data in localStorage** for offline access
2. **Use Promise.all()** to fetch multiple collections in parallel
3. **Implement pagination** for large datasets
4. **Debounce search** to avoid excessive API calls
5. **Use PocketBase realtime** for live updates (advanced)

---

## 📌 Remember

- Always use `getBilingualValue()` for bilingual fields
- Check `isAuthenticated()` before user-specific operations
- Handle errors gracefully with try/catch
- Cache data for offline support
- Use the current language from i18next

---

**Need more examples?** See `src/examples/` folder for complete component implementations.
