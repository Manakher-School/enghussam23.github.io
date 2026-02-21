/**
 * Bulk Section Creation Script
 * 
 * This script creates all 19 section records for the class_sections collection.
 * It fetches the grade IDs from the classes collection and creates sections accordingly.
 * 
 * Structure:
 * - KG: Section A (1 section)
 * - Grades 1-6: Sections A, B, C each (18 sections)
 * Total: 19 sections
 * 
 * Usage: 
 *   PB_ADMIN_EMAIL=your@email.com PB_ADMIN_PASSWORD=yourpass node scripts/create_sections.js
 * 
 * Or set them in .env file:
 *   PB_ADMIN_EMAIL=your@email.com
 *   PB_ADMIN_PASSWORD=yourpass
 */

import PocketBase from 'pocketbase';
import readline from 'readline';

// PocketBase configuration
const PB_URL = process.env.VITE_PB_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

// Section configuration
const SECTION_CONFIG = {
  KG: ['A'],           // KG has only Section A
  1: ['A', 'B', 'C'],  // Grade 1 has A, B, C
  2: ['A', 'B', 'C'],  // Grade 2 has A, B, C
  3: ['A', 'B', 'C'],  // Grade 3 has A, B, C
  4: ['A', 'B', 'C'],  // Grade 4 has A, B, C
  5: ['A', 'B', 'C'],  // Grade 5 has A, B, C
  6: ['A', 'B', 'C'],  // Grade 6 has A, B, C
};

// Helper function to prompt for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function getAdminCredentials() {
  let email = process.env.PB_ADMIN_EMAIL;
  let password = process.env.PB_ADMIN_PASSWORD;

  if (!email) {
    email = await prompt('Admin email: ');
  }

  if (!password) {
    password = await prompt('Admin password: ');
  }

  return { email, password };
}

async function createSections() {
  try {
    console.log('🔐 Admin authentication required...');
    const { email, password } = await getAdminCredentials();

    console.log('🔐 Authenticating as admin...');
    await pb.admins.authWithPassword(email, password);
    console.log('✅ Authenticated successfully!\n');

    console.log('📚 Fetching grades from classes collection...');
    const grades = await pb.collection('classes').getFullList({
      sort: 'display_order',
    });
    
    if (grades.length === 0) {
      console.error('❌ No grades found in classes collection!');
      console.error('Please make sure you have added the 7 grade records first.');
      process.exit(1);
    }

    console.log(`✅ Found ${grades.length} grades:`);
    grades.forEach(grade => {
      console.log(`   - ${grade.code}: ${grade.name.en || grade.name}`);
    });
    console.log('');

    // Create a map of grade code to grade ID
    const gradeMap = {};
    grades.forEach(grade => {
      gradeMap[grade.code] = grade.id;
    });

    console.log('📝 Creating sections...\n');

    let successCount = 0;
    let errorCount = 0;
    const createdSections = [];

    // Iterate through each grade and create its sections
    for (const [gradeCode, sectionNames] of Object.entries(SECTION_CONFIG)) {
      const gradeId = gradeMap[gradeCode];
      
      if (!gradeId) {
        console.warn(`⚠️  Grade ${gradeCode} not found in database, skipping...`);
        continue;
      }

      for (const sectionName of sectionNames) {
        try {
          const sectionData = {
            name: sectionName,
            grade: gradeId,
            max_students: gradeCode === 'KG' ? 25 : 30,
            is_active: true,
            // teacher field is left empty (optional)
          };

          const record = await pb.collection('class_sections').create(sectionData);
          
          createdSections.push({
            grade: gradeCode,
            section: sectionName,
            id: record.id
          });

          successCount++;
          console.log(`✅ Created: Grade ${gradeCode}, Section ${sectionName}`);
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to create Grade ${gradeCode}, Section ${sectionName}:`, error.message);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Successfully created: ${successCount} sections`);
    console.log(`❌ Failed: ${errorCount} sections`);
    console.log(`📋 Total sections in database: ${createdSections.length}`);
    console.log('');

    if (createdSections.length > 0) {
      console.log('📝 Created sections:');
      const groupedByGrade = {};
      createdSections.forEach(s => {
        if (!groupedByGrade[s.grade]) {
          groupedByGrade[s.grade] = [];
        }
        groupedByGrade[s.grade].push(s.section);
      });

      Object.keys(groupedByGrade).sort().forEach(grade => {
        console.log(`   Grade ${grade}: ${groupedByGrade[grade].join(', ')}`);
      });
    }

    console.log('\n✅ Section creation complete!');
    console.log('🎉 You can now verify the sections in PocketBase Admin UI.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure PocketBase is running on', PB_URL);
    console.error('2. Verify admin credentials are correct');
    console.error('3. Ensure the classes collection has 7 grade records');
    console.error('4. Check that class_sections collection exists');
    console.error('');
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the script
createSections();
