import { config } from './config/index.js';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './core/db/connect.js';
import { startJobs, stopJobs } from './jobs/index.js';

async function startServer() {
  try {
    await connectDatabase();
    startJobs();

    const server = app.listen(config.port, () => {
      console.log(`[api] listening on http://localhost:${config.port} (${config.nodeEnv})`);
      if (config.otp.exposeInResponse) {
        console.log(
          '[auth] DEV MODE: login OTPs are printed here and returned in the API response',
        );
      }
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[api] ${signal} received, shutting down`);
      stopJobs();
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    console.error('[api] failed to start:', err);
    process.exit(1);
  }
}

void startServer();
