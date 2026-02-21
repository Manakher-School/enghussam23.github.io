/**
 * Alternative: Simple REST API approach to create sections
 * This generates curl commands you can run manually
 */

// Section data to create
const SECTION_CONFIG = {
  KG: ['A'],
  1: ['A', 'B', 'C'],
  2: ['A', 'B', 'C'],
  3: ['A', 'B', 'C'],
  4: ['A', 'B', 'C'],
  5: ['A', 'B', 'C'],
  6: ['A', 'B', 'C'],
};

console.log('='.repeat(60));
console.log('MANUAL SECTION CREATION GUIDE');
console.log('='.repeat(60));
console.log('\nFollow these steps:\n');

console.log('Step 1: Get Grade IDs from PocketBase Admin UI');
console.log('  - Open PocketBase Admin UI: http://127.0.0.1:8090/_/');
console.log('  - Go to Collections → classes');
console.log('  - Copy the ID for each grade (click on record to see ID)');
console.log('\nStep 2: Create sections in class_sections collection');
console.log('  - Go to Collections → class_sections');
console.log('  - Click "New record" for each section below:\n');

let sectionNum = 1;
for (const [gradeCode, sectionNames] of Object.entries(SECTION_CONFIG)) {
  console.log(`\n--- Grade ${gradeCode} Sections ---`);
  for (const sectionName of sectionNames) {
    console.log(`\nSection ${sectionNum}:`);
    console.log(`  name: ${sectionName}`);
    console.log(`  grade: (Select "${gradeCode}" from dropdown)`);
    console.log(`  max_students: ${gradeCode === 'KG' ? 25 : 30}`);
    console.log(`  is_active: true`);
    console.log(`  teacher: (leave empty)`);
    sectionNum++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`Total sections to create: ${sectionNum - 1}`);
console.log('='.repeat(60));
