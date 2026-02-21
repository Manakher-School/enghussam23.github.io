# 🎯 FRONTEND TEAM: User Deletion System - Implementation Guide

**Date:** February 21, 2026  
**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ⚠️ PENDING IMPLEMENTATION

---

## 📋 Overview

The backend now supports a **two-tier user deletion system** for both teachers and students:

1. **Soft Delete (Deactivation)** - Safe, reversible, preserves all data
2. **Hard Delete (Permanent)** - Irreversible, cascades to all dependencies

This document provides everything the frontend team needs to implement the user deletion UI and workflows.

---

## 🔧 Backend Changes Summary

### Database Changes
- ✅ Added `deleted_at` field to `users` collection (timestamp, nullable)
- ✅ Updated users list rule to auto-filter deleted users
- ✅ Deleted users cannot log in (blocked at auth level)

### New API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/{id}/dependencies` | GET | Check deletion impact before deleting |
| `/api/collections/users/records/{id}?mode=soft` | DELETE | Soft delete (deactivate) user |
| `/api/collections/users/records/{id}?mode=hard` | DELETE | Hard delete user + all dependencies |
| `/api/classes/reassign` | POST | Reassign classes from one teacher to another |
| `/api/users/{id}/reactivate` | POST | Reactivate a soft-deleted user |

---

## 📡 API Reference

### 1. Get User Dependencies (Pre-Deletion Check)

**Endpoint:** `GET /api/users/{id}/dependencies`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response Example (Teacher):**
```json
{
  "user_id": "abc123",
  "user_name": "John Smith",
  "role": "teacher",
  "dependencies": {
    "classes": 5,
    "lessons": 23,
    "activities": 12,
    "questions": 67,
    "student_submissions": 340,
    "enrollments": 85
  },
  "total_impact": 532,
  "warning": "⚠️ Hard delete will permanently remove all these records. This action CANNOT be undone.",
  "can_safely_delete": false
}
```

**Response Example (Student):**
```json
{
  "user_id": "xyz789",
  "user_name": "Jane Doe",
  "role": "student",
  "dependencies": {
    "enrollments": 4,
    "submissions": 23
  },
  "total_impact": 27,
  "warning": "⚠️ Hard delete will permanently remove all these records. This action CANNOT be undone.",
  "can_safely_delete": false
}
```

**Response Example (No Dependencies):**
```json
{
  "user_id": "new123",
  "user_name": "Test User",
  "role": "teacher",
  "dependencies": {},
  "total_impact": 0,
  "warning": "✓ This user has no dependencies and can be safely deleted.",
  "can_safely_delete": true
}
```

**Error Responses:**
- `403 Forbidden` - User is not admin
- `404 Not Found` - User doesn't exist

---

### 2. Soft Delete User (Deactivation)

**Endpoint:** `DELETE /api/collections/users/records/{id}?mode=soft`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**What Happens:**
- User's `deleted_at` field set to current timestamp
- User's `active` field set to `false`
- User cannot log in anymore
- **ALL data is preserved** (classes, submissions, etc.)
- User can be reactivated later

**Response:**
```
HTTP 400 Bad Request
{
  "message": "User deactivated successfully"
}
```

**Note:** This returns a 400 error by design (to prevent actual deletion), but the error message confirms success.

**Error Responses:**
- `403 Forbidden` - User is not admin

---

### 3. Hard Delete User (Permanent)

**Endpoint:** `DELETE /api/collections/users/records/{id}?mode=hard`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**What Happens (Teacher):**
1. Deletes ALL classes taught by teacher
2. Deletes ALL lessons in those classes
3. Deletes ALL activities in those classes
4. Deletes ALL questions in those activities
5. Deletes ALL student submissions for those activities
6. Deletes ALL enrollments in those classes
7. Deletes the teacher user record

**What Happens (Student):**
1. Deletes ALL enrollments
2. Deletes ALL submissions
3. Deletes the student user record

**Response:**
```
HTTP 204 No Content
```

**Error Responses:**
- `403 Forbidden` - User is not admin
- `400 Bad Request` - Deletion failed (with error details)

---

### 4. Reassign Classes

