# Backend Setup - PocketBase

This project uses **PocketBase** as its backend (in a separate repository).

## 🎯 Architecture

```
┌─────────────────────────┐
│   Frontend (This Repo)  │
│   React + Vite + MUI    │
│   GitHub Pages          │
└──────────┬──────────────┘
           │ HTTP/WebSocket
           │ PocketBase SDK
┌──────────▼──────────────┐
│   Backend (Separate)    │
│   PocketBase Server     │
│   Port: 8090            │
└─────────────────────────┘
```

## 📋 Collections Schema

See **[POCKETBASE_SCHEMA.md](../POCKETBASE_SCHEMA.md)** for complete schema documentation.

### Core Collections:
1. **users** - Authentication (built-in)
2. **user_profiles** - Extended user info
3. **grades** - Grade levels (KG-Tawjihi)
4. **sections** - Class sections
5. **subjects** - Academic subjects
6. **activities** - Homework, Quizzes, Exams
7. **lessons** - Educational materials
8. **submissions** - Student submissions
9. **news** - Announcements
10. **comments** - News comments

## 🚀 Quick Start

### Backend Repository

The PocketBase backend is in a **separate repository**. Contact the administrator for access.

### Frontend Configuration

1. **PocketBase SDK** is already installed:
   ```json
   "pocketbase": "^0.26.8"
   ```

2. **PocketBase Client** is initialized in:
   ```javascript
   // src/lib/pocketbase.js
   import PocketBase from 'pocketbase';
   export const pb = new PocketBase('http://127.0.0.1:8090');
   ```

3. **API Service Layer** provides all data functions:
   ```javascript
   // src/services/api.js
   import { fetchHomework, fetchNews, submitHomework } from './services/api';
   ```

## 📚 Documentation

- **[POCKETBASE_SCHEMA.md](../POCKETBASE_SCHEMA.md)** - Complete collections schema
- **[POCKETBASE_MIGRATION.md](../POCKETBASE_MIGRATION.md)** - Migration guide from JSON to PocketBase
- **[API_REFERENCE.md](../API_REFERENCE.md)** - Frontend API functions reference

## 🔌 API Integration

### Example: Fetch Data

```javascript
import { fetchHomework, getBilingualValue } from './services/api';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  const [homework, setHomework] = useState([]);

  useEffect(() => {
    fetchHomework('Grade 10')
      .then(data => setHomework(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {homework.map(item => (
        <h3>{getBilingualValue(item.title, i18n.language)}</h3>
      ))}
    </div>
  );
}
```

### Example: Submit Homework

```javascript
import { submitHomework, getCurrentUser } from './services/api';

const handleSubmit = async () => {
  const user = getCurrentUser();
  
  const result = await submitHomework(
    'homework_id',
    user.id,
    { text: 'My answer', files: [] }
  );
  
  console.log('Submitted!', result);
};
```

## 🔐 Authentication

```javascript
import { login, logout, isAuthenticated } from './services/api';

// Login
await login('student@school.com', 'password');

// Check auth status
if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('Logged in as:', user.email);
}

// Logout
logout();
```

## 📊 Data Flow

```
Component
    ↓ calls
API Service (src/services/api.js)
    ↓ uses
PocketBase SDK (src/lib/pocketbase.js)
    ↓ HTTP
PocketBase Server (Separate Repo)
    ↓ queries
Collections (Database)
```

## 🛠️ Development

### Local Development

1. Ensure PocketBase backend is running (separate repo)
2. Start frontend dev server:
   ```bash
   npm run dev
   ```

3. Frontend connects to: `http://127.0.0.1:8090`

### Production

1. Frontend: Deployed on GitHub Pages
2. Backend: Deployed on VPS/Cloud (separate repo)
3. Update PocketBase URL in `src/lib/pocketbase.js`:
   ```javascript
   export const pb = new PocketBase('https://api.school.com');
   ```

## 📝 Migration Status

- ✅ PocketBase SDK installed
- ✅ API service layer created
- ✅ News collection schema defined
- ✅ Migration guide documented
- 🔄 In Progress: Migrating from JSON to PocketBase
- ⏳ Pending: Collections creation in backend repo

## 🔗 Resources

- **PocketBase Docs:** https://pocketbase.io/docs/
- **PocketBase JS SDK:** https://github.com/pocketbase/js-sdk
- **Backend Repo:** (Contact administrator)

---

**Note:** This repository contains **frontend code only**. The PocketBase backend is maintained in a separate repository.
