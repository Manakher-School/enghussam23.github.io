# PocketBase Backend Configuration Guide
## Step-by-Step Instructions for Backend Team

This guide ensures your PocketBase backend works seamlessly with the frontend.

---

## 📋 Prerequisites

- PocketBase v0.22+ installed
- PocketBase server running on `http://127.0.0.1:8090` (development)
- Admin account created

---

## 🚀 Quick Setup Checklist

- [ ] PocketBase server running
- [ ] Admin account created
- [ ] 10 collections created with correct field types
- [ ] API rules configured
- [ ] Initial data seeded (grades, subjects, sections)
- [ ] Test user accounts created (student, teacher, admin)
- [ ] CORS configured for frontend URL
- [ ] File upload limits set
- [ ] Frontend connection tested

---

## 📦 Collection Creation Order

**Create in this order** (to handle dependencies):

1. ✅ `users` - Auth collection (built-in, just add fields)
2. ✅ `grades` - Grade levels
3. ✅ `subjects` - Academic subjects
4. ✅ `sections` - Class sections (depends on grades)
5. ✅ `user_profiles` - User details (depends on users, grades, sections)
6. ✅ `activities` - Homework/Quizzes/Exams (depends on users)
7. ✅ `lessons` - Materials (depends on users)
8. ✅ `submissions` - Student work (depends on activities, users)
9. ✅ `news` - Announcements (depends on users)
10. ✅ `comments` - News comments (depends on news, users)

---

## 🔧 Step-by-Step Collection Setup

### 1. Configure Users Collection (Auth)

**Go to:** Collections → users (already exists)

**Add these fields:**

```
Field Name: role
Type: Select
Options: student, teacher, admin
Required: Yes
Default: student

Field Name: is_active
Type: Bool
Default: true
Required: Yes

Field Name: last_login
Type: Date
Required: No

Field Name: phone
Type: Text
Max Length: 20
Required: No
```

**API Rules:**
```javascript
// List Rule
@request.auth.role = "admin"

// View Rule
@request.auth.id = id || @request.auth.role = "admin"

// Create Rule
@request.auth.role = "admin"

// Update Rule
@request.auth.id = id || @request.auth.role = "admin"

// Delete Rule
@request.auth.role = "admin"
```

---

### 2. Create Grades Collection

**Go to:** Collections → New Collection → Base Collection

**Collection Name:** `grades`

**Fields:**

```
Field Name: code
Type: Text
Required: Yes
Unique: Yes
Min: 1, Max: 20
Pattern: ^[A-Za-z0-9]+$

Field Name: name
Type: JSON
Required: Yes
Max Size: 500

Field Name: display_order
Type: Number
Required: Yes
Min: 1, Max: 100

Field Name: is_active
Type: Bool
Required: Yes
Default: true
```

**API Rules:**
```javascript
// List Rule
""  // Empty = public access

// View Rule
""  // Empty = public access

// Create/Update/Delete Rule
@request.auth.role = "admin"
```

**Seed Data (Create these records manually):**

```json
{"code": "KG", "name": {"ar": "روضة", "en": "Kindergarten"}, "display_order": 1, "is_active": true}
{"code": "1", "name": {"ar": "الصف الأول", "en": "Grade 1"}, "display_order": 2, "is_active": true}
{"code": "2", "name": {"ar": "الصف الثاني", "en": "Grade 2"}, "display_order": 3, "is_active": true}
{"code": "3", "name": {"ar": "الصف الثالث", "en": "Grade 3"}, "display_order": 4, "is_active": true}
{"code": "4", "name": {"ar": "الصف الرابع", "en": "Grade 4"}, "display_order": 5, "is_active": true}
{"code": "5", "name": {"ar": "الصف الخامس", "en": "Grade 5"}, "display_order": 6, "is_active": true}
{"code": "6", "name": {"ar": "الصف السادس", "en": "Grade 6"}, "display_order": 7, "is_active": true}
{"code": "7", "name": {"ar": "الصف السابع", "en": "Grade 7"}, "display_order": 8, "is_active": true}
{"code": "8", "name": {"ar": "الصف الثامن", "en": "Grade 8"}, "display_order": 9, "is_active": true}
{"code": "9", "name": {"ar": "الصف التاسع", "en": "Grade 9"}, "display_order": 10, "is_active": true}
{"code": "10", "name": {"ar": "الصف العاشر", "en": "Grade 10"}, "display_order": 11, "is_active": true}
{"code": "11", "name": {"ar": "الصف الحادي عشر", "en": "Grade 11"}, "display_order": 12, "is_active": true}
{"code": "Tawjihi", "name": {"ar": "التوجيهي", "en": "Tawjihi"}, "display_order": 13, "is_active": true}
```

