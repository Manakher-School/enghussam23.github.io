# Database Setup Guide - Subjects Collection

## Create `subjects` Collection in PocketBase

### Step 1: Create Collection

1. Open PocketBase Admin UI: http://127.0.0.1:8090/_/
2. Click **"Collections"** (left sidebar)
3. Click **"New Collection"** button
4. Select **"Base Collection"**

### Step 2: Basic Settings

```
Name: subjects
Type: Base Collection
```

### Step 3: Add Fields

Click **"+ New field"** for each field below:

#### Field 1: `code`
```
Type: Text
Name: code

Options:
  Min length: 1
  Max length: 20
  Required: ✓ (checked)
  Unique: ✓ (checked) ← IMPORTANT!
  Pattern: (leave empty)
```

#### Field 2: `name`
```
Type: JSON
Name: name

Options:
  Required: ✓ (checked)
  Max size: (leave default)
```

#### Field 3: `description`
```
Type: JSON
Name: description

Options:
  Required: ☐ (unchecked - optional)
  Max size: (leave default)
```

#### Field 4: `icon`
```
Type: Text
Name: icon

Options:
  Min length: (leave empty)
  Max length: 10
  Required: ☐ (unchecked - optional)
  Pattern: (leave empty)
```

#### Field 5: `color`
```
Type: Text
Name: color

Options:
  Min length: (leave empty)
  Max length: 20
  Required: ☐ (unchecked - optional)
  Pattern: (leave empty)
```

#### Field 6: `available_grades`
```
Type: JSON
Name: available_grades

Options:
  Required: ☐ (unchecked - optional)
  Max size: (leave default)

Note: This will store an array of grade codes like ["KG", "1", "2"]
      Leave empty for now - subjects available for all grades by default
```

#### Field 7: `is_active`
```
Type: Bool
Name: is_active

Options:
  Required: ✓ (checked)
  Default value: true ← Check this and set to true
```

### Step 4: Set API Rules

Click **"API Rules"** tab:

```
List/Search Rule:    (leave empty - public read)
View Rule:           (leave empty - public read)
Create Rule:         @request.auth.role = "admin" || @request.auth.role = "teacher"
Update Rule:         @request.auth.role = "admin" || @request.auth.role = "teacher"
Delete Rule:         @request.auth.role = "admin"
```

### Step 5: Save Collection

Click **"Create"** button

---

## Add Initial Subject Records

Now add the 4 default subjects. For each, click **"New record"**:

### Record 1: Mathematics
```
code: MATH
name: {"en":"Mathematics","ar":"رياضيات"}
description: (leave empty for now)
icon: 📐
color: #2196F3
available_grades: (leave empty - available for all)
is_active: true
```

### Record 2: Science
```
code: SCI
name: {"en":"Science","ar":"علوم"}
description: (leave empty)
icon: 🔬
color: #4CAF50
available_grades: (leave empty)
is_active: true
```

### Record 3: Arabic Language
```
code: ARAB
name: {"en":"Arabic","ar":"لغة عربية"}
description: (leave empty)
icon: 📖
color: #FF5722
available_grades: (leave empty)
is_active: true
```

### Record 4: English Language
```
code: ENG
name: {"en":"English","ar":"لغة إنجليزية"}
description: (leave empty)
icon: 🇬🇧
color: #9C27B0
available_grades: (leave empty)
is_active: true
```

---

## Verification

After creation, verify:
- ✅ subjects collection has 7 fields (code, name, description, icon, color, available_grades, is_active)
- ✅ 4 subject records created (MATH, SCI, ARAB, ENG)
- ✅ code field is unique
- ✅ is_active defaults to true
- ✅ Public can read, admin/teacher can write

---

## Next Steps

After completing subjects:
1. Update `teacher_classes` collection - add `section_id` field
2. Verify `teacher_subjects` collection structure
3. Test all database relations
