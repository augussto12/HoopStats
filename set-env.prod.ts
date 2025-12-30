const { writeFileSync } = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.production' });

const content = `
export const environment = {
  production: true,
  apiUrl: '${process.env['API_URL'] || '/api'}',
  nbaApi: {
    baseUrl: '${process.env['NBA_API_URL'] ?? ''}',
    headers: {
      'x-apisports-key': '${process.env['NBA_API_KEY'] ?? ''}'
    }
  }
};
`;

writeFileSync('./src/environments/environment.ts', content);
writeFileSync('./src/environments/environment.prod.ts', content);

console.log("✔ environment.ts + environment.prod.ts generados (PROD)");
