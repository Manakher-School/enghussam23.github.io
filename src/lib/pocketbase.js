import PocketBase from "pocketbase";

/**
 * PocketBase Instance
 *
 * This is the central PocketBase client used throughout the app.
 *
 * BASE_URL:
 * - Development: http://127.0.0.1:8090
 * - Production: Update with your production PocketBase URL
 */
export const pb = new PocketBase("http://127.0.0.1:8090");
