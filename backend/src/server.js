import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { startScheduler } from './jobs/scheduler.js';

const startServer = async () => {
  try {
    await connectDB();

    startScheduler();

    const PORT = process.env.PORT || env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(` AICTE Integrated Complaint Monitoring Backend running `);
      console.log(` Port: ${PORT} | Environment: ${env.NODE_ENV} `);
      console.log(` Health check: /health `);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
