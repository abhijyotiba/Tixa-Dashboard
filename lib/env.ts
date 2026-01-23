/**
 * Environment Variables Validation
 * Ensures all required environment variables are present at runtime
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

// Optional but recommended for production
const recommendedEnvVars = [
  'API_BASE_URL',
] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nPlease check your .env.local file.`
    );
  }

  // Warn about missing recommended variables (non-blocking)
  if (process.env.NODE_ENV === 'production') {
    const missingRecommended = recommendedEnvVars.filter((key) => !process.env[key]);
    if (missingRecommended.length > 0) {
      console.warn(
        `⚠️ Missing recommended environment variables:\n${missingRecommended.map((k) => `  - ${k}`).join('\n')}`
      );
    }
  }
}

// Type-safe environment variable access
export const env = {
  get supabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!;
  },
  get supabaseAnonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  },
  get apiBaseUrl(): string {
    return process.env.API_BASE_URL! ;
  },
} as const;
