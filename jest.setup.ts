/**
 * jest.setup.ts
 *
 * Runs after the Jest test environment is initialised (setupFilesAfterEnv).
 * Mocks every native / device module so unit tests run in Node.
 */

// ── 1. In-memory secure store ────────────────────────────────────────────────
const mockSecureStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockSecureStore[key] ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockSecureStore[key] = value;
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    delete mockSecureStore[key];
    return Promise.resolve();
  }),
}));

// ── 2. Deterministic UUID ────────────────────────────────────────────────────
let mockUuidCounter = 0;
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => `test-uuid-${++mockUuidCounter}`),
}));

// ── 3. Haptics (no-ops) ──────────────────────────────────────────────────────
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));

// ── 4. File system (expo-file-system — legacy API + new Paths/Directory/File) ──
jest.mock('expo-file-system', () => ({
  // Legacy API
  documentDirectory: 'file:///test-documents/',
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  deleteAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
  // New-style API (Paths, Directory, File) — also re-exported from this package
  Paths: { document: 'file:///test-documents' },
  Directory: jest.fn().mockImplementation((path: string) => ({
    path,
    exists: false,
    create: jest.fn(),
    delete: jest.fn(),
  })),
  File: jest.fn().mockImplementation((dir: any, name: string) => {
    const p = `${typeof dir === 'string' ? dir : dir?.path ?? ''}/${name ?? ''}`;
    return {
      path: p,
      uri: `file://${p}`,
      exists: false,
      create: jest.fn(),
      delete: jest.fn(),
      write: jest.fn(),
      text: jest.fn(() => ''),
    };
  }),
}));

// ── 5. File system (expo-file-system/next — Paths, Directory, File) ──────────
jest.mock('expo-file-system/next', () => ({
  Paths: { document: 'file:///test-documents' },
  Directory: jest.fn().mockImplementation((path: string) => ({
    path,
    exists: false,
    create: jest.fn(),
    delete: jest.fn(),
  })),
  File: jest.fn().mockImplementation((dir: any, name: string) => {
    const path = `${typeof dir === 'string' ? dir : dir?.path ?? ''}/${name ?? ''}`;
    return {
      path,
      uri: `file://${path}`,
      exists: false,
      create: jest.fn(),
      delete: jest.fn(),
      write: jest.fn(),
      text: jest.fn(() => ''),
    };
  }),
}));

// ── 6. expo-image (native Image → plain View) ────────────────────────────────
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: View };
});

// ── 7. expo-linear-gradient (pass-through View) ──────────────────────────────
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children }: any) => children ?? null,
  };
});

// ── 8. expo-router (navigation stubs) ────────────────────────────────────────
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
  dismiss: jest.fn(),
};
const MockStack = ({ children }: any) => children ?? null;
MockStack.Screen = () => null;
const MockTabs = ({ children }: any) => children ?? null;
MockTabs.Screen = () => null;

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => mockRouter),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => []),
  router: mockRouter,
  Stack: MockStack,
  Tabs: MockTabs,
  Link: ({ children }: any) => children ?? null,
}));

// ── 9. expo-splash-screen (no-ops) ───────────────────────────────────────────
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// ── 10. expo-clipboard ───────────────────────────────────────────────────────
let mockClipboard = '';
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn((s: string) => { mockClipboard = s; return Promise.resolve(); }),
  getStringAsync: jest.fn(() => Promise.resolve(mockClipboard)),
  hasStringAsync: jest.fn(() => Promise.resolve(mockClipboard.length > 0)),
}));

// ── 11. expo-sharing ─────────────────────────────────────────────────────────
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// ── 12. expo-document-picker ─────────────────────────────────────────────────
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
}));

// ── 13. expo-font / Playfair Display (fonts always loaded) ───────────────────
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: jest.fn(() => [true, null]),
  Inter_500Medium: null,
  Inter_600SemiBold: null,
  Inter_700Bold: null,
}));

// ── 14. react-native-safe-area-context ───────────────────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children ?? null,
  SafeAreaView: ({ children }: any) => children ?? null,
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
  SafeAreaInsetsContext: {
    Consumer: ({ children }: any) => children?.({ top: 0, right: 0, bottom: 0, left: 0 }) ?? null,
  },
}));

// ── 15. react-native-reanimated ──────────────────────────────────────────────
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// ── 16. react-native-screens ─────────────────────────────────────────────────
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// ── 17. react-native-paper — Portal renders children inline ──────────────────
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const React = require('react');
  return {
    ...actual,
    Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

// ── 18. Global fetch (all API calls must be mocked per test) ─────────────────
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  } as Response),
);

// ── 19. XMLHttpRequest mock (SSE streaming in chat/interview stores) ──────────
class MockXMLHttpRequest {
  open = jest.fn();
  send = jest.fn();
  abort = jest.fn();
  setRequestHeader = jest.fn();
  onprogress: (() => void) | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  responseText = '';
  status = 200;
  readyState = 4;

  /** Helper for tests: simulate a stream chunk arriving */
  simulateProgress(text: string) {
    this.responseText = text;
    this.onprogress?.();
  }

  /** Helper for tests: simulate stream completion */
  simulateComplete() {
    this.onload?.();
  }
}
(global as any).XMLHttpRequest = MockXMLHttpRequest;

// ── 20. Silence noisy RN warnings in test output ──────────────────────────────
const _originalWarn = console.warn.bind(console);
jest.spyOn(console, 'warn').mockImplementation((msg: string, ...rest) => {
  // Let through unexpected warnings; suppress known RN noise
  const suppressed = [
    'Animated:',
    'VirtualizedList:',
    'Each child in a list',
  ];
  if (suppressed.some((s) => String(msg).includes(s))) return;
  _originalWarn(msg, ...rest);
});
