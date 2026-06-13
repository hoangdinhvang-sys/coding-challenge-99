function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export interface Config {
  port: number;
  databaseUrl: string;
}

export const config: Config = {
  port: parseInt(getEnv("PORT", "3000"), 10),
  databaseUrl: getEnv("DATABASE_URL"),
};

export default config;