**Endpoint:** `POST /api/classes/reassign`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "old_teacher_id": "teacher123",
  "new_teacher_id": "teacher456",
  "class_ids": ["class1", "class2"]  // Optional: if empty, reassigns ALL classes
}
```

**Response:**
```json
{
  "success": true,
  "reassigned_count": 2,
  "old_teacher_id": "teacher123",
  "new_teacher_id": "teacher456",
  "message": "Successfully reassigned 2 class(es)"
}
```

**Error Responses:**
- `403 Forbidden` - User is not admin
- `400 Bad Request` - Invalid teacher IDs, new teacher not active, etc.

---

### 5. Reactivate User

**Endpoint:** `POST /api/users/{id}/reactivate`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**What Happens:**
- Sets `deleted_at` to `null`
- Sets `active` to `true`
- User can log in again

**Response:**
```json
{
  "success": true,
  "user_id": "abc123",
  "message": "User reactivated successfully"
}
```

**Error Responses:**
- `403 Forbidden` - User is not admin
- `400 Bad Request` - User is not deactivated
- `404 Not Found` - User doesn't exist

---

## 🎨 Frontend UI Requirements

### 1. Teacher Deletion Flow

#### Step 1: Delete Button Click
When admin clicks "Delete Teacher" button:

```javascript
// 1. Fetch dependencies
const response = await fetch(`/api/users/${teacherId}/dependencies`, {
  headers: { Authorization: `Bearer ${adminToken}` }
});
const data = await response.json();

// 2. Show modal with dependencies summary
```

#### Step 2: Deletion Modal

**Modal Structure:**

```
┌─────────────────────────────────────────────────┐
│  ⚠️  Delete Teacher: {teacher_name}             │
├─────────────────────────────────────────────────┤
│                                                 │
│  This teacher has:                              │
│  • 5 classes                                    │
│  • 23 lessons                                   │
│  • 12 activities/quizzes                        │
│  • 340 student submissions                      │
│                                                 │
│  What would you like to do?                     │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 🔵 Option A: Deactivate (Recommended)  │    │
│  │                                         │    │
│  │ Teacher account will be deactivated.   │    │
│  │ All data is preserved.                 │    │
│  │                                         │    │
│  │ [Show Classes to Reassign ▼]           │    │
│  │                                         │    │
│  │ If classes shown:                       │    │
│  │   Class 1: Math 101                     │    │
│  │   → Reassign to: [Dropdown: teachers]  │    │
│  │   Class 2: Math 102                     │    │
│  │   → Reassign to: [Dropdown: teachers]  │    │
│  │                                         │    │
│  │ [ Deactivate Teacher ]                 │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 🔴 Option B: Permanently Delete        │    │
│  │                                         │    │
│  │ ⚠️ WARNING: This will permanently      │    │
│  │ delete the teacher AND all their       │    │
│  │ classes, activities, and student       │    │
│  │ submissions. This CANNOT be undone.    │    │
│  │                                         │    │
│  │ Type DELETE to confirm:                │    │
│  │ [________________]                      │    │
│  │                                         │    │
│  │ [ Permanently Delete ] (disabled)      │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  [Cancel]                                       │
└─────────────────────────────────────────────────┘
```

#### Step 3: Execute Deletion

**Option A - Deactivate (with class reassignment):**

```javascript
// 1. Reassign classes if needed
if (hasClassReassignments) {
  await fetch('/api/classes/reassign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      old_teacher_id: teacherId,
      new_teacher_id: newTeacherId,
      class_ids: selectedClassIds
    })
  });
}

// 2. Soft delete teacher
await fetch(`/api/collections/users/records/${teacherId}?mode=soft`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${adminToken}` }
});

// 3. Show success message
showToast('Teacher deactivated successfully');
refreshUserList();
```

**Option B - Permanent Delete:**

```javascript
// Confirm text matches "DELETE"
if (confirmText !== 'DELETE') {
  showError('Please type DELETE to confirm');
  return;
}

// Hard delete
await fetch(`/api/collections/users/records/${teacherId}?mode=hard`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${adminToken}` }
});

showToast('Teacher and all dependencies permanently deleted');
refreshUserList();
```

---

### 2. Student Deletion Flow

**Same structure as teacher**, but:
- No class reassignment option
- Dependencies show: enrollments, submissions
- Warning message focuses on grade/submission loss

---

### 3. User List Display

#### Default View
```javascript
// Fetch users (auto-filters deleted users due to backend list rule)
const users = await fetchUsers();

// Display normally - deleted users won't appear
```

#### Show Deactivated Users (Optional Toggle)

**UI:**
```
Users List                          [☑️ Show Deactivated]

