import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1,
    env: {
      apiUrl: 'http://localhost:8080',
      dbHost: 'localhost',
      dbPort: '5432',
      dbName: 'utro',
      dbUser: 'utro',
      dbPassword: 'utro_password',
    },
    setupNodeEvents(on, config) {
      // Database task for real E2E tests (no mocking)
      on('task', {
        'db:seed': async ({ sql }: { sql: string }) => {
          // Import pg dynamically to avoid issues if not installed
          try {
            const { Client } = await import('pg');
            const client = new Client({
              host: config.env.dbHost,
              port: config.env.dbPort,
              database: config.env.dbName,
              user: config.env.dbUser,
              password: config.env.dbPassword,
            });

            await client.connect();
            const result = await client.query(sql);
            await client.end();
            return result;
          } catch (error) {
            console.error('Database task error:', error);
            throw error;
          }
        },
      });

      return config;
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
});
