import Constants from 'expo-constants';

const getEnvVariable = (key: string, defaultValue: string): string => {
  const extra = Constants.expirationDate ? {} : (Constants.expoConfig?.extra || {});
  return (extra as any)[key] || process.env[key] || defaultValue;
};

interface SupabaseConfig {
  url: string;
  anonKey: string;
  timeout: number;
  enableSync: boolean;
}

export const supabaseConfig: SupabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
  enableSync: (process.env.EXPO_PUBLIC_ENABLE_SYNC || 'true') === 'true',
};
