/**
 * フロントエンドテストのセットアップファイル
 * 
 * Jest環境でのReactコンポーネントテストに必要な設定を行う
 */

import '@testing-library/jest-dom';

// Mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

// Mock for ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((message) => {
    // Suppress expected MUI warnings
    if (typeof message === 'string' && message.includes('MUI:')) {
      return;
    }
    originalConsoleError(message);
  });

  jest.spyOn(console, 'warn').mockImplementation((message) => {
    // Suppress expected MUI warnings
    if (typeof message === 'string' && message.includes('MUI:')) {
      return;
    }
    originalConsoleWarn(message);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

// 日本時間でのテスト環境設定
process.env.TZ = 'Asia/Tokyo';