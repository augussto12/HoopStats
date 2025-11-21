/// <reference types="node" />
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

// Cargar .env.local para desarrollo
dotenv.config({ path: '.env.local' });

const targetPath = './src/environments/environment.ts';

const environmentFileContent = `
export const environment = {
  production: false,
  apiUrl: '${process.env['API_URL']}',
  nbaApi: {
    baseUrl: '${process.env['NBA_API_URL']}',
    headers: {
      'x-apisports-key': '${process.env['NBA_API_KEY']}'
    }
  }
};
`;

// Genera environment.prod.ts
writeFileSync('./src/environments/environment.prod.ts', environmentFileContent);

writeFileSync(targetPath, environmentFileContent);