---

### 3. Create Subjects Collection

**Collection Name:** `subjects`

**Fields:**

```
Field Name: code
Type: Text
Required: Yes
Unique: Yes
Max: 20

Field Name: name
Type: JSON
Required: Yes

Field Name: description
Type: JSON
Required: No

Field Name: icon
Type: Text
Required: No
Max: 10

Field Name: color
Type: Text
Required: No
Max: 7
Pattern: ^#[0-9A-Fa-f]{6}$

Field Name: is_active
Type: Bool
Required: Yes
Default: true
```

**API Rules:**
```javascript
// List Rule
""  // Public

// View Rule
""  // Public

// Create/Update/Delete Rule
@request.auth.role = "admin" || @request.auth.role = "teacher"
```

**Seed Data:**

```json
{"code": "MATH", "name": {"ar": "رياضيات", "en": "Mathematics"}, "icon": "📐", "color": "#2196F3", "is_active": true}
{"code": "SCI", "name": {"ar": "علوم", "en": "Science"}, "icon": "🔬", "color": "#4CAF50", "is_active": true}
{"code": "ARAB", "name": {"ar": "لغة عربية", "en": "Arabic Language"}, "icon": "📖", "color": "#FF5722", "is_active": true}
{"code": "ENG", "name": {"ar": "لغة إنجليزية", "en": "English Language"}, "icon": "🇬🇧", "color": "#9C27B0", "is_active": true}
{"code": "ARTS", "name": {"ar": "فنون", "en": "Arts"}, "icon": "🎨", "color": "#FF9800", "is_active": true}
{"code": "PE", "name": {"ar": "رياضة", "en": "Physical Education"}, "icon": "⚽", "color": "#00BCD4", "is_active": true}
{"code": "RELIG", "name": {"ar": "تربية إسلامية", "en": "Islamic Education"}, "icon": "☪️", "color": "#009688", "is_active": true}
{"code": "SOCIAL", "name": {"ar": "اجتماعيات", "en": "Social Studies"}, "icon": "🌍", "color": "#795548", "is_active": true}
```

---

### 4. Create Sections Collection

**Collection Name:** `sections`

**Fields:**

```
Field Name: name
Type: Text
Required: Yes
Max: 10

Field Name: grade
Type: Relation
Required: Yes
Collection: grades
Display Fields: code

Field Name: teacher
Type: Relation
Required: No
Collection: users
Display Fields: email
Rule: role = "teacher"

Field Name: max_students
Type: Number
Required: No
Default: 30
Min: 1, Max: 100

Field Name: is_active
Type: Bool
Required: Yes
Default: true
```

**Unique Index:** Create compound unique on `grade` + `name`

**API Rules:**
```javascript
// List/View Rule
""  // Public

// Create/Update/Delete Rule
@request.auth.role = "admin"
```

**Seed Data (Examples for each grade):**

```json
{"name": "A", "grade": "GRADE_KG_ID", "max_students": 25, "is_active": true}
{"name": "B", "grade": "GRADE_KG_ID", "max_students": 25, "is_active": true}
{"name": "A", "grade": "GRADE_10_ID", "max_students": 30, "is_active": true}
{"name": "B", "grade": "GRADE_10_ID", "max_students": 30, "is_active": true}
```

---

### 5. Create User Profiles Collection

**Collection Name:** `user_profiles`

**Fields:**

```
Field Name: user_id
Type: Relation
Required: Yes
Unique: Yes
Collection: users
Display Fields: email

Field Name: first_name
Type: Text
Required: Yes
Min: 2, Max: 100

Field Name: last_name
Type: Text
Required: Yes
Min: 2, Max: 100

Field Name: first_name_ar
Type: Text
Max: 100

Field Name: last_name_ar
Type: Text
Max: 100

Field Name: date_of_birth
Type: Date

Field Name: gender
Type: Select
Options: male, female

Field Name: parent_phone
Type: Text
Max: 20

Field Name: address
Type: Text
Max: 500

Field Name: profile_picture
Type: File
Max Select: 1
Max Size: 5242880  // 5MB
Accepted Types: image/jpeg, image/png, image/webp
Thumbs: 100x100, 300x300

Field Name: national_id
Type: Text
Max: 50

Field Name: enrollment_date
Type: Date

Field Name: graduation_date
Type: Date

Field Name: grade
Type: Relation
Collection: grades

Field Name: section
Type: Relation
Collection: sections
```

