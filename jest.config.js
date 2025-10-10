const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Fournit le chemin vers votre app Next.js pour charger next.config.js et .env files
  dir: './',
})

// Configuration Jest personnalisée
const customJestConfig = {
  // Fichier de setup qui s'exécute avant chaque test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Environment de test (jsdom pour simuler un navigateur)
  testEnvironment: 'jest-environment-jsdom',
  
  // Mapping de modules pour résoudre les imports
  moduleNameMapping: {
    // Alias pour les imports relatifs
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // Mock pour Mapbox GL qui ne fonctionne pas dans Jest
    '^mapbox-gl$': '<rootDir>/__mocks__/mapbox-gl.js',
    
    // Mock pour les fichiers CSS/SCSS
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Mock pour les images et autres assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Répertoires à ignorer lors des tests
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  
  // Patterns de fichiers de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Extensions de fichiers que Jest doit traiter
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transformation des fichiers
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Variables d'environnement pour les tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // Collecte de couverture de code
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Répertoire de sortie des rapports de couverture
  coverageDirectory: 'coverage',
  
  // Reporter pour les rapports de couverture
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Configuration pour les tests en parallèle
  maxWorkers: '50%',
  
  // Cache pour améliorer les performances
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Délai d'expiration des tests (en ms)
  testTimeout: 10000,
  
  // Gestion des globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
}

// Crée la configuration finale
module.exports = createJestConfig(customJestConfig)