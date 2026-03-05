import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

const server = await createServer({
  configFile: resolve(__dirname, 'vite.config.ts'),
  root: __dirname,
  server: { port: 5173, host: true },
});
await server.listen();
server.printUrls();
