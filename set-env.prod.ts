/// <reference types="node" />
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

// En producción Netlify ignora .env.local y usa sus propias variables
dotenv.config();

const targetPath = './src/environments/environment.prod.ts';

const environmentFileContent = `
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

writeFileSync(targetPath, environmentFileContent);
