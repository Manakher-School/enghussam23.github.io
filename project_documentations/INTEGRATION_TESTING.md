# Frontend-Backend Integration Testing Guide

Quick guide to test if your PocketBase backend is properly configured for this frontend.

---

## 🧪 Quick Test Checklist

Run these tests in order. Each must pass before proceeding to the next.

---

### ✅ Test 1: Backend is Running

**Terminal:**
```bash
curl http://127.0.0.1:8090/api/health
```

**Expected:** `{"code": 200, "message": "API is healthy"}`

**If fails:** Start PocketBase server: `./pocketbase serve`

---

### ✅ Test 2: Public Collections are Accessible

**Browser Console (on your frontend):**
```javascript
fetch('http://127.0.0.1:8090/api/collections/grades/records')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Expected:** JSON with list of grades

**If fails:** 
- Check CORS settings
- Verify `grades` collection exists
- Check API rules (should be empty "" for public)

---

### ✅ Test 3: PocketBase SDK Connection

**Browser Console:**
```javascript
import { pb } from './src/lib/pocketbase';

// Check if PocketBase client is initialized
console.log('PocketBase URL:', pb.baseUrl);

// Test connection
pb.health.check().then(console.log).catch(console.error);
```

**Expected:** `{code: 200, ...}`

**If fails:**
- Check `src/lib/pocketbase.js` URL
- Verify PocketBase is running
- Check network tab for errors

---

### ✅ Test 4: Authentication

**Browser Console:**
```javascript
import { pb } from './src/lib/pocketbase';

// Login as student
pb.collection('users').authWithPassword('student@school.com', 'student123')
  .then(authData => {
    console.log('✅ Logged in:', authData.record.email);
    console.log('Token:', authData.token);
    console.log('Role:', authData.record.role);
  })
  .catch(err => console.error('❌ Login failed:', err));
```

**Expected:** Login success with user data

**If fails:**
- Verify test user exists (`student@school.com`)
- Check password is correct
- Check users collection has `role` field

---

### ✅ Test 5: Fetch Data Using API Service

**Browser Console:**
```javascript
import { fetchNews, fetchHomework, fetchGrades } from './src/services/api';

// Test fetching news
fetchNews()
  .then(news => console.log('✅ News:', news.length, 'items'))
  .catch(err => console.error('❌ News failed:', err));

// Test fetching homework
fetchHomework('Grade 10')
  .then(hw => console.log('✅ Homework:', hw.length, 'items'))
  .catch(err => console.error('❌ Homework failed:', err));
```

**Expected:** Data arrays returned

**If fails:**
- Check collection exists
- Verify API rules
- Check is_published flag
- Ensure type filters work (for activities)

---

### ✅ Test 6: Bilingual Content

**Browser Console:**
```javascript
import { fetchNews, getBilingualValue } from './src/services/api';

fetchNews().then(news => {
  if (news.length > 0) {
    const firstNews = news[0];
    console.log('✅ Arabic:', getBilingualValue(firstNews.title, 'ar'));
    console.log('✅ English:', getBilingualValue(firstNews.title, 'en'));
    console.log('✅ Raw JSON:', firstNews.title);
  }
});
```

**Expected:** Both Arabic and English titles displayed

**If fails:**
- Check title field is JSON type
- Verify data has `{ar: "...", en: "..."}` structure
- Check getBilingualValue function

---

### ✅ Test 7: File URLs

**Browser Console:**
```javascript
import { fetchNews, pb } from './src/services/api';

fetchNews().then(news => {
  const withImage = news.find(n => n.image);
  if (withImage) {
    const imageUrl = pb.files.getUrl(withImage, withImage.image);
    console.log('✅ Image URL:', imageUrl);
    
    // Test in browser
    const img = new Image();
    img.onload = () => console.log('✅ Image loaded successfully');
    img.onerror = () => console.error('❌ Image failed to load');
    img.src = imageUrl;
  }
});
```

**Expected:** Image URL constructed and loads

**If fails:**
- Check file field type is correct
- Verify file uploaded in PocketBase
- Check file permissions

---

### ✅ Test 8: Submit Data (Create)

**Browser Console:**
```javascript
import { pb } from './src/lib/pocketbase';

