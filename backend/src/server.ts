import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start(): Promise<void> {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`🚀 Server running at http://localhost:${env.port}`);
    console.log(`📚 API docs at http://localhost:${env.port}/api-docs`);
    console.log(`🏥 Health check at http://localhost:${env.port}/health`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