┌──────────────────────────────────────────────┐
│ John Smith (Teacher)              [Delete]   │
│ Jane Doe (Student)                [Delete]   │
│ Bob Jones (Teacher) 🔒 Deactivated [Reactivate] │
│   Deleted on: Feb 21, 2026                   │
└──────────────────────────────────────────────┘
```

**Implementation:**

```javascript
// When toggle is ON, manually fetch with expand to include deleted
const response = await fetch('/api/collections/users/records?filter=(deleted_at!=null)', {
  headers: { Authorization: `Bearer ${adminToken}` }
});

// Show deactivated badge and reactivate button
```

---

### 4. Reactivate User Flow

```javascript
// When admin clicks "Reactivate"
await fetch(`/api/users/${userId}/reactivate`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}` }
});

showToast('User reactivated successfully');
refreshUserList();
```

---

## ✅ Implementation Checklist

### Required UI Components
- [ ] Teacher deletion modal with two-option flow
- [ ] Student deletion modal with two-option flow
- [ ] Dependencies summary display
- [ ] Class reassignment interface (teacher only)
- [ ] Confirmation input for hard delete ("Type DELETE")
- [ ] Deactivated user badge/indicator
- [ ] Show/hide deactivated users toggle
- [ ] Reactivate button for deactivated users
- [ ] Success/error toast notifications

### Required API Integrations
- [ ] GET `/api/users/{id}/dependencies`
- [ ] DELETE `/api/collections/users/records/{id}?mode=soft`
- [ ] DELETE `/api/collections/users/records/{id}?mode=hard`
- [ ] POST `/api/classes/reassign`
- [ ] POST `/api/users/{id}/reactivate`

### User Experience
- [ ] Show warning for hard delete with dependency count
- [ ] Disable hard delete button until confirmation typed
- [ ] Show loading states during API calls
- [ ] Handle errors gracefully with user-friendly messages
- [ ] Refresh user list after successful operations
- [ ] Show "Deactivated" badge on soft-deleted users

---

## 🧪 Testing Scenarios

### Test Case 1: Soft Delete Teacher with Classes
1. Admin clicks delete on teacher with 3 classes
2. Modal shows dependencies
3. Admin chooses "Deactivate" option
4. Admin reassigns classes to another teacher
5. Clicks "Deactivate Teacher"
6. ✅ Teacher is deactivated
7. ✅ Classes are reassigned
8. ✅ Teacher disappears from default user list
9. ✅ Teacher cannot log in

### Test Case 2: Hard Delete Teacher
1. Admin clicks delete on teacher with classes
2. Admin chooses "Permanently Delete"
3. Types "DELETE" in confirmation
4. Clicks "Permanently Delete"
5. ✅ Teacher deleted
6. ✅ All classes deleted
7. ✅ All activities/lessons/submissions deleted

### Test Case 3: Reactivate Teacher
1. Enable "Show Deactivated" toggle
2. Deactivated teacher appears with badge
3. Click "Reactivate"
4. ✅ Teacher is reactivated
5. ✅ Teacher can log in
6. ✅ Badge removed

### Test Case 4: Student Deletion
1. Similar to teacher but with enrollments/submissions
2. No class reassignment option

---

## 🚨 Important Notes

### For Frontend Developers

1. **Soft delete returns 400** - This is expected! The backend prevents actual deletion by throwing an error, but the message confirms success.

2. **Admin-only** - All deletion endpoints require admin role. Show/hide delete buttons based on user role.

3. **Filter deleted users by default** - The backend list rule auto-filters. To show deleted users, you need a separate query.

4. **Cascading is automatic** - When you hard delete, the backend handles all cascades. You don't need to delete dependencies manually.

5. **No undo for hard delete** - Make the UI very clear that hard delete is permanent.

6. **Class reassignment is optional** - If teacher has no classes, skip the reassignment step.

---

## ⚠️ Important Edge Cases & Gotchas

### 🔴 **CRITICAL: Missing Collections in Deletion Logic**

The hard delete implementation currently handles the main collections, but there are **4 additional collections** with user references that are **NOT automatically handled**:

| Collection | Field | Current Records | Impact |
|------------|-------|-----------------|--------|
| `news` | `author` | 0 | News articles authored by users |
| `teacher_subjects` | `teacher_id` | 1 | Teacher-to-subject assignments |
| `teacher_classes` | `teacher_id` | 1 | Teacher-to-class mappings |
| `class_sections` | `teacher` | 19 | Class sections with assigned teachers |

**⚠️ What this means for you:**
- These records will **block hard deletion** due to foreign key constraints
- The `/api/users/{id}/dependencies` endpoint **does NOT include these counts**
- Frontend might show "can safely delete" but deletion will **fail**

