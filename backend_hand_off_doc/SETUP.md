# Quick Start Guide

## Step 1: Install PocketBase

```bash
./install_pocketbase.sh
```

Or manually download from [pocketbase.io](https://pocketbase.io/docs/)

## Step 2: Start PocketBase

```bash
./pocketbase serve
```

## Step 3: Setup Admin Account

1. Open http://127.0.0.1:8090/_/
2. Create your admin account
3. You're in the admin dashboard!

## Step 4: Create Collections

### Option A: Use Admin UI (Recommended for first time)

Navigate to Collections in the admin UI and create these collections in order:

#### 1. users (Auth Collection - Already exists, just modify)
- Add field: `name` (text)
- Add field: `role` (select: admin, teacher, student)
- Add field: `active` (boolean, default: true)

#### 2. courses
- `title` (text, required)
- `description` (editor/text)

#### 3. classes
- `course_id` (relation → courses, required)
- `teacher_id` (relation → users, required)

#### 4. lessons
- `class_id` (relation → classes, required)
- `title` (text, required)
- `content` (editor)
- `attachments` (file, multiple, max 5, allow: pdf, jpg, png)

#### 5. activities
- `class_id` (relation → classes, required)
- `title` (text, required)
- `type` (select: quiz, exam)
- `time_limit` (number, min: 1)
- `max_score` (number, required)

#### 6. questions
- `activity_id` (relation → activities, required)
- `type` (select: mcq, tf, short)
- `question` (text, required)
- `options` (json)
- `correct_answer` (json, required)

#### 7. submissions
- `activity_id` (relation → activities, required)
- `student_id` (relation → users, required)
- `answers` (json, required)
- `score` (number, default: 0)

#### 8. enrollments
- `student_id` (relation → users, required)
- `class_id` (relation → classes, required)
- `enrolled_at` (date)
- `status` (select: active, completed, dropped)

### Configure Access Rules

For each collection, set the API Rules. Examples:

**courses - List/View rule:**
```javascript
@request.auth.id != ""
```

**classes - List/View rule (Teacher):**
```javascript
@request.auth.role = "admin" || 
(@request.auth.role = "teacher" && teacher_id = @request.auth.id)
```

**submissions - Create rule:**
```javascript
@request.auth.role = "student" && 
@request.data.student_id = @request.auth.id
```

See `.github/copilot-instructions.md` for complete access rules.

## Step 5: Create Test Data

### Create Test Users

In Collections → users, create:

1. **Admin User**
   - Email: admin@school.com
   - Password: admin123
   - Role: admin
   - Active: true

2. **Teacher User**
   - Email: teacher@school.com
   - Password: teacher123
   - Role: teacher
   - Active: true

3. **Student User**
   - Email: student@school.com
   - Password: student123
   - Role: student
   - Active: true

### Create Sample Course

Collections → courses → New Record
- Title: "Mathematics Grade 10"
- Description: "Algebra and Geometry"

### Create Sample Class

Collections → classes → New Record
- Course: Select the course you just created
- Teacher: Select the teacher user

### Enroll Student

Collections → enrollments → New Record
- Student: Select the student user
- Class: Select the class you created
- Status: active

## Step 6: Test the API

### Login as Teacher

```bash
curl -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "teacher@school.com",
    "password": "teacher123"
  }'
```

Save the token from the response.

### Create a Lesson

```bash
curl -X POST http://127.0.0.1:8090/api/collections/lessons/records \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": "CLASS_ID_HERE",
    "title": "Introduction to Algebra",
    "content": "<p>Variables and expressions...</p>"
  }'
```

## Next Steps

- Review the auto-grading hooks in `pb_hooks/submissions.pb.js`
- Read the full documentation in `.github/copilot-instructions.md`
- Export your schema: `./export_schema.sh`
- Setup regular backups: `./backup.sh`

## Troubleshooting

**PocketBase won't start?**
- Check if port 8090 is already in use
- Try: `./pocketbase serve --http=127.0.0.1:8091`

**Can't access admin UI?**
- Clear browser cache
- Try incognito/private mode
- Check firewall settings

**Hooks not working?**
- Check `pb_hooks/` files exist
- Look for errors in PocketBase console output
- Verify hook file names end with `.pb.js`

## Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [API Documentation](https://pocketbase.io/docs/api-records/)
- Project Instructions: `.github/copilot-instructions.md`
