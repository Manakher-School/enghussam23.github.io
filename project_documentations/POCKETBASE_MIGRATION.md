# PocketBase Migration Guide

This guide explains how to migrate your Al-Manakhir School platform from local JSON data to PocketBase backend.

## 📁 Migration Files Created

### 1. PocketBase Schema/Migration Files
- **`pb_migrations/create_news_collection.js`** - JavaScript migration for news collection
- **`pb_migrations/news_collection_schema.json`** - JSON schema (for manual import via UI)

### 2. API Service Layer
- **`src/services/api.js`** - Main data service with all PocketBase API calls

### 3. Integration Examples
- **`src/examples/HomeworkPageWithPocketBase.jsx`** - Example component
- **`src/examples/DataContextWithPocketBase.jsx`** - Updated DataContext

---

## 🚀 Step-by-Step Migration

### Step 1: Apply PocketBase Schema

**Option A: Using JavaScript Migration (Recommended)**
```bash
# Copy the migration file to your PocketBase directory
cp pb_migrations/create_news_collection.js /path/to/pocketbase/pb_migrations/

# Restart PocketBase - it will auto-apply migrations
./pocketbase serve
```

**Option B: Using Admin UI**
1. Open PocketBase Admin UI: http://127.0.0.1:8090/_/
2. Go to **Collections** > **New Collection**
3. Import the schema from `pb_migrations/news_collection_schema.json`

### Step 2: Verify Existing Collections

Ensure your PocketBase has these collections:

| Collection | Purpose | Filter Field |
|------------|---------|--------------|
| `activities` | Stores homework & quizzes | `type='homework'` or `type='quiz'` |
| `lessons` | Stores materials | `attachments` field (array of files) |
| `news` | Stores news items | `is_published=true` |
| `submissions` | Student submissions | `student_id` + `activity_id` |

### Step 3: Update Your Components

#### Quick Component Update (No Context)

```jsx
import { useEffect, useState } from 'react';
import { fetchHomework, getBilingualValue } from '../services/api';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchHomework('Grade 10');
      setHomework(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {homework.map(item => (
        <div key={item.id}>
          <h3>{getBilingualValue(item.title, i18n.language)}</h3>
          <p>{getBilingualValue(item.content, i18n.language)}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Full DataContext Update

**Replace** your existing `src/context/DataContext.jsx` with the example from `src/examples/DataContextWithPocketBase.jsx`.

**What changes:**
- ❌ Remove: `import homeworkData from '../data/homework.json';`
- ✅ Add: `import { fetchHomework } from '../services/api';`
- ✅ Add: `useEffect` to fetch data on mount
- ✅ Add: Loading and error states

### Step 4: Handle Bilingual JSON Fields

All bilingual fields in PocketBase are stored as JSON:
```json
{
  "title": {
    "ar": "واجب الرياضيات",
    "en": "Math Homework"
  }
}
```

**Access in your components:**
```jsx
import { getBilingualValue } from '../services/api';
import { useTranslation } from 'react-i18next';

function MyComponent({ item }) {
  const { i18n } = useTranslation();
  
  // Option 1: Using helper function
  const title = getBilingualValue(item.title, i18n.language);
  
  // Option 2: Direct access
  const content = item.content[i18n.language] || item.content.ar;
  
  return <h1>{title}</h1>;
}
```

---

## 📊 Data Mapping Reference

### Homework Mapping

**Frontend expects:** `homework.json` structure  
**Backend source:** `activities` collection  
**Filter:** `type='homework'`

```js
// API call
const homework = await fetchHomework('Grade 10');

// Returns:
[
  {
    id: "xyz123",
    title: { ar: "...", en: "..." },
    content: { ar: "...", en: "..." },
    subject: { ar: "رياضيات", en: "Math" },
    grade: "Grade 10",
    dueDate: "2026-02-15T23:59:59Z",
    type: "homework",
    allowFileSubmission: true
  }
]
```

### Quizzes Mapping

**Frontend expects:** `quizzes.json` structure  
**Backend source:** `activities` collection  
**Filter:** `type='quiz'`

```js
const quizzes = await fetchQuizzes('Grade 10');
```

### Materials Mapping

**Frontend expects:** `materials.json` structure  
**Backend source:** `lessons` collection  
**Special handling:** `attachments` array mapped to `files` array

```js
const materials = await fetchMaterials('Grade 10', 'Math');

// Each material has:
{
  id: "abc123",
  title: { ar: "...", en: "..." },
  files: [
    { name: "lesson1.pdf", url: "http://...", type: "pdf" },
    { name: "worksheet.docx", url: "http://...", type: "doc" }
  ]
}
```

### News Mapping

**Frontend expects:** `news.json` structure  
**Backend source:** `news` collection (newly created)

```js
const news = await fetchNews();

// Each news item has:
{
  id: "news123",
  title: { ar: "...", en: "..." },
  content: { ar: "...", en: "..." },
  category: "Events",
  imageUrl: "http://127.0.0.1:8090/api/files/...",
  publishedAt: "2026-02-10T09:00:00Z"
}
```

---

## 🔐 Authentication Integration

### Check if user is logged in:
```js
import { isAuthenticated, getCurrentUser } from '../services/api';

