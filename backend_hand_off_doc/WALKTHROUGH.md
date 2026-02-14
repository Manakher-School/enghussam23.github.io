# Complete Setup Walkthrough

Follow these steps in order. Open PocketBase admin UI at http://127.0.0.1:8090/_/

---

## Part 1: Configure Access Rules (15-20 minutes)

### Why This Matters

Without access rules, ANY authenticated user can do ANYTHING. This step enforces teacher/student boundaries.

### How to Set Rules

For each collection:

1. Click the collection name
2. Click "API Rules" tab
3. Set the rules for each operation (List, View, Create, Update, Delete)

---

### 1. courses Collection

**List/Search rule:**

```javascript
@request.auth.id != ""
```

*Any authenticated user can list courses*

**View rule:**

```javascript
@request.auth.id != ""
```

**Create/Update/Delete rules:**

```javascript
@request.auth.role = "admin"
```

*Only admins can modify courses*

---

### 2. classes Collection

**List/Search rule:**

```javascript
@request.auth.role = "admin" || 
(@request.auth.role = "teacher" && teacher_id = @request.auth.id)
```

*Admin sees all, teachers see only their classes*

**View rule:** (same as List)

```javascript
@request.auth.role = "admin" || 
(@request.auth.role = "teacher" && teacher_id = @request.auth.id)
```

**Create/Update/Delete rules:**

```javascript
@request.auth.role = "admin"
```

---

### 3. lessons Collection

**List/Search rule:**

```javascript
@request.auth.role = "admin" || (@request.auth.role = "teacher" && @collection.classes.id = class_id && @collection.classes.teacher_id = @request.auth.id) || (@request.auth.role = "student" && @collection.enrollments.student_id = @request.auth.id && @collection.enrollments.class_id = class_id && @collection.enrollments.status = "active")
```

*Admin: all, Teacher: own classes, Student: enrolled classes*

**View rule:** (same as List)

**Create rule:**

```javascript
@request.auth.role = "admin" || (@request.auth.role = "teacher" && @collection.classes.id = @request.data.class_id && @collection.classes.teacher_id = @request.auth.id)
```

**Update rule:** (same as Create)

**Delete rule:**

```javascript
@request.auth.role = "admin" || (@request.auth.role = "teacher" && @collection.classes.id = class_id && @collection.classes.teacher_id = @request.auth.id)
```

---

### 4. activities Collection

**Same rules as lessons** (copy from lessons above)

---

### 5. questions Collection

**List/Search rule:**

```javascript
@request.auth.role = "admin" || (@request.auth.role = "teacher" && @collection.activities.class_id:isset = true && @collection.classes.id = @collection.activities.class_id && @collection.classes.teacher_id = @request.auth.id)
```

*Students should NOT list questions directly - they get them via activities*

**View rule:** (same as List)
**Create/Update/Delete rules:**

```javascript
@request.auth.role = "admin" || (@request.auth.role = "teacher" && @collection.activities.class_id:isset = true && @collection.classes.id = @collection.activities.class_id && @collection.classes.teacher_id = @request.auth.id)
```

---

### 6. submissions Collection ⚠️ CRITICAL

**List/Search rule:**

```javascript
@request.auth.role = "admin" || (@request.auth.role = "teacher" && @collection.activities.class_id:isset = true && @collection.classes.id = @collection.activities.class_id && @collection.classes.teacher_id = @request.auth.id) || (@request.auth.role = "student" && student_id = @request.auth.id)
```

*Students only see their own submissions*
**View rule:** (same as List)

**Create rule:**

```javascript
@request.auth.role = "student" && @request.data.student_id = @request.auth.id
```

*Only students can create, only for themselves*
**Update/Delete rules:**

```javascript
@request.auth.role = "admin"
```

*Students cannot modify after submission*

---

### 7. enrollments Collection

**List/Search rule:**

```javascript
@request.auth.role = "admin" || (@request.auth.role = "teacher" && @collection.classes.id = class_id && @collection.classes.teacher_id = @request.auth.id) || (@request.auth.role = "student" && student_id = @request.auth.id)
```

**View rule:** (same as List)

**Create/Update/Delete rules:**

```javascript
@request.auth.role = "admin"
```

*Only admins manage enrollments*

---

### 8. users Collection (modify existing)

**List/Search/View rules:**

```javascript
@request.auth.id != ""
```

**Update rule:**

