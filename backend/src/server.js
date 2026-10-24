import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { startScheduler } from './jobs/scheduler.js';

const startServer = async () => {
  try {
    await connectDB();

    startScheduler();

    app.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(` AICTE Integrated Complaint Monitoring Backend running `);
      console.log(` Port: ${env.PORT} | Environment: ${env.NODE_ENV} `);
      console.log(` Health check: http://localhost:${env.PORT}/health `);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
