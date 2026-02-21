# 📋 FRONTEND TEAM: Classes & Courses Schema - Answers

**Date:** February 21, 2026  
**Status:** ✅ Schema Updated and Verified

---

## Questions Answered

### **Question 1: Classes Collection (Grades) - Grade Name Field**

#### **Q: What field should we use for the grade name? (e.g., "Grade 1", "Grade 2")**

**A:** Use the **`name`** field

---

#### **Q: Does this field exist?**

**A:** ✅ **YES** - The field exists and has been verified in the live database.

**Note:** Our previous `schema_latest.json` was outdated. It has now been updated to reflect the current database state (as of migrations from Feb 20, 2026).

---

#### **Q: Should it be bilingual? Format?**

**A:** ✅ **YES, it's bilingual!**

**Field Type:** `json`

**Expected Format:**
```json
{
  "ar": "الصف الأول",
  "en": "Grade 1"
}
```

---

#### **Complete Classes Collection Schema**

```typescript
interface ClassesRecord {
  id: string;                      // Auto-generated
  code: string;                    // Required, 1-20 chars (e.g., "G1", "G2")
  name: {                          // Required, JSON (bilingual)
    ar: string;
    en: string;
  };
  display_order: number;           // Required, integer (for sorting)
  is_active: boolean;              // Required
  created: string;                 // Auto-generated timestamp
  updated: string;                 // Auto-generated timestamp
}
```

**Example Record:**
```json
{
  "id": "abc123xyz",
  "code": "G1",
  "name": {
    "ar": "الصف الأول",
    "en": "Grade 1"
  },
  "display_order": 1,
  "is_active": true,
  "created": "2026-02-21 10:00:00.000Z",
  "updated": "2026-02-21 10:00:00.000Z"
}
```

---

### **Question 2: Courses Collection (Subjects) - Title Field**

#### **Q: The title field - is it bilingual or just one language?**

**A:** The **`title`** field **no longer exists**. It was renamed to **`name`** in migration `1771550187_updated_courses.js` (Feb 20, 2026).

**Use:** `name` field instead

---

#### **Q: Should we use it as-is (plain string) or does it contain JSON?**

**A:** ✅ **It contains JSON** (bilingual object)

**Field Type:** `json`

**Expected Format:**
```json
{
  "ar": "الرياضيات",
  "en": "Mathematics"
}
```

---

#### **Complete Courses Collection Schema**

```typescript
interface CoursesRecord {
  id: string;                      // Auto-generated
  code: string;                    // Required, 1-20 chars (e.g., "MATH", "SCI")
  name: {                          // Required, JSON (bilingual)
    ar: string;
    en: string;
  };
  description?: string;            // Optional, HTML/rich text
  icon?: string;                   // Optional, max 10 chars (emoji or icon name)
  color?: string;                  // Optional, max 20 chars (hex color)
  is_active: boolean;              // Required
  created: string;                 // Auto-generated timestamp
  updated: string;                 // Auto-generated timestamp
}
```

**Example Record:**
```json
{
  "id": "xyz789abc",
  "code": "MATH",
  "name": {
    "ar": "الرياضيات",
    "en": "Mathematics"
  },
  "description": "<p>Mathematics curriculum for elementary students</p>",
  "icon": "📐",
  "color": "#3B82F6",
  "is_active": true,
  "created": "2026-02-21 10:00:00.000Z",
  "updated": "2026-02-21 10:00:00.000Z"
}
```

---

## 🎯 How to Use in Frontend

### **1. Fetching Data**

**Fetch All Active Grades:**
```javascript
const response = await fetch('/api/collections/classes/records?filter=(is_active=true)&sort=+display_order');
const data = await response.json();
const grades = data.items;
```

**Fetch All Active Subjects:**
```javascript
const response = await fetch('/api/collections/courses/records?filter=(is_active=true)&sort=+code');
const data = await response.json();
const subjects = data.items;
```

---

### **2. Displaying Bilingual Names**

```javascript
// Get current language from your i18n/language context
const currentLanguage = useLanguage(); // 'ar' or 'en'

// Display grade name
const gradeName = gradeRecord.name[currentLanguage];
// Result: "Grade 1" (if en) or "الصف الأول" (if ar)

// Display subject name
const subjectName = subjectRecord.name[currentLanguage];
// Result: "Mathematics" (if en) or "الرياضيات" (if ar)
```

---

### **3. Complete Example Component**

```typescript
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface Grade {
  id: string;
  code: string;
  name: {
    ar: string;
    en: string;
  };
  display_order: number;
  is_active: boolean;
}

export function GradeSelector() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const { language } = useLanguage(); // 'ar' or 'en'

  useEffect(() => {
    async function fetchGrades() {
      const response = await fetch(
        '/api/collections/classes/records?filter=(is_active=true)&sort=+display_order'
      );
      const data = await response.json();
      setGrades(data.items);
    }
    fetchGrades();
  }, []);

  return (
    <select>
      {grades.map((grade) => (
        <option key={grade.id} value={grade.id}>
          {grade.name[language]}
        </option>
      ))}
    </select>
  );
}
```

