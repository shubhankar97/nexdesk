import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

const start = async () => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