**Required Actions:**
1. **Add extra warning** in UI: "Note: Some additional assignments may prevent deletion"
2. **Handle deletion errors gracefully** - if hard delete fails, show specific error message
3. **Consider requesting backend update** to include these in dependencies check
4. **Alternative:** Manually check these collections before allowing delete:
   ```javascript
   // Optional: Add extra validation
   const newsCount = await fetch(`/api/collections/news/records?filter=(author='${userId}')&perPage=1`);
   const teacherSubjects = await fetch(`/api/collections/teacher_subjects/records?filter=(teacher_id='${userId}')&perPage=1`);
   // ... etc
   ```

---

### 🔴 **CRITICAL: Active Sessions After Soft Delete (Security)**

**The Problem:**
- Soft-deleted users with active JWT tokens can **still access the system** until their token expires
- The backend auth check only blocks **new logins**, not existing sessions
- A soft-deleted teacher could continue accessing/modifying data for hours

**Example Scenario:**
1. Teacher is logged in (token valid for 24 hours)
2. Admin soft-deletes the teacher at 10:00 AM
3. Teacher can still use the system until 10:00 AM next day!

**Required Actions:**
1. **Add client-side check** on protected routes:
   ```javascript
   // In your auth guard or protected route wrapper
   async function checkUserActive() {
     const currentUser = await fetch('/api/collections/users/records/' + userId);
     if (currentUser.deleted_at !== null) {
       // Force logout
       localStorage.removeItem('auth_token');
       redirectToLogin();
     }
   }
   ```

2. **Alternative:** Consider implementing token invalidation on backend (requires backend update)

3. **Minimum:** Add a note in admin UI:
   ```
   ⚠️ Note: Users with active sessions may continue accessing 
   the system until they log out or their session expires.
   ```

---

### 🔴 **CRITICAL: HTTP 400 = Success for Soft Delete**

**The Gotcha:**
Soft delete returns **HTTP 400 Bad Request** with a success message. This is **intentional** but will break standard error handling.

**Wrong Implementation:**
```javascript
try {
  await deleteSoftUser(id);
  showSuccess('User deactivated'); // This will NEVER run
} catch (error) {
  showError(error.message); // This will show "User deactivated successfully"
}
```

**Correct Implementation:**
```javascript
try {
  const response = await fetch(`/api/collections/users/records/${id}?mode=soft`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Soft delete throws error but message indicates success
  if (!response.ok) {
    const error = await response.json();
    if (error.message && error.message.includes('successfully')) {
      // This is actually SUCCESS!
      showSuccess('User deactivated successfully');
      return;
    }
    throw new Error(error.message);
  }
} catch (error) {
  // Check if error message contains "successfully"
  if (error.message.includes('successfully')) {
    showSuccess('User deactivated successfully');
  } else {
    showError('Failed to deactivate user: ' + error.message);
  }
}
```

---

### 🟡 **IMPORTANT: File Attachments Will Be Permanently Lost**

Hard delete will **irreversibly delete** all file attachments:

**Lesson Attachments:**
- PDFs, PNG, APNG images
- Up to 5 files per lesson, 5MB each
- Stored in PocketBase storage

**Student Submission Files:**
- Documents (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX)
- Images, TXT files
- Up to 99 files per submission, 10MB each

**News Images:**
- JPEG, PNG, SVG, GIF, WebP
- Up to 1 file, 5MB each

**Required Actions:**
1. **Add explicit warning** in hard delete confirmation:
   ```
   ⚠️ WARNING: This will permanently delete:
   - X lesson attachments (PDFs, images)
   - Y student submission files (cannot be recovered)
   - Z news article images
   
   These files CANNOT be recovered after deletion.
   ```

2. **Consider adding download option** before deletion:
   - "Download teacher's lesson files before deleting"
   - Provide backup functionality

---

### 🟡 **IMPORTANT: Class Reassignment is Permanent**

**The Gotcha:**
When you reassign classes during soft delete, this is **permanent** - even if the teacher is reactivated.

**Example Scenario:**
1. Teacher John has 3 classes
2. Admin soft-deletes John, reassigns classes to Teacher Mary
3. Admin realizes mistake, reactivates John
4. **Classes remain with Mary** - John has zero classes

**Required Actions:**
1. **Document this clearly** in the UI:
   ```
   ⚠️ Note: Class reassignments are permanent. If you reactivate 
   this teacher later, they will NOT automatically get their 
   classes back.
   ```

