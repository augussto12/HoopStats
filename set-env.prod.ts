/// <reference types="node" />
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

// Cargar las env de Netlify
dotenv.config();

const envContent = `
export const environment = {
  production: true,
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
writeFileSync('./src/environments/environment.prod.ts', envContent);

// GENERA TAMBIÉN environment.ts (Angular lo busca SIEMPRE)
writeFileSync('./src/environments/environment.ts', envContent);
