# Database Documentation

This folder contains all database-related files for the Al-Manakhir Basic School platform.

## 📁 Contents

### Main Documentation

- **[DATABASE_DESIGN.md](../DATABASE_DESIGN.md)** - Comprehensive database design document with full specifications
- **schema.sql** - PostgreSQL schema creation script (executable)

## 🚀 Quick Start

### 1. Install PostgreSQL

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE school_db;
CREATE USER school_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE school_db TO school_admin;

# Exit psql
\q
```

### 3. Execute Schema

```bash
# Run the schema file
psql -U school_admin -d school_db -f schema.sql

# Or if using sudo
sudo -u postgres psql -d school_db -f schema.sql
```

### 4. Verify Installation

```bash
# Connect to the database
psql -U school_admin -d school_db

# List all tables
\dt

# Check if data was seeded
SELECT * FROM roles;
SELECT * FROM grades;
SELECT * FROM subjects;

# Exit
\q
```

## 📊 Database Structure

### Core Entities (23 Tables)

#### 🔐 Authentication (3 tables)

- `roles` - User roles (student, teacher, admin)
- `users` - User accounts
- `user_profiles` - Extended user information

#### 🏫 Academic Structure (4 tables)

- `grades` - Grade levels (KG - Tawjihi)
- `sections` - Class sections (A, B, C, D)
- `subjects` - Academic subjects
- `user_grade_sections` - Student enrollment

#### 📝 Homework (2 tables)

- `homework` - Assignments
- `homework_submissions` - Student submissions

#### 📚 Materials (1 table)

- `materials` - Educational resources

#### 📋 Quizzes (5 tables)

- `quizzes` - Quiz/exam definitions
- `questions` - Quiz questions
- `question_options` - Multiple choice options
- `quiz_attempts` - Student attempts
- `student_answers` - Individual answers

#### 📰 News (3 tables)

- `news` - Announcements
- `news_images` - News images
- `comments` - User comments

#### 📎 Files (2 tables)

- `files` - File metadata
- `submission_files` - Links submissions to files

#### ⚙️ System (3 tables)

- `settings` - Application settings
- `audit_logs` - Change tracking
- `schema_migrations` - Version control

## 🔍 Common Queries

### Get Student's Homework

```sql
SELECT h.*, s.name_ar as subject_name
FROM homework h
JOIN subjects s ON h.subject_id = s.id
JOIN user_grade_sections ugs ON h.grade_id = ugs.grade_id
WHERE ugs.user_id = 'student-uuid-here'
  AND ugs.is_current = true
  AND h.is_published = true
ORDER BY h.due_date ASC;
```

### Get Submission Statistics

```sql
SELECT 
    COUNT(*) as total_homework,
    COUNT(hs.id) as submitted,
    COUNT(CASE WHEN hs.status = 'graded' THEN 1 END) as graded,
    AVG(hs.score) as average_score
FROM homework h
LEFT JOIN homework_submissions hs ON h.id = hs.homework_id
WHERE hs.student_id = 'student-uuid-here';
```

### Quiz Leaderboard

```sql
SELECT 
    u.first_name,
    u.last_name,
    qa.percentage,
    RANK() OVER (ORDER BY qa.percentage DESC) as rank
FROM quiz_attempts qa
JOIN users u ON qa.student_id = u.id
WHERE qa.quiz_id = 'quiz-uuid-here'
  AND qa.status = 'submitted'
ORDER BY rank;
```

## 🔧 Maintenance

### Backup Database

```bash
# Full backup
pg_dump -U school_admin school_db > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U school_admin school_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# From SQL file
psql -U school_admin school_db < backup_20260212.sql

# From compressed file
gunzip -c backup_20260212.sql.gz | psql -U school_admin school_db
```

### Analyze & Optimize

```sql
-- Update statistics for query planner
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Reindex if needed
REINDEX DATABASE school_db;
```

## 🔐 Security Best Practices

1. **Use strong passwords** for database users
2. **Enable SSL** for remote connections
3. **Restrict pg_hba.conf** to trusted IPs
4. **Regular backups** (automated daily)
5. **Monitor audit logs** for suspicious activity
6. **Use prepared statements** to prevent SQL injection
7. **Encrypt sensitive data** (national IDs, etc.)
8. **Row-level security** for multi-tenant isolation

### Example: Enable SSL Connections

```bash
# In postgresql.conf
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

## 📈 Performance Tuning

### Connection Pooling

Use PgBouncer or application-level pooling:

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  database: 'school_db',
  user: 'school_admin',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Optimize Queries

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM homework WHERE grade_id = 5;
```

## 🧪 Testing

### Sample Data Generator

```sql
-- Insert test student
INSERT INTO users (username, email, password_hash, role_id)
VALUES ('test_student', 'student@test.com', 'hashed_password', 1);

-- Insert test homework
INSERT INTO homework (
    title_ar, title_en, content_ar, content_en,
    subject_id, grade_id, teacher_id, due_date, is_published
) VALUES (
    'واجب اختبار', 'Test Homework',
    'محتوى اختباري', 'Test content',
    1, 1, (SELECT id FROM users WHERE role_id = 2 LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '7 days', true
);
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Document](../DATABASE_DESIGN.md) - Full specifications
- [API Documentation](../docs/API.md) - Backend API reference (to be created)
- [Migration Guide](../docs/MIGRATION.md) - Data migration from JSON (to be created)

## 🐛 Troubleshooting

### Can't connect to database

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check connection settings
psql -U school_admin -d school_db -h localhost
```

### Permission denied

```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO school_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO school_admin;
```

### Reset password

```bash
# Connect as postgres user
sudo -u postgres psql

# Change password
ALTER USER school_admin WITH PASSWORD 'new_password';
```

## 📝 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-12 | Initial schema creation |

## 🤝 Contributing

When modifying the database schema:

1. **Never** modify `schema.sql` directly in production
2. Create a new migration file: `migrations/YYYYMMDD_description.sql`
3. Test migration in development environment
4. Document changes in [DATABASE_DESIGN.md](../DATABASE_DESIGN.md)
5. Update this README if needed

## 📄 License

Database schema for Al-Manakhir Basic School Educational Platform
© 2026 - Internal Use Only
