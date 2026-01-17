import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollIntoView (not implemented in jsdom)
Element.prototype.scrollIntoView = vi.fn();

// Mock Tauri APIs
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/window', () => ({
  appWindow: {
    hide: vi.fn(),
    onFocusChanged: vi.fn(() => Promise.resolve(() => {})),
  },
}));
