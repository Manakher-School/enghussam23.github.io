/**
 * Quick script to reactivate admin user
 * Run with: node fix-admin-user.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function fixAdminUser() {
  try {
    console.log('🔍 Searching for admin users...');
    
    // Fetch all users with role=admin (including inactive/deleted)
    const admins = await pb.collection('users').getFullList({
      filter: 'role="admin"',
      sort: 'created',
    });

    console.log(`Found ${admins.length} admin user(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Name: ${admin.name || 'N/A'}`);
      console.log(`   Active: ${admin.active}`);
      console.log(`   Deleted At: ${admin.deleted_at || 'Not deleted'}`);
      console.log('');
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found!');
      return;
    }

    // Fix the first admin user (or you can specify which one)
    const adminToFix = admins[0];
    
    console.log(`\n🔧 Reactivating admin: ${adminToFix.email}...`);

    // Update the user to reactivate
    await pb.collection('users').update(adminToFix.id, {
      active: true,
      deleted_at: null,
    });

    console.log('✅ Admin user reactivated successfully!');
    console.log('\nYou can now login with:');
    console.log(`   Email: ${adminToFix.email}`);
    console.log(`   (use your existing password)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

fixAdminUser();
