# 📚 Documentation Index

**Manakher School Backend - Complete Documentation Guide**

---

## 🎯 For Frontend Developers (START HERE!)

### Essential Reading (In Order)

1. **[FRONTEND_HANDOFF.md](FRONTEND_HANDOFF.md)** ⭐ **START HERE**
   - Quick summary for frontend team
   - Essential commands and patterns
   - TypeScript types
   - Common operations
   - **Read time**: 10-15 minutes

2. **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** ⭐ **KEEP HANDY**
   - API cheat sheet
   - Common queries and patterns
   - Copy-paste code examples
   - Error handling
   - **Use as**: Daily reference card

3. **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** 📖 **COMPREHENSIVE**
   - Complete API documentation (150+ pages)
   - Data models and schemas
   - Authentication flows
   - File handling
   - Real-time subscriptions
   - React/TypeScript examples
   - **Use when**: Building features, troubleshooting

4. **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** 📊 **VISUAL**
   - System architecture diagrams
   - Data flow visualizations
   - Collection relationships
   - Access control matrix
   - **Use for**: Understanding system design

---

## 🛠️ For Backend Developers

### Essential Reading (In Order)

1. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** ⭐ **START HERE**
   - Essential commands
   - Server URLs
   - Collections overview
   - Common tasks
   - **Read time**: 5 minutes

2. **[README.md](README.md)** 📖 **SETUP & OVERVIEW**
   - Quick start guide
   - Project structure
   - User roles
   - Development workflow
   - Deployment instructions

3. **[.github/copilot-instructions.md](.github/copilot-instructions.md)** 📚 **DETAILED SPECS**
   - Collection schemas (detailed)
   - Access rule patterns
   - Migration strategies
   - Auto-grading implementation
   - Enrollment system
   - API request/response examples
   - **Use when**: Creating features, debugging

4. **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** 📋 **STATUS REPORT**
   - What was fixed/cleaned
   - Current state
   - Files created/modified
   - Backend status

5. **[PROJECT_CHANGELOG.md](PROJECT_CHANGELOG.md)** 📅 **VERSION HISTORY**
   - Recent changes (Feb 14, 2026)
   - What was added/changed/fixed
   - Technical details

---

## 📂 Additional Resources

### Utility Scripts Documentation

- **[validate.sh](validate.sh)** - Health check script
- **[start.sh](start.sh)** - Quick start script
- **[export_schema.sh](export_schema.sh)** - Schema export script
- **[backup.sh](backup.sh)** - Backup creation script
- **[install_pocketbase.sh](install_pocketbase.sh)** - PocketBase installer

### Technical Documentation

- **[pb_hooks/](pb_hooks/)** - Business logic hooks
  - `submissions.pb.js` - Auto-grading logic
  - `enrollments.pb.js` - Enrollment validation

- **[pb_migrations/](pb_migrations/)** - Database migrations
  - 32 migration files
  - Auto-run on server startup

- **[migrations/](migrations/)** - Schema snapshots
  - `schema_latest.json` - Current schema
  - `schema_YYYYMMDD.json` - Dated snapshots

---

## 🎓 Documentation by Use Case

### "I want to integrate the frontend"
1. Read: [FRONTEND_HANDOFF.md](FRONTEND_HANDOFF.md)
2. Install: `npm install pocketbase`
3. Reference: [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
4. Deep dive: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)

### "I want to understand the architecture"
1. Read: [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)
2. Review: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - Data Models section
3. Check: [.github/copilot-instructions.md](.github/copilot-instructions.md) - Collection schemas

### "I want to set up the backend"
1. Read: [README.md](README.md) - Quick Start section
2. Run: `./validate.sh`
3. Start: `./start.sh`
4. Reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### "I want to modify collections/schema"
1. Review: [.github/copilot-instructions.md](.github/copilot-instructions.md) - Schema section
2. Make changes in Admin UI: `http://127.0.0.1:8090/_/`
3. Export: `./export_schema.sh`
4. Test with: `./validate.sh`

### "I want to understand access control"
1. Visual: [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) - Access Control Matrix
2. Details: [.github/copilot-instructions.md](.github/copilot-instructions.md) - Access Rules section
3. Examples: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - Access Control section

### "I want to implement auto-grading"
1. Read: [.github/copilot-instructions.md](.github/copilot-instructions.md) - Auto-Grading section
2. Review code: [pb_hooks/submissions.pb.js](pb_hooks/submissions.pb.js)
3. Visual flow: [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) - Auto-grading Logic

### "I want to add a new feature"
1. Check: [.github/copilot-instructions.md](.github/copilot-instructions.md)
2. Plan: Consider impact on frontend
3. Document: Update [PROJECT_CHANGELOG.md](PROJECT_CHANGELOG.md)
4. Inform: Update [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) if API changes

### "I want to troubleshoot an issue"
1. Quick check: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Troubleshooting section
2. Frontend issues: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - Troubleshooting section
3. API errors: [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) - Error Handling section
4. Backend logs: Check terminal or `pb_data/logs.db`

---

## 📊 Documentation Statistics

```
Total Documentation:  ~250 pages
Core Guides:          5 major documents
Code Examples:        50+ examples
Diagrams:            10+ visual diagrams
API Endpoints:       40+ documented
Collections:         8 with full schemas
```

---

## 🔄 Documentation Updates

When making changes, update these documents:

### Backend Changes
- ✅ Update [PROJECT_CHANGELOG.md](PROJECT_CHANGELOG.md)
- ✅ Update [.github/copilot-instructions.md](.github/copilot-instructions.md) if schema changes
- ✅ Run `./export_schema.sh` to update schema exports

