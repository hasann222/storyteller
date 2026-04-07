/** @type {import('jest-expo').JestExpoConfig} */
module.exports = {
  preset: 'jest-expo',

  // Run after test environment is set up (mocks, matchers)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Run before test environment — gesture handler needs to be earliest
  setupFiles: [
    ...require('jest-expo/jest-preset').setupFiles ?? [],
    'react-native-gesture-handler/jestSetup',
  ],

  // Allow ESM packages that need transpiling (zustand v5, date-fns v4, plus all expo/rn)
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|zustand|date-fns|react-native-paper|react-native-draggable-flatlist|react-native-reanimated))',
    '/node_modules/react-native-reanimated/plugin/',
  ],

  // Resolve tsconfig paths (@/* → src/*)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Official AsyncStorage jest mock
    '^@react-native-async-storage/async-storage$': require.resolve(
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    ),
    // Map all @expo/vector-icons paths to a single no-op mock
    '^@expo/vector-icons(/.*)?$': '<rootDir>/__mocks__/expo-vector-icons.js',
  },

  // Exclude helper/utility files from being treated as test suites
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/helpers/',
  ],

  // Coverage — only src code; skip pure type declarations, mock data, and theme constants
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/types/**',
    '!src/data/**',
    '!src/theme/**',
  ],
};
