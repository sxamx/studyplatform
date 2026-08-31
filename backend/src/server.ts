import app from './app';
import { config } from './config/index';
import { getDb } from './database/db';

const server = app.listen(config.port, () => {
  getDb();
  console.log(`StudyPlatform API running on http://localhost:${config.port}`);
});

export default server;
