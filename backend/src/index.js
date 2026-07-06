import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

const start = async () => {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Stop the other process and retry.`);
    } else {
      console.error('Server error:', error);
    }

    process.exit(1);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
