import { createApp } from './app.js';
import { assertConfig, loadConfig } from './config.js';
import { openDb } from './db.js';

const config = loadConfig();
try {
  assertConfig(config);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const db = openDb(config.dbFile);
const server = createApp({ config, db }).listen(config.port, () => {
  console.log(`Magic Pizza API em http://localhost:${config.port}`);
  if (!config.managerPassword) console.warn('Aviso: MANAGER_PASSWORD vazio, a aba Gestão está desativada.');
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
