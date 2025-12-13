/// <reference types="node" />
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env['API_URL'] || 'https://hoopstats-backend-production.up.railway.app/api';

const envContent = `
export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  nbaApi: {
    baseUrl: '',
    headers: {}
  }
};
`;

// Genera environment.prod.ts
writeFileSync('./src/environments/environment.prod.ts', envContent);

// GENERA TAMBIÉN environment.ts (Angular lo busca SIEMPRE)
writeFileSync('./src/environments/environment.ts', envContent);
