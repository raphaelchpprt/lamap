// Mock for Mapbox GL JS
// Required because Mapbox GL doesn't work in Jest environment (no WebGL)

const mockMapboxGl = {
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    setStyle: jest.fn(),
    getStyle: jest.fn(() => ({ layers: [], sources: {} })),
    isStyleLoaded: jest.fn(() => true),
    getCenter: jest.fn(() => ({ lng: 2.3522, lat: 48.8566 })),
    setCenter: jest.fn(),
    getZoom: jest.fn(() => 10),
    setZoom: jest.fn(),
    getBounds: jest.fn(() => ({
      getNorthEast: () => ({ lng: 3, lat: 49 }),
      getSouthWest: () => ({ lng: 1, lat: 48 }),
    })),
    fitBounds: jest.fn(),
    project: jest.fn(() => ({ x: 100, y: 100 })),
    unproject: jest.fn(() => ({ lng: 2.3522, lat: 48.8566 })),
    queryRenderedFeatures: jest.fn(() => []),
    getCanvas: jest.fn(() => ({
      style: { cursor: '' },
      width: 800,
      height: 600,
    })),
    resize: jest.fn(),
    loaded: jest.fn(() => true),
    fire: jest.fn(),
    // Navigation methods
    scrollZoom: {
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(() => true),
    },
    boxZoom: {
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(() => true),
    },
    dragRotate: {
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(() => true),
    },
    dragPan: {
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(() => true),
    },
    keyboard: {
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(() => true),
    },
    doubleClickZoom: {
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(() => true),
    },
    touchZoomRotate: {
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(() => true),
    },
  })),

  Marker: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    getElement: jest.fn(() => document.createElement('div')),
    setPopup: jest.fn().mockReturnThis(),
    togglePopup: jest.fn(),
    getPopup: jest.fn(),
    setOffset: jest.fn().mockReturnThis(),
    setDraggable: jest.fn().mockReturnThis(),
    isDraggable: jest.fn(() => false),
    setRotation: jest.fn().mockReturnThis(),
    getRotation: jest.fn(() => 0),
    setRotationAlignment: jest.fn().mockReturnThis(),
    getRotationAlignment: jest.fn(() => 'auto'),
    setPitchAlignment: jest.fn().mockReturnThis(),
    getPitchAlignment: jest.fn(() => 'auto'),
  })),

  Popup: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    setHTML: jest.fn().mockReturnThis(),
    setText: jest.fn().mockReturnThis(),
    setDOMContent: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    isOpen: jest.fn(() => false),
    getLngLat: jest.fn(() => ({ lng: 2.3522, lat: 48.8566 })),
    setOffset: jest.fn().mockReturnThis(),
    addClassName: jest.fn().mockReturnThis(),
    removeClassName: jest.fn().mockReturnThis(),
    setMaxWidth: jest.fn().mockReturnThis(),
    toggleClassName: jest.fn().mockReturnThis(),
  })),

  NavigationControl: jest.fn().mockImplementation(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
  })),

  GeolocateControl: jest.fn().mockImplementation(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
    trigger: jest.fn(),
  })),

  FullscreenControl: jest.fn().mockImplementation(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
  })),

  ScaleControl: jest.fn().mockImplementation(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
  })),

  AttributionControl: jest.fn().mockImplementation(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
  })),

  // Global properties
  accessToken: 'pk.test_token',
  version: '3.0.0',
  supported: jest.fn(() => true),
  setRTLTextPlugin: jest.fn(),
  getRTLTextPluginStatus: jest.fn(() => 'loaded'),

  // Event classes
  MapboxEvent: class MockMapboxEvent {},
  MapMouseEvent: class MockMapMouseEvent {},
  MapTouchEvent: class MockMapTouchEvent {},
  MapWheelEvent: class MockMapWheelEvent {},

  // Utilities
  LngLatBounds: jest.fn().mockImplementation(() => ({
    extend: jest.fn().mockReturnThis(),
    getCenter: jest.fn(() => ({ lng: 2.3522, lat: 48.8566 })),
    getSouthWest: jest.fn(() => ({ lng: 1, lat: 48 })),
    getNorthEast: jest.fn(() => ({ lng: 3, lat: 49 })),
    getSouth: jest.fn(() => 48),
    getWest: jest.fn(() => 1),
    getNorth: jest.fn(() => 49),
    getEast: jest.fn(() => 3),
    toArray: jest.fn(() => [
      [1, 48],
      [3, 49],
    ]),
  })),

  LngLat: jest.fn().mockImplementation((lng, lat) => ({
    lng: lng || 2.3522,
    lat: lat || 48.8566,
    wrap: jest.fn().mockReturnThis(),
    toArray: jest.fn(() => [lng || 2.3522, lat || 48.8566]),
    toString: jest.fn(() => `LngLat(${lng || 2.3522}, ${lat || 48.8566})`),
    toBounds: jest.fn(() => new mockMapboxGl.LngLatBounds()),
    distanceTo: jest.fn(() => 1000),
  })),

  Point: jest.fn().mockImplementation((x, y) => ({
    x: x || 0,
    y: y || 0,
    clone: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    mult: jest.fn().mockReturnThis(),
    div: jest.fn().mockReturnThis(),
    rotate: jest.fn().mockReturnThis(),
    matMult: jest.fn().mockReturnThis(),
    unit: jest.fn().mockReturnThis(),
    perp: jest.fn().mockReturnThis(),
    round: jest.fn().mockReturnThis(),
    mag: jest.fn(() => Math.sqrt(x * x + y * y) || 0),
    equals: jest.fn(() => true),
    dist: jest.fn(() => 100),
    distSqr: jest.fn(() => 10000),
    angle: jest.fn(() => 0),
    angleTo: jest.fn(() => 0),
    angleWith: jest.fn(() => 0),
    angleWithSep: jest.fn(() => 0),
  })),
};

module.exports = mockMapboxGl;
