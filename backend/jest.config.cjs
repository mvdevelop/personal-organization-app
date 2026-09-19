/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/tests'],
  // Only run unit tests by default; integration tests require "--testPathPattern int"
  testMatch: ['**/?(*.)+(spec|test).ts', '!**/?(*.)+(int.test).ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  // Map .js imports to their TypeScript source files
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts',
    '!src/config/db.ts',
    '!src/models/**/*',
    '!src/validators/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 15000,
};
