import path from 'node:path';
import { defineConfig, env } from 'prisma/config';
import { config } from 'dotenv';
import { existsSync } from 'fs';

// Charger .env.local en priorité, sinon .env
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
});
