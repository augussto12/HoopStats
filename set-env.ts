/// <reference types="node" />
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const content = `
export const environment = {
  production: false,
  apiUrl: '${process.env['API_URL']}',
  nbaApi: {
    baseUrl: '${process.env['NBA_API_URL'] ?? ''}',
    headers: {
      'x-apisports-key': '${process.env['NBA_API_KEY'] ?? ''}'
    }
  }
};
`;

writeFileSync('./src/environments/environment.ts', content);

console.log("✔ environment.ts generado (DEV)");