```javascript
@request.auth.id = id || @request.auth.role = "admin"
```

*Users can update their own profile, admins can update anyone*

**Delete rule:**

```javascript
@request.auth.role = "admin"
```

---

## Part 2: Create Test Data (10 minutes)

### Step 1: Create Users

Go to Collections → users → New record

**Admin:**

- Email: `admin@school.com`
- Password: `admin123` (use the lock icon to set)
- Name: `Admin User`
- Role: `admin`
- Active: ✓

**Teacher:**

- Email: `teacher@school.com`
- Password: `teacher123`
- Name: `John Teacher`
- Role: `teacher`
- Active: ✓

**Student:**

- Email: `student@school.com`
- Password: `student123`
- Name: `Jane Student`
- Role: `student`
- Active: ✓

---

### Step 2: Create Course

Collections → courses → New record
- Title: `Mathematics Grade 10`
- Description: `Introduction to Algebra and Geometry`

---

### Step 3: Create Class

Collections → classes → New record
- Course: (select the course you just created)
- Teacher: (select John Teacher)

**💡 Copy the Class ID** - you'll need it for enrollment

---

### Step 4: Enroll Student

Collections → enrollments → New record
- Student: (select Jane Student)
- Class: (select the class you created)
- Status: `active`
- Enrolled_at: (leave blank - auto-set by hook)

---

### Step 5: Create Sample Activity

Collections → activities → New record
- Class: (select your class)
- Title: `Chapter 1 Quiz`
- Type: `quiz`
- Time_limit: `30`
- Max_score: `100`

**💡 Copy the Activity ID**

---

### Step 6: Create Sample Questions

Collections → questions → New record (create 3 questions)

**Question 1 (MCQ):**
- Activity: (select your activity)
- Type: `mcq`
- Question: `What is 2 + 2?`
- Options: `["2", "3", "4", "5"]` (paste as JSON)
- Correct_answer: `"4"` (with quotes!)

**Question 2 (True/False):**
- Activity: (select your activity)
- Type: `tf`
- Question: `The earth is flat`
- Options: (leave empty)
- Correct_answer: `false` (no quotes)

**Question 3 (Short Answer):**
- Activity: (select your activity)
- Type: `short`
- Question: `What is the capital of France?`
- Options: (leave empty)
- Correct_answer: `"Paris"` (with quotes)

**💡 Copy the Question IDs** - you'll need them for testing

---

## Part 3: Export Schema (1 minute)

In your terminal:

```bash
./export_schema.sh
```

This creates:

- `migrations/schema_YYYYMMDD.json`
- `migrations/schema_latest.json`

**Commit these to git!**

```bash
git add migrations/
git commit -m "feat: initial schema with all collections"
```

---

## Part 4: Test the API (10 minutes)

### Test 1: Login as Student

```bash
curl -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "student@school.com",
    "password": "student123"
  }'
```

**Save the token from response** (copy the long string after "token")

---

### Test 2: Get Questions (as Student)

Replace `ACTIVITY_ID` with your activity ID:

```bash
curl -X GET "http://127.0.0.1:8090/api/collections/questions/records?filter=(activity_id='ACTIVITY_ID')" \-H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected:** You should get an error or empty list (students shouldn't access questions directly)

---

### Test 3: Submit Answers (as Student)

Replace IDs with your actual IDs:

```bash
curl -X POST http://127.0.0.1:8090/api/collections/submissions/records \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_id": "YOUR_ACTIVITY_ID",
    "student_id": "YOUR_STUDENT_ID",
    "answers": {"QUESTION_1_ID": "4",
      "QUESTION_2_ID": false,
      "QUESTION_3_ID": "Paris"}
  }'
```

**Expected Response:**

```json
{
  "id": "...",
  "activity_id": "...",
  "student_id": "...",
  "answers": {...},
  "score": 100,  // ← Auto-calculated!
  "created": "..."
}
```

**✅ If score is 100, auto-grading works!**

---

### Test 4: Try Duplicate Submission

Run the same curl command again.

**Expected:** Error message "You have already submitted this activity"

**✅ Hook is working!**

---

### Test 5: Login as Teacher

```bash
curl -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "teacher@school.com",
    "password": "teacher123"
  }'
```

---

### Test 6: View Student Submissions (as Teacher)

```bash
curl -X GET "http://127.0.0.1:8090/api/collections/submissions/records?filter=(activity_id='YOUR_ACTIVITY_ID')&expand=student_id" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected:** You should see the student's submission with student details

