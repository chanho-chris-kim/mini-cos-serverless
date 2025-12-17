// backend/src/config/env.ts
import dotenv from "dotenv";

// Load environment variables from .env once at startup
dotenv.config();

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    // You can choose to throw instead of warn if you want hard failure
    console.warn(`[config] Missing required env var: ${key}`);
    return "";
  }
  return value;
};

export const INTEGRATION_TOKEN = required("INTEGRATION_TOKEN");

// If you want to consolidate JWT here later, you can:
// export const JWT_SECRET = required("JWT_SECRET", "dev-mini-cos-secret");