**API Rules:**
```javascript
// List Rule
@request.auth.role = "admin" || @request.auth.role = "teacher"

// View Rule
@request.auth.id = user_id || @request.auth.role = "teacher" || @request.auth.role = "admin"

// Create Rule
@request.auth.id != "" && @request.data.user_id = @request.auth.id

// Update Rule
@request.auth.id = user_id || @request.auth.role = "admin"

// Delete Rule
@request.auth.role = "admin"
```

---

### 6. Create Activities Collection (Homework/Quizzes/Exams)

**Collection Name:** `activities`

**Fields:**

```
Field Name: type
Type: Select
Required: Yes
Options: homework, quiz, exam

Field Name: title
Type: JSON
Required: Yes

Field Name: content
Type: JSON

Field Name: description
Type: JSON

Field Name: subject
Type: JSON
Required: Yes

Field Name: grade
Type: Text
Required: Yes
Max: 20

Field Name: section
Type: Text
Max: 10

Field Name: teacher
Type: Relation
Required: Yes
Collection: users
Display Fields: email

Field Name: due_date
Type: Date

Field Name: start_date
Type: Date

Field Name: end_date
Type: Date

Field Name: duration
Type: Number
Min: 1, Max: 300

Field Name: points
Type: Number
Min: 0, Max: 1000

Field Name: passing_score
Type: Number
Min: 0, Max: 100

Field Name: allow_file_submission
Type: Bool
Default: true

Field Name: allow_text_submission
Type: Bool
Default: true

Field Name: max_file_size_mb
Type: Number
Default: 10
Min: 1, Max: 50

Field Name: allowed_file_types
Type: Text
Max: 100

Field Name: allow_retake
Type: Bool
Default: false

Field Name: max_attempts
Type: Number
Default: 1
Min: 1, Max: 10

Field Name: questions
Type: JSON

Field Name: attachments
Type: File
Max Select: 10
Max Size: 52428800  // 50MB total
Accepted Types: application/pdf, application/msword, image/*, text/*

Field Name: is_published
Type: Bool
Required: Yes
Default: false
```

**Indexes:**
- `type`
- `grade`
- `is_published`
- `due_date`

**API Rules:**
```javascript
// List Rule
is_published = true || teacher = @request.auth.id || @request.auth.role = "admin"

// View Rule
is_published = true || teacher = @request.auth.id || @request.auth.role = "admin"

// Create Rule
(@request.auth.role = "teacher" || @request.auth.role = "admin") && @request.data.teacher = @request.auth.id

// Update Rule
teacher = @request.auth.id || @request.auth.role = "admin"

// Delete Rule
teacher = @request.auth.id || @request.auth.role = "admin"
```

---

### 7. Create Lessons Collection (Materials)

**Collection Name:** `lessons`

**Fields:**

```
Field Name: title
Type: JSON
Required: Yes

Field Name: content
Type: JSON

Field Name: description
Type: JSON

Field Name: subject
Type: JSON
Required: Yes

Field Name: grade
Type: Text
Required: Yes
Max: 20

Field Name: teacher
Type: Relation
Required: Yes
Collection: users

Field Name: attachments
Type: File
Max Select: 20
Max Size: 104857600  // 100MB
Accepted Types: application/pdf, image/*, application/msword, application/vnd.openxmlformats-officedocument.*

Field Name: file_size
Type: Text

Field Name: download_count
Type: Number
Default: 0

Field Name: view_count
Type: Number
Default: 0

Field Name: tags
Type: Text
Max: 500

Field Name: is_published
Type: Bool
Required: Yes
Default: false
```

**API Rules:**
```javascript
// List/View Rule
is_published = true || teacher = @request.auth.id || @request.auth.role = "admin"

// Create Rule
(@request.auth.role = "teacher" || @request.auth.role = "admin") && @request.data.teacher = @request.auth.id

// Update Rule
teacher = @request.auth.id || @request.auth.role = "admin"

// Delete Rule
teacher = @request.auth.id || @request.auth.role = "admin"
```

---

### 8. Create Submissions Collection

**Collection Name:** `submissions`

**Fields:**

