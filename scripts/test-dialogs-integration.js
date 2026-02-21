/**
 * Integration Test for Student and Teacher Creation Dialogs
 * 
 * This script tests:
 * 1. API functions work correctly
 * 2. Student creation with grade/section enrollment
 * 3. Teacher creation with subject assignments
 * 4. Database records are created properly
 * 
 * Usage: node scripts/test-dialogs-integration.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// Test data
const testStudent = {
  email: `test.student.${Date.now()}@school.com`,
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'Student',
  firstNameAr: 'طالب',
  lastNameAr: 'تجريبي',
  parentPhone: '+966501234567',
  dateOfBirth: '2015-01-15',
};

const testTeacher = {
  email: `test.teacher.${Date.now()}@school.com`,
  password: 'TeacherPass123!',
  firstName: 'Test',
  lastName: 'Teacher',
  firstNameAr: 'معلم',
  lastNameAr: 'تجريبي',
};

async function authenticateAdmin() {
  section('🔐 Authenticating as Admin');
  try {
    await pb.collection('users').authWithPassword('admin@admin.com', 'adminadmin');
    log('✓ Admin authenticated successfully', 'green');
    return true;
  } catch (error) {
    log(`✗ Authentication failed: ${error.message}`, 'red');
    return false;
  }
}

async function testFetchGrades() {
  section('📚 Test 1: Fetch Grades');
  try {
    const grades = await pb.collection('classes').getFullList({
      sort: 'name',
    });
    
    log(`✓ Fetched ${grades.length} grades`, 'green');
    grades.forEach(grade => {
      const name = JSON.parse(grade.name);
      log(`  - ${grade.id}: ${name.en} / ${name.ar}`, 'cyan');
    });
    
    return grades;
  } catch (error) {
    log(`✗ Failed to fetch grades: ${error.message}`, 'red');
    return null;
  }
}

async function testFetchSections(gradeId) {
  section(`📋 Test 2: Fetch Sections for Grade ${gradeId}`);
  try {
    const sections = await pb.collection('class_sections').getFullList({
      filter: `class_id = "${gradeId}"`,
      sort: 'name',
    });
    
    log(`✓ Fetched ${sections.length} sections`, 'green');
    sections.forEach(section => {
      const name = JSON.parse(section.name);
      log(`  - ${section.id}: ${name.en} / ${name.ar}`, 'cyan');
    });
    
    return sections;
  } catch (error) {
    log(`✗ Failed to fetch sections: ${error.message}`, 'red');
    return null;
  }
}

async function testFetchSubjects() {
  section('📖 Test 3: Fetch Subjects');
  try {
    const subjects = await pb.collection('courses').getFullList({
      sort: 'created',
    });
    
    log(`✓ Fetched ${subjects.length} subjects`, 'green');
    subjects.forEach(subject => {
      const name = JSON.parse(subject.name);
      log(`  - ${subject.id}: ${name.en} / ${name.ar}`, 'cyan');
    });
    
    return subjects;
  } catch (error) {
    log(`✗ Failed to fetch subjects: ${error.message}`, 'red');
    return null;
  }
}

async function testCreateStudent(gradeId, sectionId) {
  section('👨‍🎓 Test 4: Create Student with Enrollment');
  
  const studentData = {
    ...testStudent,
    gradeId,
    sectionId,
  };
  
  log(`Creating student: ${studentData.email}`, 'cyan');
  log(`  Name (EN): ${studentData.firstName} ${studentData.lastName}`, 'cyan');
  log(`  Name (AR): ${studentData.firstNameAr} ${studentData.lastNameAr}`, 'cyan');
  log(`  Grade: ${gradeId}`, 'cyan');
  log(`  Section: ${sectionId}`, 'cyan');
  
  try {
    // Step 1: Create user
    log('\n  Step 1: Creating user account...', 'yellow');
    const user = await pb.collection('users').create({
      email: studentData.email,
      password: studentData.password,
      passwordConfirm: studentData.password,
      role: 'student',
      name: `${studentData.firstName} ${studentData.lastName}`,
    });
    log(`  ✓ User created: ${user.id}`, 'green');
    
    // Step 2: Create profile with grade/section
    log('  Step 2: Creating profile with grade/section...', 'yellow');
    const profile = await pb.collection('user_profiles').create({
      user_id: user.id,
      first_name: studentData.firstName,
      last_name: studentData.lastName,
      first_name_ar: studentData.firstNameAr,
      last_name_ar: studentData.lastNameAr,
      grade_id: studentData.gradeId,
      section_id: studentData.sectionId,
      parent_phone: studentData.parentPhone || '',
      date_of_birth: studentData.dateOfBirth || '',
    });
    log(`  ✓ Profile created: ${profile.id}`, 'green');
    
    log('\n✓ Student created successfully!', 'green');
    log(`  User ID: ${user.id}`, 'cyan');
    log(`  Profile ID: ${profile.id}`, 'cyan');
    
    return { user, profile };
  } catch (error) {
    log(`\n✗ Failed to create student: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`  Error details: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return null;
  }
}

async function testCreateTeacher(subjectId, gradeId, sectionId) {
  section('👨‍🏫 Test 5: Create Teacher with Subject Assignments');
  
  const teacherData = testTeacher;
  
  log(`Creating teacher: ${teacherData.email}`, 'cyan');
  log(`  Name (EN): ${teacherData.firstName} ${teacherData.lastName}`, 'cyan');
  log(`  Name (AR): ${teacherData.firstNameAr} ${teacherData.lastNameAr}`, 'cyan');
  log(`  Subject: ${subjectId}`, 'cyan');
  log(`  Grade: ${gradeId}`, 'cyan');
  log(`  Section: ${sectionId}`, 'cyan');
  
  try {
    // Step 1: Create user
    log('\n  Step 1: Creating user account...', 'yellow');
    const user = await pb.collection('users').create({
      email: teacherData.email,
      password: teacherData.password,
      passwordConfirm: teacherData.password,
      role: 'teacher',
      name: `${teacherData.firstName} ${teacherData.lastName}`,
    });
    log(`  ✓ User created: ${user.id}`, 'green');
    
    // Step 2: Create profile
    log('  Step 2: Creating profile...', 'yellow');
    const profile = await pb.collection('user_profiles').create({
      user_id: user.id,
      first_name: teacherData.firstName,
      last_name: teacherData.lastName,
      first_name_ar: teacherData.firstNameAr,
      last_name_ar: teacherData.lastNameAr,
    });
    log(`  ✓ Profile created: ${profile.id}`, 'green');
    
    // Step 3: Create teacher_subjects record
    log('  Step 3: Assigning subject to teacher...', 'yellow');
    const teacherSubject = await pb.collection('teacher_subjects').create({
      teacher_id: user.id,
      subject_id: subjectId,
    });
    log(`  ✓ Subject assigned: ${teacherSubject.id}`, 'green');
    
    // Step 4: Create teacher_classes record
    log('  Step 4: Assigning teacher to grade/section...', 'yellow');
    const teacherClass = await pb.collection('teacher_classes').create({
      teacher_id: user.id,
      subject_id: subjectId,
      class_id: gradeId,
      section_id: sectionId,
    });
    log(`  ✓ Class assignment created: ${teacherClass.id}`, 'green');
    
    log('\n✓ Teacher created successfully!', 'green');
    log(`  User ID: ${user.id}`, 'cyan');
    log(`  Profile ID: ${profile.id}`, 'cyan');
    log(`  Teacher-Subject ID: ${teacherSubject.id}`, 'cyan');
    log(`  Teacher-Class ID: ${teacherClass.id}`, 'cyan');
    
    return { user, profile, teacherSubject, teacherClass };
  } catch (error) {
    log(`\n✗ Failed to create teacher: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`  Error details: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return null;
  }
}

async function verifyStudentData(userId) {
  section('🔍 Verifying Student Data');
  
  try {
    // Fetch user
    const user = await pb.collection('users').getOne(userId);
    log(`✓ User found: ${user.email}`, 'green');
    log(`  Role: ${user.role}`, 'cyan');
    log(`  Name: ${user.name}`, 'cyan');
    
    // Fetch profile
    const profile = await pb.collection('user_profiles').getFirstListItem(
      `user_id = "${userId}"`,
      { expand: 'grade_id,section_id' }
    );
    log(`✓ Profile found: ${profile.id}`, 'green');
    log(`  Name (EN): ${profile.first_name} ${profile.last_name}`, 'cyan');
    log(`  Name (AR): ${profile.first_name_ar} ${profile.last_name_ar}`, 'cyan');
    
    if (profile.expand?.grade_id) {
      const gradeName = JSON.parse(profile.expand.grade_id.name);
      log(`  Grade: ${gradeName.en} / ${gradeName.ar}`, 'cyan');
    }
    
    if (profile.expand?.section_id) {
      const sectionName = JSON.parse(profile.expand.section_id.name);
      log(`  Section: ${sectionName.en} / ${sectionName.ar}`, 'cyan');
    }
    
    return true;
  } catch (error) {
    log(`✗ Verification failed: ${error.message}`, 'red');
    return false;
  }
}

async function verifyTeacherData(userId) {
  section('🔍 Verifying Teacher Data');
  
  try {
    // Fetch user
    const user = await pb.collection('users').getOne(userId);
    log(`✓ User found: ${user.email}`, 'green');
    log(`  Role: ${user.role}`, 'cyan');
    
    // Fetch profile
    const profile = await pb.collection('user_profiles').getFirstListItem(
      `user_id = "${userId}"`
    );
    log(`✓ Profile found: ${profile.id}`, 'green');
    log(`  Name (EN): ${profile.first_name} ${profile.last_name}`, 'cyan');
    log(`  Name (AR): ${profile.first_name_ar} ${profile.last_name_ar}`, 'cyan');
    
    // Fetch subject assignments
    const subjects = await pb.collection('teacher_subjects').getFullList({
      filter: `teacher_id = "${userId}"`,
      expand: 'subject_id',
    });
    log(`✓ Subject assignments: ${subjects.length}`, 'green');
    subjects.forEach(s => {
      if (s.expand?.subject_id) {
        const name = JSON.parse(s.expand.subject_id.name);
        log(`  - ${name.en} / ${name.ar}`, 'cyan');
      }
    });
    
    // Fetch class assignments
    const classes = await pb.collection('teacher_classes').getFullList({
      filter: `teacher_id = "${userId}"`,
      expand: 'subject_id,class_id,section_id',
    });
    log(`✓ Class assignments: ${classes.length}`, 'green');
    classes.forEach(c => {
      const subject = c.expand?.subject_id ? JSON.parse(c.expand.subject_id.name).en : 'Unknown';
      const grade = c.expand?.class_id ? JSON.parse(c.expand.class_id.name).en : 'Unknown';
      const section = c.expand?.section_id ? JSON.parse(c.expand.section_id.name).en : 'Unknown';
      log(`  - ${subject} to ${grade} ${section}`, 'cyan');
    });
    
    return true;
  } catch (error) {
    log(`✗ Verification failed: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🚀 Starting Integration Tests for Student/Teacher Creation', 'bright');
  log('=' .repeat(60) + '\n');
  
  // Authenticate
  const authenticated = await authenticateAdmin();
  if (!authenticated) {
    log('\n❌ Tests aborted: Authentication failed', 'red');
    return;
  }
  
  // Test 1: Fetch grades
  const grades = await testFetchGrades();
  if (!grades || grades.length === 0) {
    log('\n❌ Tests aborted: No grades found', 'red');
    return;
  }
  
  // Test 2: Fetch sections for first grade
  const firstGrade = grades[0];
  const sections = await testFetchSections(firstGrade.id);
  if (!sections || sections.length === 0) {
    log('\n❌ Tests aborted: No sections found', 'red');
    return;
  }
  
  // Test 3: Fetch subjects
  const subjects = await testFetchSubjects();
  if (!subjects || subjects.length === 0) {
    log('\n❌ Tests aborted: No subjects found', 'red');
    return;
  }
  
  // Test 4: Create student
  const firstSection = sections[0];
  const studentResult = await testCreateStudent(firstGrade.id, firstSection.id);
  if (!studentResult) {
    log('\n⚠️  Student creation failed, but continuing tests...', 'yellow');
  } else {
    await verifyStudentData(studentResult.user.id);
  }
  
  // Test 5: Create teacher
  const firstSubject = subjects[0];
  const teacherResult = await testCreateTeacher(firstSubject.id, firstGrade.id, firstSection.id);
  if (!teacherResult) {
    log('\n⚠️  Teacher creation failed', 'yellow');
  } else {
    await verifyTeacherData(teacherResult.user.id);
  }
  
  // Summary
  section('📊 Test Summary');
  log(`✓ Grades fetch: ${grades ? 'PASS' : 'FAIL'}`, grades ? 'green' : 'red');
  log(`✓ Sections fetch: ${sections ? 'PASS' : 'FAIL'}`, sections ? 'green' : 'red');
  log(`✓ Subjects fetch: ${subjects ? 'PASS' : 'FAIL'}`, subjects ? 'green' : 'red');
  log(`✓ Student creation: ${studentResult ? 'PASS' : 'FAIL'}`, studentResult ? 'green' : 'red');
  log(`✓ Teacher creation: ${teacherResult ? 'PASS' : 'FAIL'}`, teacherResult ? 'green' : 'red');
  
  const allPassed = grades && sections && subjects && studentResult && teacherResult;
  
  if (allPassed) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
  }
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
