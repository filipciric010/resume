// Safe environment variable access for production builds
export const getEnvVar = (key: string, fallback: string = ''): string => {
  try {
    return (import.meta.env as any)?.[key] || fallback;
  } catch {
    return fallback;
  }
};

export const isDemoMode = (): boolean => {
  return getEnvVar('VITE_DEMO') === 'true';
};

export const isProdMode = (): boolean => {
  return getEnvVar('PROD') === 'true' || getEnvVar('MODE') === 'production';
};
