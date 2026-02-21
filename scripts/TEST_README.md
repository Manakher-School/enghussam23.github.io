# Testing New API Functions

This directory contains test scripts for the new enrollment system API functions.

## Test Script: `test-new-api-functions.js`

Tests the 5 new API functions:
1. `fetchGrades()` - Fetch all grade levels
2. `fetchSectionsByGrade()` - Fetch sections (all or filtered by grade)
3. `fetchSubjects()` - Fetch all subjects/courses
4. `createStudentWithEnrollment()` - Create student with grade/section
5. `createTeacherWithAssignments()` - Create teacher with subject/grade/section assignments

### Prerequisites

1. PocketBase must be running on `http://127.0.0.1:8090`
2. You need admin credentials
3. Database must have:
   - At least 1 grade in `classes` collection
   - At least 1 section in `class_sections` collection
   - At least 1 subject in `courses` collection

### How to Run

1. **Update admin credentials** in the test script:
   ```javascript
   const ADMIN_EMAIL = 'your-admin@example.com';
   const ADMIN_PASSWORD = 'your-admin-password';
   ```

2. **Make sure PocketBase is running:**
   ```bash
   ./pocketbase serve
   ```

3. **Run the test:**
   ```bash
   node scripts/test-new-api-functions.js
   ```

### What It Does

The script will:
- Login as admin
- Fetch and display all grades
- Fetch and display all sections
- Fetch sections for the first grade only
- Fetch and display all subjects
- Create a test student enrolled in the first grade/section
- Create a test teacher assigned to first subject and first two grades

### Expected Output

```
🚀 Starting API Function Tests...

🔐 Logging in as admin...
✅ Logged in successfully

📚 Testing fetchGrades()...
✅ Found 7 grades:
   - KG: Kindergarten / روضة
   - 1: Grade 1 / الصف الأول
   ...

🏫 Testing fetchSectionsByGrade(all)...
✅ Found 19 sections

🏫 Testing fetchSectionsByGrade(grade_id_123)...
✅ Found 3 sections
   Sections for selected grade:
   - Section A (max: 30)
   - Section B (max: 30)
   - Section C (max: 30)

📖 Testing fetchSubjects()...
✅ Found 4 subjects:
   - MATH: Mathematics / رياضيات 📐
   - SCI: Science / علوم 🔬
   ...

👨‍🎓 Testing createStudentWithEnrollment()...
   Creating student for: Kindergarten - Section A
✅ Student created successfully!
   Email: test.student.1234567890@example.com
   ID: record_abc123

👩‍🏫 Testing createTeacherWithAssignments()...
   Creating teacher for: Mathematics
   Assigning to Kindergarten (1 sections)
   Assigning to Grade 1 (3 sections)
✅ Teacher created successfully!
   Email: test.teacher.1234567890@example.com
   ID: record_def456
   Assignments created: 4
   Assignments failed: 0

✅ All tests completed!
```

### Cleanup

Test users are created with emails like:
- `test.student.1234567890@example.com`
- `test.teacher.1234567890@example.com`

You can delete them from PocketBase Admin UI after testing if needed.

### Troubleshooting

**Error: "Failed to fetch grades"**
- Make sure `classes` collection exists and has records
- Check that records have `is_active=true`

**Error: "Section validation failed"**
- Verify sections in `class_sections` have correct `grade` relation
- Check that section actually belongs to the selected grade

**Error: "Failed to create user account"**
- Check PocketBase password requirements (usually min 8 characters)
- Make sure email is unique
- Verify admin is logged in

**Error: "Connection refused"**
- Make sure PocketBase is running on port 8090
- Check PocketBase URL in script matches your setup