```
Field Name: activity_id
Type: Relation
Required: Yes
Collection: activities

Field Name: student_id
Type: Relation
Required: Yes
Collection: users

Field Name: submission_text
Type: Editor
Max: 10000

Field Name: submission_files
Type: File
Max Select: 5
Max Size: 52428800  // 50MB

Field Name: answers
Type: JSON

Field Name: status
Type: Select
Required: Yes
Options: draft, submitted, graded, returned
Default: draft

Field Name: score
Type: Number
Min: 0

Field Name: max_score
Type: Number

Field Name: percentage
Type: Number
Min: 0, Max: 100

Field Name: stars
Type: Number
Min: 0, Max: 5

Field Name: feedback
Type: JSON

Field Name: graded_by
Type: Relation
Collection: users

Field Name: submitted_at
Type: Date

Field Name: graded_at
Type: Date

Field Name: is_late
Type: Bool
Default: false

Field Name: time_taken_seconds
Type: Number

Field Name: attempt_number
Type: Number
Default: 1
Min: 1
```

**Unique Index:** Compound unique on `activity_id` + `student_id` + `attempt_number`

**API Rules:**
```javascript
// List Rule
student_id = @request.auth.id || 
graded_by = @request.auth.id || 
@request.auth.role = "admin" ||
(activity_id.teacher = @request.auth.id && @request.auth.role = "teacher")

// View Rule
student_id = @request.auth.id || 
graded_by = @request.auth.id || 
@request.auth.role = "admin" ||
(activity_id.teacher = @request.auth.id && @request.auth.role = "teacher")

// Create Rule
@request.auth.role = "student" && @request.data.student_id = @request.auth.id

// Update Rule
(student_id = @request.auth.id && status != "graded") || 
(activity_id.teacher = @request.auth.id && @request.auth.role = "teacher") ||
@request.auth.role = "admin"

// Delete Rule
@request.auth.role = "admin"
```

---

### 9. Create News Collection

**Collection Name:** `news`

**Use the schema from:** `pb_migrations/news_collection_schema.json`

Or create manually:

**Fields:**

```
Field Name: title
Type: JSON
Required: Yes

Field Name: content
Type: JSON
Required: Yes

Field Name: excerpt
Type: Text
Max: 500

Field Name: image
Type: File
Max Select: 1
Max Size: 5242880  // 5MB
Accepted Types: image/*
Thumbs: 100x100, 300x300, 600x600

Field Name: category
Type: Select
Required: Yes
Options: General, Exams, Events, Urgent

Field Name: author
Type: Relation
Collection: users

Field Name: grade
Type: Text
Max: 50

Field Name: tags
Type: Text
Max: 500

Field Name: view_count
Type: Number
Default: 0

Field Name: is_published
Type: Bool
Required: Yes
Default: true

Field Name: is_pinned
Type: Bool
Default: false

Field Name: important
Type: Bool
Default: false
```

**API Rules:**
```javascript
// List/View Rule
is_published = true

// Create Rule
@request.auth.role = "teacher" || @request.auth.role = "admin"

// Update Rule
author = @request.auth.id || @request.auth.role = "admin"

// Delete Rule
author = @request.auth.id || @request.auth.role = "admin"
```

---

### 10. Create Comments Collection

**Collection Name:** `comments`

**Fields:**

```
Field Name: news_id
Type: Relation
Required: Yes
Collection: news

Field Name: author
Type: Relation
Required: Yes
Collection: users
Display Fields: email

Field Name: content
Type: Text
Required: Yes
Min: 1, Max: 1000

Field Name: parent_comment
Type: Relation
Collection: comments

Field Name: is_approved
Type: Bool
Required: Yes
Default: false

Field Name: likes
Type: Number
Default: 0
Min: 0
```

**API Rules:**
```javascript
// List Rule
is_approved = true || author = @request.auth.id || @request.auth.role = "admin"

// View Rule
is_approved = true || author = @request.auth.id || @request.auth.role = "admin"

// Create Rule
@request.auth.id != "" && @request.data.author = @request.auth.id

// Update Rule
author = @request.auth.id

// Delete Rule
author = @request.auth.id || @request.auth.role = "admin"
```

---

## 👥 Create Test User Accounts

### Admin Account
```
Email: admin@school.com
Password: admin123
Role: admin
```

### Teacher Account
```
Email: teacher@school.com
Password: teacher123
Role: teacher
```

### Student Account
```
Email: student@school.com
Password: student123
Role: student
```

**Then create profiles for each in `user_profiles` collection.**

