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
  url: getEnvVariable('SUPABASE_URL', ''),
  anonKey: getEnvVariable('SUPABASE_ANON_KEY', ''),
  timeout: parseInt(getEnvVariable('API_TIMEOUT', '10000'), 10),
  enableSync: getEnvVariable('ENABLE_SYNC', 'true') === 'true',
};
