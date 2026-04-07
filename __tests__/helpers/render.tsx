/**
 * renderWithProviders
 *
 * Wraps the component under test with every context provider the app uses,
 * so components can access theme, etc. without requiring a full app setup.
 */
import React, { type PropsWithChildren } from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../../src/theme';

function TestProviders({ children }: PropsWithChildren) {
  // SafeAreaProvider is mocked (returns children), so just PaperProvider is enough.
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: TestProviders, ...options });
}
