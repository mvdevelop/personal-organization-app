import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment variable ${key} is required in production`);
    }
    return fallback || '';
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: requireEnv('MONGODB_URI', 'mongodb://localhost:27017/personal-org'),
  jwtSecret: requireEnv('JWT_SECRET', 'fallback-dev-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  openRouterKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'gpt-4o-mini',
};
