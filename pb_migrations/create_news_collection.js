/**
 * PocketBase Migration: Create News Collection
 * 
 * This migration creates a 'news' collection with bilingual support
 * for the Al-Manakhir School platform.
 * 
 * Usage:
 * 1. Copy this file to your PocketBase directory: pb_migrations/
 * 2. Restart PocketBase - it will auto-apply the migration
 * 
 * Or apply manually via PocketBase Admin UI:
 * - Go to Settings > Collections > New Collection
 * - Use this as a reference for field structure
 */

migrate((db) => {
  const collection = new Collection({
    name: "news",
    type: "base",
    system: false,
    schema: [
      // Bilingual Title - JSON field
      {
        name: "title",
        type: "json",
        required: true,
        options: {
          maxSize: 1000
        }
      },
      
      // Bilingual Content - JSON field
      {
        name: "content",
        type: "json",
        required: true,
        options: {
          maxSize: 10000
        }
      },
      
      // Short Excerpt - Text field
      {
        name: "excerpt",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 500
        }
      },
      
      // News Image - File field
      {
        name: "image",
        type: "file",
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880, // 5MB
          mimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/svg+xml"
          ],
          thumbs: [
            "100x100",
            "300x300",
            "600x600"
          ]
        }
      },
      
      // Category - Select field
      {
        name: "category",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: [
            "General",
            "Exams",
            "Events",
            "Urgent"
          ]
        }
      },
      
      // Published Status - Bool field
      {
        name: "is_published",
        type: "bool",
        required: true,
        options: {}
      },
      
      // Grade Filter (optional) - Text field
      {
        name: "grade",
        type: "text",
        required: false,
        options: {
          min: 0,
          max: 50
        }
      },
      
      // Important Flag - Bool field
      {
        name: "important",
        type: "bool",
        required: false,
        options: {}
      }
    ],
    
    // List Rule: Public can read published news
    listRule: "is_published = true",
    
    // View Rule: Public can view published news
    viewRule: "is_published = true",
    
    // Create Rule: Only authenticated users (teachers/admins)
    createRule: "@request.auth.id != ''",
    
    // Update Rule: Only authenticated users (teachers/admins)
    updateRule: "@request.auth.id != ''",
    
    // Delete Rule: Only authenticated users (teachers/admins)
    deleteRule: "@request.auth.id != ''",
    
    // Options
    options: {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  // Rollback: delete the collection
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("news");
  
  return dao.deleteCollection(collection);
});
