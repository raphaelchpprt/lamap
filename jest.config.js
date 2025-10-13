const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provides path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Custom Jest configuration
const customJestConfig = {
  // Setup file that runs before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment (jsdom to simulate browser)
  testEnvironment: 'jest-environment-jsdom',

  // Module mapping to resolve imports
  moduleNameMapper: {
    // Alias for relative imports
    '^@/(.*)$': '<rootDir>/src/$1',

    // Mock for Mapbox GL which doesn't work in Jest
    '^mapbox-gl$': '<rootDir>/__mocks__/mapbox-gl.js',

    // Mock for Supabase
    '^@supabase/ssr$': '<rootDir>/__mocks__/@supabase/ssr.js',

    // Mock for Next.js cache
    '^next/cache$': '<rootDir>/__mocks__/next/cache.js',

    // Mock for CSS/SCSS files
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Mock for images and other assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  // Directories to ignore during tests
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // File extensions Jest should process
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // File transformation
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Environment variables for tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Code coverage collection
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage reports output directory
  coverageDirectory: 'coverage',

  // Reporters for coverage reports
  coverageReporters: ['text', 'lcov', 'html'],

  // Configuration for parallel tests
  maxWorkers: '50%',

  // Cache to improve performance
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Test timeout (in ms)
  testTimeout: 10000,

  // Exclude non-test files
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup/', '.d.ts$'],

  // Globals handling
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};

// Create final configuration
module.exports = createJestConfig(customJestConfig);
