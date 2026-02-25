# Backend Configuration Checklist
**Quick Reference for PocketBase Setup**

Print this out and check off each item as you complete it.

---

## 📋 Pre-Setup

- [ ] PocketBase v0.22+ installed
- [ ] PocketBase running: `./pocketbase serve`
- [ ] Admin UI accessible: http://127.0.0.1:8090/_/
- [ ] Admin account created

---

## 🗂️ Collections (Create in this order)

### 1. Users Collection (Built-in)
- [ ] Add field: `role` (Select: student, teacher, admin)
- [ ] Add field: `is_active` (Bool, default: true)
- [ ] Add field: `last_login` (Date)
- [ ] Add field: `phone` (Text, max: 20)
- [ ] API Rules configured (see guide)

### 2. Grades Collection
- [ ] Collection created
- [ ] Fields: code, name (JSON), display_order, is_active
- [ ] 13 grade records created (KG to Tawjihi)
- [ ] Public API access enabled (empty rules)

### 3. Subjects Collection
- [ ] Collection created
- [ ] Fields: code, name (JSON), icon, color, is_active
- [ ] 8 subject records created (Math, Science, etc.)
- [ ] Public API access enabled

### 4. Sections Collection
- [ ] Collection created
- [ ] Fields: name, grade (relation), teacher (relation), max_students
- [ ] Section records created (A, B for each grade)
- [ ] Unique index: grade + name

### 5. User Profiles Collection
- [ ] Collection created
- [ ] All 15 fields added (see schema)
- [ ] Relation to users (unique)
- [ ] API Rules: self + teachers + admins

### 6. Activities Collection
- [ ] Collection created
- [ ] All 23 fields added (type, title, content, etc.)
- [ ] File attachments enabled (50MB max)
- [ ] Indexes: type, grade, is_published, due_date
- [ ] API Rules: published OR own content

### 7. Lessons Collection
- [ ] Collection created
- [ ] All 12 fields added (title, attachments, etc.)
- [ ] File attachments enabled (100MB max)
- [ ] API Rules: published OR own content

### 8. Submissions Collection
- [ ] Collection created
- [ ] All 17 fields added (activity_id, student_id, etc.)
- [ ] File uploads enabled (50MB max)
- [ ] Unique index: activity_id + student_id + attempt_number
- [ ] API Rules: own submissions + teacher/admin

### 9. News Collection
- [ ] Collection created (use migration file)
- [ ] All 12 fields added (title, image, category, etc.)
- [ ] Image upload with thumbnails (100x100, 300x300, 600x600)
- [ ] API Rules: public read, teacher/admin write

### 10. Comments Collection
- [ ] Collection created
- [ ] All 6 fields added (news_id, author, content, etc.)
- [ ] API Rules: approved=true OR own content

---

## 👥 Test Users

- [ ] **Admin** - admin@school.com / admin123 (role: admin)
- [ ] **Teacher** - teacher@school.com / teacher123 (role: teacher)
- [ ] **Student** - student@school.com / student123 (role: student)
- [ ] Create profiles for each test user

---

## 📊 Seed Data

### Grades (13 records):
- [ ] KG, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, Tawjihi

### Subjects (8 records):
- [ ] MATH (📐 #2196F3)
- [ ] SCI (🔬 #4CAF50)
- [ ] ARAB (📖 #FF5722)
- [ ] ENG (🇬🇧 #9C27B0)
- [ ] ARTS (🎨 #FF9800)
- [ ] PE (⚽ #00BCD4)
- [ ] RELIG (☪️ #009688)
- [ ] SOCIAL (🌍 #795548)

### Sections (at least 2 per grade):
- [ ] Grade 10 - Section A
- [ ] Grade 10 - Section B

---

## 🔐 Security & Configuration

- [ ] **CORS:** Allow http://localhost:5173
- [ ] **CORS:** Allow https://enghussam23.github.io (production)
- [ ] **File Size Limits:** Set per collection (see schema)
- [ ] **File Types:** Restrict to safe types (no .exe, .sh, etc.)
- [ ] **Rate Limiting:** Enable (default PocketBase settings)

---

## ✅ Verification Tests

### Test 1: Health Check
```bash
curl http://127.0.0.1:8090/api/health
```
- [ ] Returns 200 OK

### Test 2: Public Data Access
```bash
curl http://127.0.0.1:8090/api/collections/grades/records
```
- [ ] Returns list of grades

### Test 3: Authentication
```bash
curl -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"student@school.com","password":"student123"}'
```
- [ ] Returns auth token and user data

### Test 4: Protected Resource
```bash
# First login, copy token
# Then:
curl http://127.0.0.1:8090/api/collections/activities/records \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns activities

---

## 🔄 Sample Data (Optional but Recommended)

### Create 3 Sample Items in Each Collection:

- [ ] **3 News Items** (category: General, Exams, Events)
  - Title: JSON `{"ar": "...", "en": "..."}`
  - is_published: true
  
- [ ] **3 Activities** (1 homework, 1 quiz, 1 exam)
  - Type: homework, quiz, exam
  - Grade: "Grade 10"
  - is_published: true
  
- [ ] **3 Lessons** (different subjects)
  - With PDF attachments
  - Grade: "Grade 10"
  - is_published: true

---

## 📁 File Structure Check

Your PocketBase directory should have:

```
pocketbase/
├── pocketbase (executable)
├── pb_data/ (created automatically)
├── pb_migrations/ (optional, for news collection)
└── pb_hooks/ (optional, for custom logic)
```

- [ ] Directory structure correct
- [ ] pb_data folder exists
- [ ] Migrations applied (if using)

---

## 🚀 Production Readiness

- [ ] All collections have appropriate API rules
- [ ] Test users can be removed/passwords changed
- [ ] HTTPS configured (for production)
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Environment variables set
- [ ] File storage configured (local or S3)

---

## 🔗 Documentation Links

- **Full Setup Guide:** [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)
- **Schema Reference:** [POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md)
- **Integration Testing:** [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md)
- **PocketBase Official Docs:** https://pocketbase.io/docs/

---

## 📞 Common Commands

```bash
# Start PocketBase
./pocketbase serve

# Start on custom port
./pocketbase serve --http=0.0.0.0:9090

# Enable debug mode
./pocketbase serve --debug

# Create admin
./pocketbase admin create admin@school.com admin123

# Backup data
tar -czf backup.tar.gz pb_data/

# Restore data
tar -xzf backup.tar.gz
```

---

## ✅ Final Verification

Before marking as complete:

- [ ] Frontend team tested connection
- [ ] All API endpoints working
- [ ] File uploads working
- [ ] Authentication working
- [ ] Bilingual content displaying correctly
- [ ] CORS configured for both development and production URLs
- [ ] No console errors in frontend
- [ ] Sample data accessible

---

## 📋 Sign-Off

**Backend Setup Completed By:**

Name: ___________________________

Date: ___________________________

**Tested By Frontend Team:**

Name: ___________________________

Date: ___________________________

**Issues Found:** 
____________________________________________________________
____________________________________________________________
____________________________________________________________

**Status:** [ ] Ready for Development  [ ] Needs Fixes  [ ] Ready for Production

---

**Version:** 1.0  
**Last Updated:** February 13, 2026  
**For:** Al-Manakhir School Platform