if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('Logged in as:', user.email);
}
```

### Submit homework:
```js
import { submitHomework } from '../services/api';

const handleSubmit = async () => {
  try {
    const result = await submitHomework(
      'homework_id_123',
      'student_id_456',
      {
        text: 'My answer...',
        files: []
      }
    );
    console.log('Submitted:', result);
  } catch (error) {
    console.error('Submission failed:', error);
  }
};
```

---

## 🎨 UI Component Updates

### Update HomeworkCard

**Before:**
```jsx
<HomeworkCard 
  homework={item}
  title={item.title.ar}
  content={item.content.ar}
/>
```

**After:**
```jsx
import { getBilingualValue } from '../services/api';
import { useTranslation } from 'react-i18next';

function HomeworkList({ homework }) {
  const { i18n } = useTranslation();
  
  return homework.map(item => (
    <HomeworkCard 
      key={item.id}
      homework={item}
      title={getBilingualValue(item.title, i18n.language)}
      content={getBilingualValue(item.content, i18n.language)}
    />
  ));
}
```

### Update MaterialCard for File URLs

**Before:**
```jsx
<a href={material.fileUrl}>Download</a>
```

**After:**
```jsx
{material.files?.map((file, index) => (
  <a key={index} href={file.url} download>
    {file.name}
  </a>
))}
```

---

## 🔄 Migration Checklist

- [ ] PocketBase server running on http://127.0.0.1:8090
- [ ] News collection created (using migration or UI)
- [ ] Existing collections verified (activities, lessons, submissions)
- [ ] `api.js` service file created in `src/services/`
- [ ] Components updated to use API instead of JSON imports
- [ ] Bilingual field access updated (`getBilingualValue()`)
- [ ] File URLs updated for PocketBase (`pb.files.getUrl()`)
- [ ] Loading and error states added to components
- [ ] Authentication checks added where needed
- [ ] Offline fallback tested with localforage
- [ ] Test data added to PocketBase collections

---

## 🧪 Testing

### 1. Test API Service
```js
import { fetchHomework, fetchNews } from './services/api';

// Test in browser console or a test page
fetchHomework('Grade 10')
  .then(data => console.log('Homework:', data))
  .catch(err => console.error('Error:', err));
```

### 2. Test in Component
Create a test component:
```jsx
import { useEffect } from 'react';
import { fetchNews } from '../services/api';

function TestComponent() {
  useEffect(() => {
    fetchNews().then(news => {
      console.log('News loaded:', news.length, 'items');
    });
  }, []);
  
  return <div>Check console for results</div>;
}
```

### 3. Test Bilingual Content
```js
import { getBilingualValue } from './services/api';

const item = {
  title: { ar: "أخبار المدرسة", en: "School News" }
};

console.log('Arabic:', getBilingualValue(item.title, 'ar'));
console.log('English:', getBilingualValue(item.title, 'en'));
```

---

## 🐛 Troubleshooting

### Q: "Failed to fetch" error
**A:** Check that PocketBase is running:
```bash
# Start PocketBase
cd /path/to/pocketbase
./pocketbase serve
```

### Q: Bilingual fields showing [object Object]
**A:** Use `getBilingualValue()` helper:
```jsx
// ❌ Wrong
<h1>{item.title}</h1>

// ✅ Correct
<h1>{getBilingualValue(item.title, i18n.language)}</h1>
```

### Q: Images not loading
**A:** Use PocketBase file URL helper:
```jsx
import { pb } from '../services/api';

// Get image URL
const imageUrl = record.image 
  ? pb.files.getUrl(record, record.image)
  : '/placeholder.png';
```

### Q: Empty data returned
**A:** Check PocketBase collection rules in Admin UI:
- List Rule: `is_published = true` (or empty for all)
- View Rule: `is_published = true` (or empty for all)

### Q: CORS errors
**A:** PocketBase usually handles CORS automatically. If issues persist:
1. Check PocketBase version (should be 0.22+)
2. Ensure frontend URL matches PocketBase `APP_URL`

---

## 📚 Next Steps

1. **Seed Data:** Add sample data to PocketBase collections
2. **Authentication:** Implement login/logout UI
3. **File Uploads:** Add file upload for homework submissions
4. **Real-time Updates:** Use PocketBase realtime subscriptions
5. **Offline Support:** Enhance localforage caching
6. **Error Handling:** Add user-friendly error messages
7. **Loading States:** Add skeleton loaders

---

## 🔗 Resources

- **PocketBase Docs:** https://pocketbase.io/docs/
- **PocketBase JS SDK:** https://github.com/pocketbase/js-sdk
- **Your API Service:** `src/services/api.js`
- **Your Examples:** `src/examples/`

---

## 💡 Tips

- **Start Small:** Migrate one component at a time (e.g., HomePage first)
- **Keep JSON Backup:** Don't delete `src/data/*.json` until migration is complete
- **Use DevTools:** Monitor Network tab to see PocketBase API calls
- **Test Offline:** Use DevTools offline mode to test localforage fallback
- **Bilingual First:** Always access JSON fields with `getBilingualValue()`

---

**Need Help?** Check the example files in `src/examples/` for full working implementations.
