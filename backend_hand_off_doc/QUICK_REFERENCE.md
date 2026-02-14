# 🚀 Quick Reference Card

## Essential Commands

```bash
# Start server
./start.sh

# Validate setup
./validate.sh

# Export schema
./export_schema.sh

# Create backup
./backup.sh
```

## Server URLs

- **Admin UI**: http://127.0.0.1:8090/_/
- **API Base**: http://127.0.0.1:8090/api/
- **Health**: http://127.0.0.1:8090/api/health

## Collections

1. **users** (auth) - Admin, teacher, student accounts
2. **courses** - Course catalog
3. **classes** - Class instances with teachers
4. **lessons** - Lesson content + attachments
5. **activities** - Quizzes and exams
6. **questions** - Activity questions
7. **submissions** - Student answers (auto-graded)
8. **enrollments** - Student-class relationships

## User Roles

| Role | Access |
|------|--------|
| **admin** | Full CRUD on all collections |
| **teacher** | CRUD on assigned classes only |
| **student** | Read enrolled classes, submit answers |

## Hooks (Business Logic)

- `pb_hooks/submissions.pb.js` - Auto-grading
- `pb_hooks/enrollments.pb.js` - Enrollment validation

## Key Features

✅ Auto-grading (MCQ, T/F, Short Answer)
✅ Enrollment validation
✅ Role-based access control
✅ File attachments (PDF, images)
✅ Automatic migrations
✅ Schema versioning

## API Authentication

```bash
# Login
curl -X POST http://localhost:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"email@example.com","password":"password"}'

# Use returned token in subsequent requests
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8090/api/collections/courses/records
```

## Common Tasks

### Create Admin User
1. Start server: `./start.sh`
2. Visit: http://127.0.0.1:8090/_/
3. Create admin account

### Check Server Status
```bash
./validate.sh
# or
ps aux | grep pocketbase
```

### View Logs
```bash
# Development mode shows logs in console
./pocketbase serve --dev

# Or check log files
tail -f pb_data/logs.db
```

### Backup Before Changes
```bash
./backup.sh
# Backups saved to: backups/backup_YYYYMMDD_HHMMSS.tar.gz
```

## Troubleshooting

**Port already in use?**
```bash
# Find and kill process
ps aux | grep pocketbase
kill <PID>
```

**Database locked?**
```bash
# Stop all PocketBase instances
pkill pocketbase
```

**Reset admin password?**
```bash
./pocketbase admin update <email> <new_password>
```

## Documentation

- Full docs: `README.md`
- API examples: `.github/copilot-instructions.md`
- Changes: `PROJECT_CHANGELOG.md`
- Status: `CLEANUP_SUMMARY.md`

---

**Version**: PocketBase 0.22.0
**Status**: 🟢 Operational