2. **Consider warning before reactivation**:
   ```
   This teacher was deactivated on [date] and had their classes 
   reassigned. Reactivation will NOT restore their previous 
   class assignments.
   ```

---

### 🟡 **IMPORTANT: Performance Issues with Large Teachers**

**The Problem:**
The `/api/users/{id}/dependencies` endpoint performs **multiple nested queries**:
- For each class → query lessons, activities, questions, submissions, enrollments
- A teacher with 100+ classes could trigger 500+ database queries
- **Potential timeout** (no timeout configured, default is ~30 seconds)

**Required Actions:**
1. **Add loading indicator** with clear message:
   ```
   Checking deletion impact... This may take a moment for 
   teachers with many classes.
   ```

2. **Add timeout handling**:
   ```javascript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec
   
   try {
     const response = await fetch(`/api/users/${id}/dependencies`, {
       signal: controller.signal,
       headers: { Authorization: token }
     });
   } catch (error) {
     if (error.name === 'AbortError') {
       showWarning('This teacher has too many classes to check quickly. Deletion may take several minutes.');
     }
   }
   ```

3. **Alternative:** Set a threshold:
   ```javascript
   if (dependencies.total_impact > 500) {
     showWarning('This deletion will affect 500+ records and may take several minutes to complete.');
   }
   ```

---

### 🟡 **IMPORTANT: List Rule Auto-Filtering**

**The Gotcha:**
The backend list rule automatically filters deleted users from **ALL queries**, including for admins.

**This means:**
```javascript
// This query will NOT return soft-deleted users (even for admins)
fetch('/api/collections/users/records')

// To show deleted users, you MUST use explicit filter:
fetch('/api/collections/users/records?filter=(deleted_at!=null)')
```

**Required Actions:**
1. **For "Show Deactivated" toggle:**
   ```javascript
   let url = '/api/collections/users/records';
   
   if (showDeactivated) {
     // Explicitly request deleted users
     url += '?filter=(deleted_at!=null)';
   } else {
     // Default query auto-filters deleted users
     // No filter needed
   }
   ```

2. **Test thoroughly** - verify this works in production

---

### 🟡 **IMPORTANT: Missing Validations**

The backend does **NOT** currently prevent:

**1. Deleting the Last Admin**
- If there's only one admin user, deleting them **locks everyone out**
- **No backend validation** for this

**Required Action:**
```javascript
// Frontend validation before delete
async function canDeleteUser(userId, userRole) {
  if (userRole === 'admin') {
    const admins = await fetch('/api/collections/users/records?filter=(role="admin")');
    if (admins.items.length <= 1) {
      showError('Cannot delete the last admin user');
      return false;
    }
  }
  return true;
}
```

**2. Admin Deleting Themselves**
- Admins can currently delete their own account
- This is usually not desired behavior

**Required Action:**
```javascript
if (userId === currentUser.id) {
  const confirm = window.confirm('Are you sure you want to delete your own account? You will be logged out immediately.');
  if (!confirm) return;
}
```

**3. Deleting Users During Active Operations**
- No check for active exams, ongoing activities, etc.

**Recommended:**
```javascript
// Add business logic checks
if (userRole === 'student') {
  // Check if student has active submissions in progress
  const activeExams = await checkActiveExams(userId);
  if (activeExams > 0) {
    showWarning(`This student is currently taking ${activeExams} exam(s). Consider waiting until completion.`);
  }
}
```

---

### 🟠 **Student Enrollment Status on Soft Delete**

**The Gotcha:**
When a student is soft-deleted:
- Their enrollments remain with status `"active"`
- When reactivated, they **automatically regain access** to all classes
- No notification to teachers/admins

**Example Scenario:**
1. Student misbehaves, admin soft-deletes their account
2. Week later, admin reactivates student
3. Student immediately has access to all their classes again
4. Teachers aren't notified

**Recommended Actions:**
1. **Add warning on soft delete:**
   ```
   ⚠️ Note: This student's class enrollments will remain active. 
   If reactivated, they will immediately regain access to all classes.
   ```

2. **Alternative:** Consider changing enrollment status:
   ```javascript
   // Optional: Update enrollments to "dropped" on soft delete
   await fetch('/api/collections/enrollments/records', {
     method: 'PATCH',
     filter: `student_id='${studentId}'`,
     body: { status: 'dropped' }
   });
   ```

---

### 🟠 **No Transaction Safety (Data Integrity Risk)**

