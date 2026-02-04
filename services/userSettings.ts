/**
 * User Settings Service
 * Manages user-specific settings stored in Supabase user metadata
 */
import { createClient } from '@/utils/supabase/client';

export interface UserSettings {
  agent_console_url?: string;
  // Add more settings here as needed
}

/**
 * Get user settings from Supabase user metadata
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('Failed to get user:', error);
    return null;
  }
  
  // Settings are stored in user_metadata
  return (user.user_metadata?.settings as UserSettings) || {};
}

/**
 * Update user settings in Supabase user metadata
 */
export async function updateUserSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // First get current settings
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();
  
  if (getUserError || !user) {
    return { success: false, error: 'Failed to get current user' };
  }
  
  // Merge with existing settings
  const currentSettings = (user.user_metadata?.settings as UserSettings) || {};
  const newSettings = { ...currentSettings, ...settings };
  
  // Update user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      settings: newSettings
    }
  });
  
  if (updateError) {
    console.error('Failed to update settings:', updateError);
    return { success: false, error: updateError.message };
  }
  
  return { success: true };
}

/**
 * Get Agent Console URL for the current user
 */
export async function getAgentConsoleUrl(): Promise<string | null> {
  const settings = await getUserSettings();
  return settings?.agent_console_url || null;
}

/**
 * Set Agent Console URL for the current user
 */
export async function setAgentConsoleUrl(url: string): Promise<{ success: boolean; error?: string }> {
  // Basic URL validation
  if (url && !isValidUrl(url)) {
    return { success: false, error: 'Invalid URL format' };
  }
  
  return updateUserSettings({ agent_console_url: url });
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
