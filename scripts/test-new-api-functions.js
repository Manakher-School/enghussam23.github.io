/**
 * Test Script for New Enrollment API Functions
 * 
 * This script tests the 5 new API functions:
 * 1. fetchGrades()
 * 2. fetchSectionsByGrade()
 * 3. fetchSubjects()
 * 4. createStudentWithEnrollment()
 * 5. createTeacherWithAssignments()
 * 
 * Run: node scripts/test-new-api-functions.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Admin credentials (update these with your actual admin credentials)
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123456';

async function testFetchGrades() {
  console.log('\n📚 Testing fetchGrades()...');
  try {
    const records = await pb.collection("classes").getFullList({
      filter: "is_active=true",
      sort: "display_order",
    });

    const grades = records.map((record) => ({
      id: record.id,
      code: record.code,
      name: JSON.parse(record.name || '{"en":"","ar":""}'),
      displayOrder: record.display_order,
      isActive: record.is_active,
    }));

    console.log(`✅ Found ${grades.length} grades:`);
    grades.forEach(g => {
      console.log(`   - ${g.code}: ${g.name.en} / ${g.name.ar}`);
    });

    return grades;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

async function testFetchSections(gradeId = null) {
  console.log(`\n🏫 Testing fetchSectionsByGrade(${gradeId || 'all'})...`);
  try {
    let filter = "is_active=true";
    if (gradeId) {
      filter += ` && grade='${gradeId}'`;
    }

    const records = await pb.collection("class_sections").getFullList({
      filter,
      expand: "grade",
      sort: "name",
    });

    const sections = records.map((record) => ({
      id: record.id,
      name: record.name,
      gradeId: record.grade,
      grade: record.expand?.grade || null,
      maxStudents: record.max_students,
    }));

    console.log(`✅ Found ${sections.length} sections`);
    if (gradeId && sections.length > 0) {
      console.log(`   Sections for selected grade:`);
      sections.forEach(s => {
        console.log(`   - Section ${s.name} (max: ${s.maxStudents})`);
      });
    }

    return sections;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

async function testFetchSubjects() {
  console.log('\n📖 Testing fetchSubjects()...');
  try {
    const records = await pb.collection("courses").getFullList({
      filter: "is_active=true",
      sort: "code",
    });

    const subjects = records.map((record) => ({
      id: record.id,
      code: record.code,
      name: JSON.parse(record.name || '{"en":"","ar":""}'),
      icon: record.icon || "",
      color: record.color || "#2196F3",
    }));

    console.log(`✅ Found ${subjects.length} subjects:`);
    subjects.forEach(s => {
      console.log(`   - ${s.code}: ${s.name.en} / ${s.name.ar} ${s.icon}`);
    });

    return subjects;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

async function testCreateStudent(grades, sections) {
  console.log('\n👨‍🎓 Testing createStudentWithEnrollment()...');
  
  if (grades.length === 0 || sections.length === 0) {
    console.log('⚠️  Skipping - no grades or sections available');
    return null;
  }

  // Use first grade and its first section
  const testGrade = grades[0];
  const testSection = sections.find(s => s.gradeId === testGrade.id);

  if (!testSection) {
    console.log('⚠️  Skipping - no section found for first grade');
    return null;
  }

  const testData = {
    email: `test.student.${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'Student',
    firstNameAr: 'طالب',
    lastNameAr: 'تجريبي',
    gradeId: testGrade.id,
    sectionId: testSection.id,
    parentPhone: '+970599123456',
    dateOfBirth: '2015-01-01',
  };

  console.log(`   Creating student for: ${testGrade.name.en} - Section ${testSection.name}`);

  try {
    // Validate section belongs to grade
    const section = await pb.collection("class_sections").getOne(testData.sectionId);
    if (section.grade !== testData.gradeId) {
      throw new Error("Section validation failed");
    }

    // Create user
    const userRecord = await pb.collection("users").create({
      email: testData.email,
      password: testData.password,
      passwordConfirm: testData.password,
      role: "student",
      is_active: true,
    });

    // Create profile
    await pb.collection("user_profiles").create({
      user_id: userRecord.id,
      first_name: testData.firstName,
      last_name: testData.lastName,
      first_name_ar: testData.firstNameAr,
      last_name_ar: testData.lastNameAr,
        grade_id: testData.gradeId,
        section_id: testData.sectionId,
      parent_phone: testData.parentPhone,
      date_of_birth: testData.dateOfBirth,
      enrollment_date: new Date().toISOString().split("T")[0],
    });

    console.log(`✅ Student created successfully!`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   ID: ${userRecord.id}`);

    return userRecord;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testCreateTeacher(subjects, grades, sections) {
  console.log('\n👩‍🏫 Testing createTeacherWithAssignments()...');
  
  if (subjects.length === 0 || grades.length === 0 || sections.length === 0) {
    console.log('⚠️  Skipping - no subjects, grades, or sections available');
    return null;
  }

  // Create assignment: First subject to first two grades with all their sections
  const testSubject = subjects[0];
  const testGrade1 = grades[0];
  const testGrade2 = grades.length > 1 ? grades[1] : grades[0];
  
  const sectionsGrade1 = sections.filter(s => s.gradeId === testGrade1.id).map(s => s.id);
  const sectionsGrade2 = sections.filter(s => s.gradeId === testGrade2.id).map(s => s.id);

  const testData = {
    email: `test.teacher.${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'Teacher',
    firstNameAr: 'معلم',
    lastNameAr: 'تجريبي',
    subjectAssignments: [
      {
        subjectId: testSubject.id,
        grades: [
          {
            gradeId: testGrade1.id,
            sectionIds: sectionsGrade1,
          },
          {
            gradeId: testGrade2.id,
            sectionIds: sectionsGrade2,
          }
        ]
      }
    ]
  };

  console.log(`   Creating teacher for: ${testSubject.name.en}`);
  console.log(`   Assigning to ${testGrade1.name.en} (${sectionsGrade1.length} sections)`);
  console.log(`   Assigning to ${testGrade2.name.en} (${sectionsGrade2.length} sections)`);

  try {
    // Create user
    const userRecord = await pb.collection("users").create({
      email: testData.email,
      password: testData.password,
      passwordConfirm: testData.password,
      role: "teacher",
      is_active: true,
    });

    // Create profile
    await pb.collection("user_profiles").create({
      user_id: userRecord.id,
      first_name: testData.firstName,
      last_name: testData.lastName,
      first_name_ar: testData.firstNameAr,
      last_name_ar: testData.lastNameAr,
    });

    const results = {
      id: userRecord.id,
      email: userRecord.email,
      assignmentsCreated: 0,
      assignmentsFailed: 0,
      errors: [],
    };

    // Create subject assignment
    await pb.collection("teacher_subjects").create({
      teacher_id: userRecord.id,
      subject_id: testData.subjectAssignments[0].subjectId,
    });

    // Create class assignments
    for (const gradeAssignment of testData.subjectAssignments[0].grades) {
      for (const sectionId of gradeAssignment.sectionIds) {
        try {
          await pb.collection("teacher_classes").create({
            teacher_id: userRecord.id,
            subject_id: testData.subjectAssignments[0].subjectId,
            grade_id: gradeAssignment.gradeId,
            section_id: sectionId,
          });
          results.assignmentsCreated++;
        } catch (error) {
          results.assignmentsFailed++;
          results.errors.push(error.message);
        }
      }
    }

    console.log(`✅ Teacher created successfully!`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   ID: ${userRecord.id}`);
    console.log(`   Assignments created: ${results.assignmentsCreated}`);
    console.log(`   Assignments failed: ${results.assignmentsFailed}`);

    return results;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting API Function Tests...\n');
  console.log('⚠️  Make sure PocketBase is running on http://127.0.0.1:8090');

  try {
    // Login as admin
    console.log('\n🔐 Logging in as admin...');
    await pb.collection('users').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Logged in successfully');

    // Test 1: Fetch Grades
    const grades = await testFetchGrades();

    // Test 2: Fetch All Sections
    await testFetchSections();

    // Test 3: Fetch Sections by Grade (use first grade)
    if (grades.length > 0) {
      const sections = await testFetchSections(grades[0].id);

      // Test 4: Fetch Subjects
      const subjects = await testFetchSubjects();

      // Test 5: Create Student
      await testCreateStudent(grades, sections);

      // Test 6: Create Teacher
      await testCreateTeacher(subjects, grades, sections);
    }

    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run tests
runTests();