---

## 🔐 Configure CORS

**In PocketBase settings or environment:**

```bash
# Allow frontend URL
ALLOWED_ORIGINS=http://localhost:5173,https://enghussam23.github.io
```

Or in code (if using custom PocketBase):

```go
app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
    e.Router.Use(apis.ActivityLogger(app))
    
    e.Router.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            c.Response().Header().Set("Access-Control-Allow-Origin", "*")
            return next(c)
        }
    })
    
    return nil
})
```

---

## 🧪 Testing the Backend

### 1. Test API Endpoints

```bash
# Get all grades (should work - public)
curl http://127.0.0.1:8090/api/collections/grades/records

# Get activities (should require auth or be published)
curl http://127.0.0.1:8090/api/collections/activities/records

# Login as student
curl -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"student@school.com","password":"student123"}'
```

### 2. Test from Frontend

Update `src/lib/pocketbase.js` to point to your backend:

```javascript
import PocketBase from 'pocketbase';
export const pb = new PocketBase('http://127.0.0.1:8090');
```

Then test in browser console:

```javascript
import { fetchHomework, fetchNews } from './services/api';

// Test fetching news
fetchNews().then(console.log).catch(console.error);

// Test fetching homework
fetchHomework('Grade 10').then(console.log).catch(console.error);
```

---

## ⚠️ Common Issues & Fixes

### Issue 1: CORS Errors

**Symptom:** Frontend shows CORS policy errors

**Fix:**
- Add frontend URL to PocketBase allowed origins
- Check PocketBase version (0.22+ has better CORS support)

### Issue 2: "Forbidden" on Public Collections

**Symptom:** Can't fetch grades or subjects

**Fix:**
- Check List/View rules are empty `""` for public access
- Verify `is_published` filters are correct

### Issue 3: File Uploads Failing

**Symptom:** Attachments not uploading

**Fix:**
- Check max file size settings
- Verify allowed MIME types
- Check disk space on server

### Issue 4: Relations Not Working

**Symptom:** Can't expand relations

**Fix:**
- Verify relation collection exists
- Check relation field name matches
- Use `expand` parameter in queries

### Issue 5: API Rules Too Restrictive

**Symptom:** Authorized users get "Forbidden"

**Fix:**
- Check rule syntax (use `@request.auth.id`)
- Test rules in PocketBase admin UI
- Add `|| @request.auth.role = "admin"` for admin override

---

## 📊 Performance Optimization

### 1. Enable Indexes

For each collection, add indexes on frequently queried fields:

- `activities`: type, grade, is_published, due_date
- `submissions`: student_id, activity_id, status
- `news`: is_published, category, is_pinned
- `comments`: news_id, is_approved

### 2. Configure File Storage

For production, use S3-compatible storage:

```bash
# Environment variables
S3_ENABLED=true
S3_BUCKET=school-files
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your_access_key
S3_SECRET=your_secret
```

### 3. Set Up Backups

```bash
#!/bin/bash
# Auto-backup script
BACKUP_DIR="/backups/pocketbase"
DATE=$(date +%Y%m%d_%H%M%S)

# Stop PocketBase (if needed)
# systemctl stop pocketbase

# Backup data directory
tar -czf "$BACKUP_DIR/pb_data_$DATE.tar.gz" ./pb_data

# Restart PocketBase
# systemctl start pocketbase

# Keep only last 7 days
find $BACKUP_DIR -name "pb_data_*.tar.gz" -mtime +7 -delete
```

---

## 🚀 Production Deployment Checklist

- [ ] All collections created and tested
- [ ] API rules reviewed and secure
- [ ] Test accounts created
- [ ] File upload limits configured
- [ ] CORS configured for production URL
- [ ] HTTPS enabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Rate limiting enabled
- [ ] Environment variables set
- [ ] Admin passwords changed from defaults
- [ ] Frontend updated with production URL

---

## 📞 Support

**Frontend Repository:** [enghussam23.github.io](https://github.com/Manakher-School/enghussam23.github.io)

**Documentation:**
- [POCKETBASE_SCHEMA.md](../POCKETBASE_SCHEMA.md) - Complete schema reference
- [BACKEND.md](../BACKEND.md) - Architecture overview
- [API_REFERENCE.md](../API_REFERENCE.md) - Frontend API functions

**PocketBase Docs:** https://pocketbase.io/docs/

---

**Last Updated:** February 13, 2026  
**Version:** 1.0