---

### **4. Creating New Records**

**Create New Grade:**
```javascript
const newGrade = {
  code: "G3",
  name: {
    ar: "الصف الثالث",
    en: "Grade 3"
  },
  display_order: 3,
  is_active: true
};

await fetch('/api/collections/classes/records', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify(newGrade)
});
```

**Create New Subject:**
```javascript
const newSubject = {
  code: "SCI",
  name: {
    ar: "العلوم",
    en: "Science"
  },
  description: "<p>General science curriculum</p>",
  icon: "🔬",
  color: "#10B981",
  is_active: true
};

await fetch('/api/collections/courses/records', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify(newSubject)
});
```

---

## 📊 Summary Table

| Collection | Field | Type | Required | Bilingual | Format |
|------------|-------|------|----------|-----------|--------|
| **classes** (grades) | `name` | JSON | ✅ Yes | ✅ Yes | `{ar: string, en: string}` |
| **classes** (grades) | `code` | text | ✅ Yes | ❌ No | "G1", "G2", etc. |
| **classes** (grades) | `display_order` | number | ✅ Yes | ❌ No | 1, 2, 3... |
| **classes** (grades) | `is_active` | boolean | ✅ Yes | ❌ No | true/false |
| **courses** (subjects) | `name` | JSON | ✅ Yes | ✅ Yes | `{ar: string, en: string}` |
| **courses** (subjects) | `code` | text | ✅ Yes | ❌ No | "MATH", "SCI", etc. |
| **courses** (subjects) | `icon` | text | ❌ No | ❌ No | "📐", "🔬", etc. |
| **courses** (subjects) | `color` | text | ❌ No | ❌ No | "#3B82F6", etc. |
| **courses** (subjects) | `description` | editor | ❌ No | ❌ No | HTML content |
| **courses** (subjects) | `is_active` | boolean | ✅ Yes | ❌ No | true/false |

---

## ⚠️ Important Notes

### **1. Schema Has Been Updated**
- ✅ `migrations/schema_latest.json` has been updated to reflect current database state
- ✅ Backup created: `migrations/schema_latest_backup_20260221.json`
- ✅ All changes verified against live database

### **2. Old Fields Removed**
**Classes collection:**
- ❌ `course_id` (relation) - REMOVED
- ❌ `teacher_id` (relation) - REMOVED

**Courses collection:**
- ❌ `title` (text) - REMOVED, replaced with `name` (JSON)

### **3. Validation Rules**

**Code field:**
- Minimum length: 1 character
- Maximum length: 20 characters
- Should be unique (not enforced by DB, handle in frontend)

**Name field:**
- Must contain both `ar` and `en` keys
- Both values should be non-empty strings

**Display Order (classes only):**
- Integer values only
- Used for sorting grades in correct order

---

## 🧪 Testing

### **Test Data for Development**

**Sample Grades:**
```json
[
  {
    "code": "G1",
    "name": {"ar": "الصف الأول", "en": "Grade 1"},
    "display_order": 1,
    "is_active": true
  },
  {
    "code": "G2",
    "name": {"ar": "الصف الثاني", "en": "Grade 2"},
    "display_order": 2,
    "is_active": true
  },
  {
    "code": "G3",
    "name": {"ar": "الصف الثالث", "en": "Grade 3"},
    "display_order": 3,
    "is_active": true
  }
]
```

**Sample Subjects:**
```json
[
  {
    "code": "MATH",
    "name": {"ar": "الرياضيات", "en": "Mathematics"},
    "icon": "📐",
    "color": "#3B82F6",
    "is_active": true
  },
  {
    "code": "SCI",
    "name": {"ar": "العلوم", "en": "Science"},
    "icon": "🔬",
    "color": "#10B981",
    "is_active": true
  },
  {
    "code": "ENG",
    "name": {"ar": "اللغة الإنجليزية", "en": "English"},
    "icon": "📚",
    "color": "#F59E0B",
    "is_active": true
  }
]
```

---

## 📞 Questions or Issues?

If you encounter any issues:

1. Verify you're using the correct field names: `name` (not `title`)
2. Ensure the `name` field is treated as JSON object (not string)
3. Check that both `ar` and `en` keys are present
4. Contact backend team if you encounter schema mismatches

---

## ✅ Ready to Implement!

You now have:
- ✅ Correct field names and types
- ✅ Bilingual format specification
- ✅ Complete schema documentation
- ✅ Code examples for all operations
- ✅ Test data for development

**The schema has been verified and updated. You can proceed with frontend implementation!** 🚀