**The Problem:**
Hard delete operations are **not wrapped in a transaction**:
- If deletion fails halfway through, you get **inconsistent data**
- Example: Deletes 3 classes, fails on 4th, teacher remains but 3 classes are gone

**Required Actions:**
1. **Add warning in UI:**
   ```
   ⚠️ Warning: If deletion fails partway through, some data 
   may be in an inconsistent state. Contact support if this occurs.
   ```

2. **Log deletion attempts:**
   ```javascript
   console.log(`Starting hard delete for user ${userId} at ${new Date()}`);
   
   try {
     await hardDeleteUser(userId);
     console.log(`Hard delete completed successfully for user ${userId}`);
   } catch (error) {
     console.error(`Hard delete FAILED for user ${userId}:`, error);
     // Alert admin to check data integrity
   }
   ```

3. **Consider requesting backend update** to add transaction support

---

### 🟠 **Dependencies Check is Incomplete**

**Current Limitations:**
The `/api/users/{id}/dependencies` endpoint only checks:
- classes, lessons, activities, questions, submissions, enrollments

**Missing from check:**
- news articles
- teacher_subjects
- teacher_classes  
- class_sections

**Required Actions:**
1. **Add disclaimer** in dependencies summary:
   ```
   Note: This summary may not include all dependencies. 
   Some additional records may prevent deletion.
   ```

2. **Handle deletion errors gracefully:**
   ```javascript
   try {
     await hardDeleteUser(userId);
   } catch (error) {
     if (error.message.includes('foreign key') || error.message.includes('constraint')) {
       showError('Deletion failed: This user has additional assignments that must be removed first. Contact support for details.');
     } else {
       showError('Deletion failed: ' + error.message);
     }
   }
   ```

---

### 🟠 **Reactivation Doesn't Restore Permissions**

**The Gotcha:**
Reactivation only sets `deleted_at = null` and `active = true`. It does **NOT** restore:
- Reassigned classes (they stay with new teacher)
- Changed enrollment statuses
- Any other data modified during/after soft delete

**Required Actions:**
1. **Clear messaging on reactivation:**
   ```
   Reactivate User: [Name]
   
   This will allow the user to log in again, but:
   • Classes reassigned to other teachers will NOT be returned
   • Any data modified after deactivation will remain as-is
   • User will have a "fresh start" with no assignments
   
   [Confirm Reactivation]
   ```

---

## 📋 Updated Implementation Checklist

### Additional Validations Required
- [ ] Check if user is last admin before allowing delete
- [ ] Warn if user is deleting themselves
- [ ] Check for active exams/submissions before student deletion
- [ ] Handle missing collections (news, teacher_subjects, etc.)

### Additional UI Warnings Required
- [ ] File attachments will be permanently lost
- [ ] Class reassignments are permanent (not reversed on reactivation)
- [ ] Active sessions may persist after soft delete
- [ ] Performance warning for large teachers (100+ classes)
- [ ] Transaction failure risk (data integrity)
- [ ] Dependencies check may be incomplete

### Additional Error Handling Required
- [ ] Handle 400 status as success for soft delete
- [ ] Handle timeout on dependencies check (30+ seconds)
- [ ] Handle foreign key constraint errors gracefully
- [ ] Log all deletion attempts for audit trail

### Additional Features to Consider
- [ ] Client-side active user check on protected routes
- [ ] Download/backup files before deletion
- [ ] Update enrollment status on student soft delete
- [ ] Activity log view for deletion history
- [ ] "Are you sure?" confirmation for self-deletion

---

## 📞 Questions or Issues?

If you encounter any issues during frontend implementation:

1. Check PocketBase logs for backend errors
2. Verify you're using the correct API endpoints and parameters
3. Ensure admin authentication token is being sent
4. Contact backend team with specific error messages
5. **Report if any edge cases listed above cause problems**

---

## 🎯 Summary

**Backend provides:**
- ✅ Two-tier deletion (soft/hard)
- ✅ Dependency checking before deletion
- ✅ Class reassignment capability
- ✅ User reactivation
- ✅ Automatic filtering of deleted users
- ✅ Auth blocking for deleted users

**Frontend needs to build:**
- ⚠️ Deletion modal UI with two options
- ⚠️ Dependencies summary display
- ⚠️ Class reassignment interface
- ⚠️ Confirmation workflow for hard delete
- ⚠️ Deactivated user display and reactivation
- ⚠️ API integrations for all endpoints

---

**Ready to hand off to frontend team!** 🚀
