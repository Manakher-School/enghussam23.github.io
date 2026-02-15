/**
 * Quick test script to verify PocketBase backend connection
 * Run with: node test-backend-connection.js
 */

const BASE_URL = "http://127.0.0.1:8090";

async function testConnection() {
  console.log("🔍 Testing PocketBase Backend Connection...\n");

  try {
    // Test 1: Health check
    console.log("1️⃣  Testing health endpoint...");
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Backend is healthy:", healthData.message);

    // Test 2: Check collections
    console.log("\n2️⃣  Checking available collections...");
    try {
      const collectionsResponse = await fetch(`${BASE_URL}/api/collections`);
      const collectionsData = await collectionsResponse.json();

      if (collectionsData.code === 401) {
        console.log(
          "⚠️  Collections endpoint requires admin auth (this is normal)",
        );
        console.log("   Your backend is properly secured.");
      } else {
        console.log("✅ Collections available:", collectionsData.length || 0);
      }
    } catch (err) {
      console.log("⚠️  Collections endpoint check skipped (requires auth)");
    }

    // Test 3: Try to fetch news (public data)
    console.log("\n3️⃣  Testing news collection (public data)...");
    try {
      const newsResponse = await fetch(
        `${BASE_URL}/api/collections/news/records?perPage=1`,
      );
      const newsData = await newsResponse.json();

      if (newsResponse.ok) {
        console.log("✅ News collection exists!");
        console.log("   Total items:", newsData.totalItems || 0);
        if (newsData.items && newsData.items.length > 0) {
          console.log("   Sample item:", newsData.items[0]);
        } else {
          console.log("   No news items found (empty collection)");
        }
      } else if (newsData.code === 404) {
        console.log("❌ News collection not found");
        console.log(
          "   You need to create the collections in PocketBase admin panel",
        );
        console.log("   See: POCKETBASE_SCHEMA.md for schema details");
      } else {
        console.log("⚠️  Response:", newsData);
      }
    } catch (err) {
      console.log("❌ Failed to fetch news:", err.message);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY:");
    console.log("=".repeat(60));
    console.log("Backend URL:", BASE_URL);
    console.log("Status: Running ✅");
    console.log("\nNext Steps:");
    console.log(
      "1. Create collections in PocketBase admin: " + BASE_URL + "/_/",
    );
    console.log("2. Follow POCKETBASE_SCHEMA.md to set up all collections");
    console.log("3. Add sample data for testing");
    console.log("4. Configure API rules for public access");
  } catch (error) {
    console.log("❌ Connection failed!");
    console.log("Error:", error.message);
    console.log("\nMake sure:");
    console.log("- PocketBase server is running on", BASE_URL);
    console.log("- Run: ./pocketbase serve");
    process.exit(1);
  }
}

testConnection();