// First, login
pb.collection('users').authWithPassword('student@school.com', 'student123')
  .then(() => {
    // Then create a test submission (if you have an activity)
    return pb.collection('submissions').create({
      activity_id: 'YOUR_ACTIVITY_ID',
      student_id: pb.authStore.model.id,
      submission_text: 'Test submission',
      status: 'draft'
    });
  })
  .then(record => console.log('✅ Submission created:', record))
  .catch(err => console.error('❌ Submission failed:', err));
```

**Expected:** Submission created successfully

**If fails:**
- Check submissions collection exists
- Verify API rules allow creation
- Check required fields are provided
- Verify relation IDs exist

---

### ✅ Test 9: Frontend Component Integration

**Navigate to homepage and check:**

1. **Hero Images Load** - Check browser console for image errors
2. **News Feed Displays** - Should show news cards
3. **Language Toggle Works** - Arabic/English switch
4. **Navigation Works** - All menu items accessible

**Browser Console should show:**
```
✅ News loaded: X items
✅ Homework loaded: X items
✅ Materials loaded: X items
```

**If fails:**
- Check DataContext is using PocketBase API
- Verify useEffect hooks are running
- Check React DevTools for errors

---

### ✅ Test 10: Complete User Flow

**Full integration test:**

1. **Open frontend:** `http://localhost:5173`
2. **Select Grade:** Choose "Grade 10", Section "A"
3. **Navigate to Homework:** Click "Activities" → "Homework Tab"
4. **View Homework:** Should display list
5. **Expand Homework:** Click to see details
6. **Submit Homework:** Enter text and submit
7. **Check Submission:** Refresh, should show "Submitted" status

**Expected:** Complete flow works without errors

---

## 🔍 Debugging Common Issues

### Issue: "Failed to fetch"

**Check:**
```javascript
// In browser console
console.log('Backend URL:', pb.baseUrl);
console.log('Is PocketBase running?', await fetch(pb.baseUrl + '/api/health'));
```

**Fix:** Ensure backend is running and URL is correct

---

### Issue: CORS Error

**Check browser console:**
```
Access to fetch at 'http://127.0.0.1:8090' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Fix in PocketBase:**
- Add `http://localhost:5173` to allowed origins
- For development, allow all: `*`

---

### Issue: "Unauthorized" / 403

**Check:**
```javascript
// Verify auth state
console.log('Is authenticated?', pb.authStore.isValid);
console.log('User role?', pb.authStore.model?.role);
```

**Fix:**
- Login first
- Check API rules in collection
- Verify user has correct role

---

### Issue: Empty Results

**Check:**
```javascript
// Check if data exists
pb.collection('news').getFullList()
  .then(data => console.log('Total news in DB:', data.length));
```

**Fix:**
- Create test data in PocketBase Admin UI
- Check `is_published` flag is true
- Verify filter logic (grade, type, etc.)

---

### Issue: Bilingual Fields Show [object Object]

**Check:**
```javascript
// Inspect data structure
fetchNews().then(news => console.log('Title type:', typeof news[0]?.title));
```

**Fix:**
- Ensure JSON fields are used for bilingual content
- Use `getBilingualValue()` helper
- Check data is saved as `{ar: "...", en: "..."}`

---

## 🎯 Production Testing

Before deploying, test with production backend URL:

1. **Update `src/lib/pocketbase.js`:**
   ```javascript
   export const pb = new PocketBase('https://api.yourschool.com');
   ```

2. **Test all flows again**

3. **Check HTTPS:**
   ```bash
   curl https://api.yourschool.com/api/health
   ```

4. **Verify CORS for production domain:**
   - Allow: `https://enghussam23.github.io`

---

## 📊 Test Results Template

Copy and fill this out:

```
✅ = Pass | ❌ = Fail | ⏭️ = Skipped

[ ] Test 1: Backend Running
[ ] Test 2: Public Collections
[ ] Test 3: SDK Connection
[ ] Test 4: Authentication
[ ] Test 5: Fetch Data
[ ] Test 6: Bilingual Content
[ ] Test 7: File URLs
[ ] Test 8: Submit Data
[ ] Test 9: Component Integration
[ ] Test 10: User Flow

Issues Found:
1. 
2. 
3. 

Notes:
- 
- 
```

---

## 🆘 Support

If tests fail:

1. Check [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)
2. Review [POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md)
3. Verify collections match schema exactly
4. Check API rules are correct
5. Ensure seed data exists

---

**Last Updated:** February 13, 2026
