/// <reference types="node" />
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

// Usa .env.production si existe, si no usa variables del sistema
dotenv.config({ path: '.env.production' });

const content = `
export const environment = {
  production: true,
  apiUrl: '${process.env['API_URL']}',
  nbaApi: {
    baseUrl: '${process.env['NBA_API_URL'] ?? ''}',
    headers: {
      'x-apisports-key': '${process.env['NBA_API_KEY'] ?? ''}'
    }
  }
};
`;

writeFileSync('./src/environments/environment.prod.ts', content);

console.log("✔ environment.prod.ts generado (PROD)");