---

## Part 5: Frontend Connection Guide

### PocketBase SDK Setup

**JavaScript/TypeScript:**
```bash
npm install pocketbase
```

```javascript
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Login
const authData = await pb.collection('users').authWithPassword(
  'student@school.com',
  'student123'
);

// Auto-saved to pb.authStore
console.log(pb.authStore.token);
console.log(pb.authStore.model.role); // student

// Fetch enrolled classes
const enrollments = await pb.collection('enrollments').getFullList({
  filter: `student_id='${pb.authStore.model.id}' && status='active'`,
  expand: 'class_id.course_id'
});

// Submit answers
const submission = await pb.collection('submissions').create({
  activity_id: 'ACTIVITY_ID',
  student_id: pb.authStore.model.id,
  answers: {
    'question_1_id': '4',
    'question_2_id': true,
    'question_3_id': 'Paris'
  }
});

console.log('Score:', submission.score); // Auto-calculated!
```

---

### Key Frontend Patterns

**1. Get Questions Without Correct Answers:**
```javascript
// Students shouldn't directly query questions
// Instead, expand questions from activity:
const activity = await pb.collection('activities').getOne(activityId, {
  expand: 'questions(activity_id)'
});

// Or use fields parameter to exclude correct_answer
const questions = await pb.collection('questions').getFullList({
  filter: `activity_id='${activityId}'`,
  fields: 'id,type,question,options' // exclude correct_answer
});
```

**2. Real-time Subscriptions:**
```javascript
// Subscribe to new lessons in enrolled class
pb.collection('lessons').subscribe('*', (e) => {
  if (e.action === 'create') {
    console.log('New lesson:', e.record);
  }
}, {
  filter: `class_id='${classId}'`
});
```

**3. File Uploads (Lesson Attachments):**
```javascript
const formData = new FormData();
formData.append('class_id', classId);
formData.append('title', 'My Lesson');
formData.append('content', '<p>Lesson content...</p>');
formData.append('attachments', file1);
formData.append('attachments', file2);

const lesson = await pb.collection('lessons').create(formData);

// Get file URL
const url = pb.files.getUrl(lesson, lesson.attachments[0]);
```

**4. Error Handling:**
```javascript
try {
  await pb.collection('submissions').create({...});
} catch (error) {
  if (error.message.includes('already submitted')) {
    alert('You have already submitted this activity');
  }
}
```

---

## Next Steps

1. ✅ **Commit everything to git**
   ```bash
   git add .
   git commit -m "feat: complete backend setup with hooks and test data"
   git push
   ```

2. 🎨 **Start frontend development**
   - Install PocketBase SDK
   - Create login page
   - Build student/teacher dashboards
   - Implement quiz taking interface

3. 📱 **CORS Configuration (for frontend)**
   When your frontend is on a different port/domain, update PocketBase settings:
   - Settings → Application → Allowed origins
   - Add: `http://localhost:3000` (or your frontend URL)

4. 🔐 **Production Checklist**
   - Change all test passwords
   - Set `PB_ENCRYPTION_KEY` environment variable
   - Setup HTTPS
   - Configure backups (use `./backup.sh` in cron)
   - Review all access rules again

---

## Troubleshooting

**Access rules not working?**
- Make sure you're using the correct role in test users
- Check PocketBase console for error messages
- Use "Test" button in API Rules section

**Hooks not firing?**
- Restart PocketBase after editing hook files
- Check console for JavaScript errors
- Verify file names end with `.pb.js`

**Auto-grading score is 0?**
- Check question IDs match in answers JSON
- Verify `correct_answer` format matches answer type
- Look at PocketBase console logs

**Can't login?**
- Verify email/password are correct
- Check user `active` field is true
- Make sure you're POSTing to auth endpoint

---

## Summary Checklist

- [ ] All 8 collections created with correct fields
- [ ] Access rules configured for all collections
- [ ] Test users created (admin, teacher, student)
- [ ] Sample course → class → enrollment chain created
- [ ] Sample activity with 3 questions created
- [ ] Schema exported to `migrations/`
- [ ] Tested API endpoints with curl
- [ ] Auto-grading verified (score calculated correctly)
- [ ] Duplicate submission prevented
- [ ] Ready to connect frontend!

---

**You're now ready to build the frontend! 🚀**
