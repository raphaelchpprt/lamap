// Setup pour Jest - Configuration globale des tests

// Import des utilitaires de test
import '@testing-library/jest-dom';

// Mock global pour window.matchMedia (nécessaire pour certains composants)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock pour IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock pour ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock pour l'API Geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation((success) =>
    Promise.resolve(
      success({
        coords: {
          latitude: 46.603354, // Coordonnées de la France (centre approximatif)
          longitude: 1.888334,
          accuracy: 1000,
        },
      })
    )
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
});

// Mock pour fetch (pour les appels API)
global.fetch = jest.fn();

// Variables d'environnement pour les tests
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test_token_for_jest';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test_anon_key';

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();

  // Reset fetch mock
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});

// Configuration des timeouts pour les tests async
jest.setTimeout(10000);

// Mock console.error pour capturer les erreurs React
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
