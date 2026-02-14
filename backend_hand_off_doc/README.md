# Manakher School Backend

PocketBase-based backend for the Manakher School management system.

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# 1. Validate the setup
./validate.sh

# 2. Start the server
./start.sh
```

The server will be available at:
- **Admin UI**: http://127.0.0.1:8090/_/
- **API**: http://127.0.0.1:8090/api/

On first run, you'll be prompted to create an admin account.

### Option 2: Manual Setup

#### 1. Install PocketBase

```bash
# Use the install script
./install_pocketbase.sh

# Or download manually
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
chmod +x pocketbase
```

#### 2. Start PocketBase

```bash
# Development mode (with auto-migrations and dev logging)
./pocketbase serve --dev

# Production mode
./pocketbase serve
```

### 3. Initial Setup

On first run:
1. Open http://127.0.0.1:8090/_/
2. Create an admin account
3. Collections are automatically created via `pb_migrations/` on startup

### 4. Collections

The following collections are automatically set up:

- **users** (auth) - Admin, teacher, and student accounts
- **courses** - Course catalog
- **classes** - Class instances with teacher assignments
- **lessons** - Lesson content and attachments
- **activities** - Quizzes and exams
- **questions** - Activity questions with auto-grading
- **submissions** - Student submissions with scores
- **enrollments** - Student-class enrollment management

All collections are created automatically via the migration files in `pb_migrations/`.

## Project Structure

```
backend_repo/
├── pb_hooks/              # JavaScript hooks for business logic
│   ├── submissions.pb.js  # Auto-grading logic
│   └── enrollments.pb.js  # Enrollment validation
├── pb_migrations/         # Schema migration scripts (auto-run on startup)
├── migrations/            # Schema version snapshots (JSON exports)
├── pb_data/              # Database and uploaded files (gitignored)
├── start.sh              # Quick start script
├── validate.sh           # Validation and health check script
├── export_schema.sh      # Export current schema to JSON
├── backup.sh             # Create backup of data and configs
├── install_pocketbase.sh # Download and install PocketBase
└── README.md             # This file
```

## Utility Scripts

### start.sh
Starts PocketBase in development mode with auto-migrations and detailed logging.

### validate.sh
Checks that all components are properly configured:
- PocketBase binary existence and version
- Database and collections
- Hooks and migrations
- Schema exports
- Script permissions

### export_schema.sh
Exports the current database schema to JSON files:
- Creates dated snapshot: `migrations/schema_YYYYMMDD.json`
- Updates latest: `migrations/schema_latest.json`

### backup.sh
Creates a compressed backup including:
- Database (pb_data/)
- Hooks (pb_hooks/)
- Migrations (pb_migrations/)
- Schema exports (migrations/)
- Keeps last 7 backups automatically

## User Roles

- **admin**: Full system access
- **teacher**: Manage assigned classes, lessons, activities
- **student**: View enrolled classes, submit answers

## Key Features

### Auto-Grading
- MCQ and True/False questions are automatically graded
- Score calculation: `(correct answers / total questions) × max_score`
- Implementation: `pb_hooks/submissions.pb.js`

### Enrollment System
- Students must be enrolled in a class to access its content
- One enrollment per student per class
- Status: active, completed, dropped

### File Uploads
- Lessons support PDF and image attachments
- Files protected by collection access rules

## API Examples

### Authentication
```bash
curl -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"teacher@school.com","password":"password123"}'
```

### Create Lesson (Teacher)
```bash
curl -X POST http://127.0.0.1:8090/api/collections/lessons/records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "class_id=CLASS_ID" \
  -F "title=Introduction to Algebra" \
  -F "content=<p>Today we learn variables...</p>" \
  -F "attachments=@lesson1.pdf"
```

### Submit Answers (Student)
```bash
curl -X POST http://127.0.0.1:8090/api/collections/submissions/records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_id":"ACTIVITY_ID",
    "student_id":"STUDENT_ID",
    "answers":{"question_id_1":"4","question_id_2":true}
  }'
```

## Development Workflow

### Making Schema Changes

1. **Make changes in Admin UI** (http://127.0.0.1:8090/_/)

2. **Export updated schema:**
```bash
./export_schema.sh
```

This creates:
- `migrations/schema_YYYYMMDD.json` (dated snapshot)
- `migrations/schema_latest.json` (current schema)

3. **Commit to git:**
```bash
git add migrations/
git commit -m "feat: add new collection"
```

### Schema Export Details

The `export_schema.sh` script queries the SQLite database directly since PocketBase 0.22.0 doesn't have a built-in export command. It extracts collection schemas from the `_collections` table.

### Creating Backups

```bash
# Quick backup
./backup.sh

# Manual backup
tar -czf backup_$(date +%Y%m%d).tar.gz --exclude='backups' pb_data/ pb_hooks/ pb_migrations/ migrations/
```

Backups include:
- Database (pb_data/)
- Business logic (pb_hooks/)
- Migration scripts (pb_migrations/)
- Schema snapshots (migrations/)

### Testing Access Rules

Test with different user roles to ensure:
- Teachers can only access their assigned classes
- Students cannot see correct answers
- Submissions are properly validated

## Security Checklist

- [ ] Admin account created with strong password
- [ ] Access rules configured for all collections
- [ ] File upload restrictions in place
- [ ] CORS configured for production
- [ ] Environment variables for sensitive data
- [ ] Regular database backups

## Deployment

### Production Setup

```bash
# Run with production settings
./pocketbase serve --http=0.0.0.0:8090

# With encryption (recommended)
export PB_ENCRYPTION_KEY="your-32-char-encryption-key"
./pocketbase serve --http=0.0.0.0:8090
```

### Automated Backup

Add to crontab for daily backups:

```bash
# Edit crontab
crontab -e

# Add this line for daily 2 AM backup
0 2 * * * cd /path/to/backend_repo && ./backup.sh
```

## Environment Variables

Create a `.env` file for local development:

```env
PB_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

## Documentation

📚 **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Complete documentation guide and navigation

### For Frontend Developers ⭐
- **[FRONTEND_HANDOFF.md](FRONTEND_HANDOFF.md)** - Quick start summary (START HERE!)
- **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** - API cheat sheet (keep handy)
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Complete API documentation (150+ pages)
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - Visual system overview

### For Backend Developers
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Essential commands and troubleshooting
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Collection schemas, access rules, migration strategies
- **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** - Recent changes and current status
- **[PROJECT_CHANGELOG.md](PROJECT_CHANGELOG.md)** - Version history

### External Resources
- PocketBase Documentation: https://pocketbase.io/docs/
- PocketBase JavaScript SDK: https://github.com/pocketbase/js-sdk

## Support

For issues or questions:
- **Frontend Team**: See `FRONTEND_INTEGRATION_GUIDE.md` and `FRONTEND_HANDOFF.md`
- **Backend Team**: Check `.github/copilot-instructions.md` and `QUICK_REFERENCE.md`
- **PocketBase Issues**: https://pocketbase.io/docs/