### API Changes (affecting frontend)
- ✅ Update [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
- ✅ Update [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- ✅ Update [FRONTEND_HANDOFF.md](FRONTEND_HANDOFF.md) if major changes
- ✅ Update [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) if data flow changes

---

## 📖 Document Descriptions

### Frontend-Focused Documents

**FRONTEND_HANDOFF.md** (Quick Start)
- Target: Frontend developers (first-time readers)
- Length: ~10 pages
- Content: Summary, essential info, quick examples
- Style: Concise, bulleted, action-oriented

**API_QUICK_REFERENCE.md** (Cheat Sheet)
- Target: Frontend developers (daily use)
- Length: ~15 pages
- Content: Code snippets, common patterns, quick lookup
- Style: Reference card, copy-paste ready

**FRONTEND_INTEGRATION_GUIDE.md** (Complete Manual)
- Target: Frontend developers (comprehensive)
- Length: ~150 pages
- Content: Everything - auth, data models, examples, troubleshooting
- Style: Tutorial + reference, detailed explanations

**ARCHITECTURE_DIAGRAM.md** (Visual Guide)
- Target: All developers
- Length: ~20 pages
- Content: Diagrams, flows, visualizations
- Style: ASCII art diagrams, minimal text

### Backend-Focused Documents

**README.md** (Overview)
- Target: Backend developers, new team members
- Length: ~15 pages
- Content: Setup, structure, workflows
- Style: README format, getting started

**QUICK_REFERENCE.md** (Backend Cheat Sheet)
- Target: Backend developers (daily use)
- Length: ~5 pages
- Content: Essential commands, troubleshooting
- Style: Quick lookup, concise

**.github/copilot-instructions.md** (Specification)
- Target: AI assistants, backend developers
- Length: ~100 pages
- Content: Complete specs, schemas, patterns, examples
- Style: Detailed technical documentation

**CLEANUP_SUMMARY.md** (Status Report)
- Target: Team leads, developers
- Length: ~10 pages
- Content: What was done, current state, next steps
- Style: Report format, organized by category

**PROJECT_CHANGELOG.md** (Version History)
- Target: All team members
- Length: ~5 pages
- Content: Changes over time, versions
- Style: Changelog format, dated entries

---

## 🎯 Reading Paths by Role

### Frontend Developer (New to Project)
1. [FRONTEND_HANDOFF.md](FRONTEND_HANDOFF.md) ← Start
2. [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) ← Keep open
3. [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) ← Reference
4. [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) ← Visual understanding

### Backend Developer (New to Project)
1. [README.md](README.md) ← Start
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) ← Keep open
3. [.github/copilot-instructions.md](.github/copilot-instructions.md) ← Reference
4. [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) ← Current state

### Project Manager / Team Lead
1. [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) ← Current status
2. [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) ← System overview
3. [PROJECT_CHANGELOG.md](PROJECT_CHANGELOG.md) ← History
4. [README.md](README.md) ← Setup overview

### DevOps / Deployment
1. [README.md](README.md) ← Deployment section
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) ← Commands
3. Scripts: `start.sh`, `backup.sh`, `validate.sh`
4. [.github/copilot-instructions.md](.github/copilot-instructions.md) ← Environment setup

---

## 🔍 Quick Search Guide

**Looking for...**

- **Authentication examples** → [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - Authentication section
- **How to submit answers** → [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) - Student Queries
- **Access control rules** → [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) - Access Control Matrix
- **Collection schemas** → [.github/copilot-instructions.md](.github/copilot-instructions.md) - Collection Architecture
- **File upload** → [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - File Uploads
- **Real-time subscriptions** → [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) - Real-time Subscriptions
- **TypeScript types** → [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - Appendix A
- **Error handling** → [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) - Error Handling
- **Auto-grading logic** → [pb_hooks/submissions.pb.js](pb_hooks/submissions.pb.js)
- **Server commands** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## 📞 Getting Help

### For Frontend Integration Questions
1. Check [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
2. Review [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
3. Contact backend team with specifics

### For Backend/Setup Issues
1. Run `./validate.sh`
2. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Troubleshooting
3. Review server logs
4. Check [README.md](README.md)

### For API/Integration Issues
1. Check [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) - Troubleshooting
2. Verify access rules in [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)
3. Test with different user roles
4. Contact backend team with:
   - Request URL
   - Request payload
   - Error message
   - Expected behavior

---

## 🌟 Best Practices

### For Documentation Readers
- ✅ Start with role-specific reading path
- ✅ Bookmark quick reference docs
- ✅ Use Ctrl+F to search within docs
- ✅ Check diagrams first for visual understanding
- ✅ Try code examples in your environment

### For Documentation Writers
- ✅ Update changelog when making changes
- ✅ Keep examples up-to-date
- ✅ Cross-reference related sections
- ✅ Include both simple and complex examples
- ✅ Test all code snippets before documenting

---

## 📅 Last Updated

**Date**: February 14, 2026  
**Backend Version**: PocketBase 0.22.0  
**Documentation Version**: 1.0  
**Status**: ✅ Complete and Production-Ready

---

## 🚀 Quick Actions

```bash
# Validate backend
./validate.sh

# Start server
./start.sh

# Export schema
./export_schema.sh

# Create backup
./backup.sh

# View admin UI
# http://127.0.0.1:8090/_/
```

---

**Happy coding! 🎉**

*This index is maintained as part of the Manakher School Backend documentation suite.*
