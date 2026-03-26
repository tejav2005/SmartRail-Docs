const app = require('./app');
const connectDatabase = require('./config/db');
const { env } = require('./config/env');

async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`KMRL backend running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
