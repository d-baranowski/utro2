#!/usr/bin/env node

/**
 * Test Data Setup Script for Newman API Tests
 * 
 * This script sets up and tears down test data to ensure isolated API tests.
 * It can be run before test suites to prepare consistent test data.
 */

const fs = require('fs');
const path = require('path');

// Default configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
  environment: process.env.TEST_ENV || 'local',
  cleanupOnExit: process.env.CLEANUP_ON_EXIT !== 'false',
  verbose: process.env.VERBOSE === 'true'
};

class TestDataSetup {
  constructor(options = {}) {
    this.config = { ...config, ...options };
    this.testUsers = [];
    this.testOrganisations = [];
    this.authTokens = {};
    
    if (this.config.cleanupOnExit) {
      process.on('exit', () => this.cleanup());
      process.on('SIGINT', () => {
        console.log('\nReceived SIGINT, cleaning up...');
        this.cleanup();
        process.exit(0);
      });
    }
  }

  log(message) {
    if (this.config.verbose) {
      console.log(`[TestDataSetup] ${message}`);
    }
  }

  async makeRequest(method, endpoint, body = null, headers = {}) {
    const fetch = (await import('node-fetch')).default;
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    this.log(`${method} ${url} ${body ? JSON.stringify(body) : ''}`);

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }
      
      return { status: response.status, data };
    } catch (error) {
      this.log(`Request failed: ${error.message}`);
      throw error;
    }
  }

  async createTestUser(username, password = 'testpassword123', email = null) {
    if (!email) {
      email = `${username}@test.example.com`;
    }

    try {
      const response = await this.makeRequest('POST', '/api/test/users', {
        username,
        password,
        email
      });

      const user = {
        username,
        password,
        email,
        userId: response.data.userId
      };

      this.testUsers.push(user);
      this.log(`Created test user: ${username}`);
      return user;
    } catch (error) {
      // User might already exist, try to get auth token anyway
      this.log(`Failed to create user ${username}: ${error.message}`);
      return { username, password, email };
    }
  }

  async loginUser(username, password) {
    try {
      const response = await this.makeRequest('POST', '/login', {
        username,
        password
      });

      this.authTokens[username] = response.data.token;
      this.log(`Logged in user: ${username}`);
      return response.data.token;
    } catch (error) {
      this.log(`Failed to login user ${username}: ${error.message}`);
      throw error;
    }
  }

  async createTestOrganisation(username, orgName, description = 'Test organisation') {
    const token = this.authTokens[username];
    if (!token) {
      throw new Error(`No auth token found for user: ${username}`);
    }

    try {
      const response = await this.makeRequest(
        'POST',
        '/com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/CreateOrganisation',
        {
          name: orgName,
          description,
          website: 'https://test.example.com',
          phoneNumber: '+1234567890'
        },
        { 'Authorization': `Bearer ${token}` }
      );

      const org = {
        id: response.data.organisation.id,
        name: orgName,
        description,
        createdBy: username
      };

      this.testOrganisations.push(org);
      this.log(`Created test organisation: ${orgName}`);
      return org;
    } catch (error) {
      this.log(`Failed to create organisation ${orgName}: ${error.message}`);
      throw error;
    }
  }

  async setupStandardTestData() {
    console.log('Setting up standard test data...');

    // Create test users
    const timestamp = Date.now();
    const users = [
      await this.createTestUser(`testuser_${timestamp}_1`),
      await this.createTestUser(`testuser_${timestamp}_2`),
      await this.createTestUser(`orgadmin_${timestamp}`)
    ];

    // Login users
    for (const user of users) {
      await this.loginUser(user.username, user.password);
    }

    // Create test organisations
    const orgAdmin = users[2];
    await this.createTestOrganisation(
      orgAdmin.username,
      `Test Org ${timestamp}`,
      'Standard test organisation for API testing'
    );

    console.log('Standard test data setup complete');
    return {
      users: this.testUsers,
      organisations: this.testOrganisations,
      tokens: this.authTokens
    };
  }

  async cleanup() {
    console.log('Cleaning up test data...');

    // Delete test organisations (if API supports it)
    for (const org of this.testOrganisations) {
      this.log(`Skipping organisation cleanup: ${org.name} (no delete API)`);
    }

    // Delete test users
    for (const user of this.testUsers) {
      try {
        await this.makeRequest('DELETE', `/api/test/users/${user.username}`);
        this.log(`Deleted test user: ${user.username}`);
      } catch (error) {
        this.log(`Failed to delete user ${user.username}: ${error.message}`);
      }
    }

    console.log('Cleanup complete');
  }

  saveToEnvironment(envFile = 'environments/test-data.json') {
    const envPath = path.join(__dirname, envFile);
    const envData = {
      id: "test-data-env",
      name: "Test Data Environment",
      values: [
        {
          key: "baseUrl",
          value: this.config.baseUrl,
          type: "default",
          enabled: true
        }
      ]
    };

    // Add auth tokens
    Object.entries(this.authTokens).forEach(([username, token], index) => {
      envData.values.push({
        key: `testUser${index + 1}Token`,
        value: token,
        type: "secret",
        enabled: true
      });
      envData.values.push({
        key: `testUser${index + 1}Username`,
        value: username,
        type: "default",
        enabled: true
      });
    });

    // Add test users
    this.testUsers.forEach((user, index) => {
      envData.values.push({
        key: `testUser${index + 1}Password`,
        value: user.password,
        type: "secret",
        enabled: true
      });
      envData.values.push({
        key: `testUser${index + 1}Email`,
        value: user.email,
        type: "default",
        enabled: true
      });
    });

    // Add test organisations
    this.testOrganisations.forEach((org, index) => {
      envData.values.push({
        key: `testOrg${index + 1}Id`,
        value: org.id,
        type: "default",
        enabled: true
      });
      envData.values.push({
        key: `testOrg${index + 1}Name`,
        value: org.name,
        type: "default",
        enabled: true
      });
    });

    fs.writeFileSync(envPath, JSON.stringify(envData, null, 2));
    console.log(`Test data saved to ${envPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const action = args[0] || 'setup';

  const setup = new TestDataSetup({
    baseUrl: args.find(arg => arg.startsWith('--base-url='))?.split('=')[1],
    environment: args.find(arg => arg.startsWith('--env='))?.split('=')[1],
    verbose: args.includes('--verbose'),
    cleanupOnExit: !args.includes('--no-cleanup')
  });

  switch (action) {
    case 'setup':
      setup.setupStandardTestData()
        .then(data => {
          console.log('Test data setup completed');
          setup.saveToEnvironment();
          if (!setup.config.cleanupOnExit) {
            console.log('Run with "cleanup" action to remove test data');
          }
        })
        .catch(error => {
          console.error('Test data setup failed:', error.message);
          process.exit(1);
        });
      break;
    
    case 'cleanup':
      setup.cleanup()
        .then(() => {
          console.log('Cleanup completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('Cleanup failed:', error.message);
          process.exit(1);
        });
      break;
    
    default:
      console.log(`Usage: node setup-test-data.js [setup|cleanup] [--base-url=URL] [--env=ENV] [--verbose] [--no-cleanup]`);
      process.exit(1);
  }
}

module.exports = TestDataSetup;