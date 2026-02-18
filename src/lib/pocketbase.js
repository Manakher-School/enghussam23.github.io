import PocketBase from "pocketbase";

/**
 * PocketBase Instance
 *
 * BASE_URL is configured via environment variable:
 * - Development: set VITE_PB_URL in .env (defaults to http://127.0.0.1:8090)
 * - Production: set VITE_PB_URL in .env.production
 */
const PB_URL = import.meta.env.VITE_PB_URL || "http://127.0.0.1:8090";

export const pb = new PocketBase(PB_URL);
