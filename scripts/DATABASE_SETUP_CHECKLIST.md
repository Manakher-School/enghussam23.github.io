# Database Foundation Setup - Complete Checklist

## Overview
This document tracks the complete database setup for the new teacher/student assignment system.

---

## ✅ Completed

### 1. `classes` Collection (Grade Levels)
- [x] Schema updated with correct fields (code, name, display_order, is_active)
- [x] 7 grade records added (KG, 1-6)
- [x] API rules configured (Admin + Teacher read, Admin write)

### 2. Scripts Created
- [x] `scripts/create_sections.js` - Bulk section creation
- [x] `scripts/manual_sections_guide.js` - Manual creation guide
- [x] `scripts/SUBJECTS_SETUP_GUIDE.md` - Subjects setup documentation

---

## ⏳ In Progress / Pending

### 3. `class_sections` Collection (Sections per Grade)
- [ ] **ACTION REQUIRED:** Add 19 section records
  - See output from: `node scripts/manual_sections_guide.js`
  - Or manually create in PocketBase Admin UI
  - Structure: KG-A, 1-ABC, 2-ABC, 3-ABC, 4-ABC, 5-ABC, 6-ABC

**Fields verified:**
- ✅ name (Text)
- ✅ grade (Relation → classes)
- ✅ teacher (Relation → users, optional)
- ✅ max_students (Number, optional)
- ✅ is_active (Bool)

### 4. `subjects` Collection
- [ ] **ACTION REQUIRED:** Create collection
  - See guide: `scripts/SUBJECTS_SETUP_GUIDE.md`
  - Fields needed: code, name, description, icon, color, available_grades, is_active
- [ ] Add 4 initial subject records (MATH, SCI, ARAB, ENG)

### 5. `teacher_classes` Collection
- [ ] **ACTION REQUIRED:** Add `section_id` field
  - Type: Relation
  - Collection: class_sections
  - Required: ✓
  - Single relation

**Current fields:**
- ✅ teacher_id (Relation → users)
- ✅ subject_id (Relation → subjects) - *verify this exists*
- ❓ grade_id (Relation → classes) - *verify this exists*
- ❌ section_id - **NEEDS TO BE ADDED**

### 6. `teacher_subjects` Collection
- [ ] **ACTION REQUIRED:** Verify structure
  - Should have: teacher_id, subject_id
  - Unique index on (teacher_id, subject_id)

---

## 🎯 Final Verification Steps

After completing all above:

- [ ] Test creating a teacher assignment
- [ ] Verify all relations work correctly
- [ ] Check that grade dropdown shows in teacher assignment UI
- [ ] Check that section dropdown filters by selected grade
- [ ] Verify subject dropdown shows available subjects

---

## Database Schema Summary

### Collections Structure:

```
classes (grades)
├── code (Text, unique)
├── name (JSON)
├── display_order (Number)
└── is_active (Bool)

class_sections (sections)
├── name (Text)
├── grade (Relation → classes)
├── teacher (Relation → users, optional)
├── max_students (Number)
└── is_active (Bool)

subjects
├── code (Text, unique)
├── name (JSON)
├── description (JSON, optional)
├── icon (Text, optional)
├── color (Text, optional)
├── available_grades (JSON, optional)
└── is_active (Bool)

teacher_subjects
├── teacher_id (Relation → users)
└── subject_id (Relation → subjects)
   [Unique: teacher_id + subject_id]

teacher_classes
├── teacher_id (Relation → users)
├── subject_id (Relation → subjects)
├── grade_id (Relation → classes)
└── section_id (Relation → class_sections)
   [Unique: teacher_id + subject_id + grade_id + section_id]
```

---

## Current Status

**Last Updated:** Session in progress

**Completed:** 
- ✅ classes collection (grades)
- ✅ Scripts and documentation

**Next Actions:**
1. Add sections to class_sections (19 records)
2. Create subjects collection
3. Add section_id to teacher_classes
4. Verify teacher_subjects structure

**Estimated Time Remaining:** 15-20 minutes (manual work)
