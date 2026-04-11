import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { darkColors } from './dark';
import type { ThemeMode } from '../stores/settingsStore';

const fontConfig = configureFonts({
  config: {
    displayLarge: { fontFamily: 'Inter_700Bold', fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
    displayMedium: { fontFamily: 'Inter_700Bold', fontSize: 45, lineHeight: 52 },
    displaySmall: { fontFamily: 'Inter_700Bold', fontSize: 36, lineHeight: 44 },
    headlineLarge: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 40 },
    headlineMedium: { fontFamily: 'Inter_600SemiBold', fontSize: 28, lineHeight: 36 },
    headlineSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 24, lineHeight: 32 },
    titleLarge: { fontFamily: 'Inter_600SemiBold', fontSize: 22, lineHeight: 28 },
    titleMedium: { fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
    titleSmall: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  },
});

export const theme: MD3Theme = {
  ...MD3LightTheme,
  fonts: {
    ...MD3LightTheme.fonts,
    ...fontConfig,
  },
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#C0784A',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FAEADF',
    onPrimaryContainer: '#391B05',
    secondary: '#6E6179',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F0E8F4',
    onSecondaryContainer: '#271C30',
    tertiary: '#8B6E98',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#F3E4F8',
    onTertiaryContainer: '#2A1533',
    error: '#C4453E',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    background: '#F9F7F5',
    onBackground: '#1C1520',
    surface: '#FFFFFF',
    onSurface: '#1C1520',
    surfaceVariant: '#F3EEF0',
    onSurfaceVariant: '#4D4452',
    outline: '#D8D0DC',
    outlineVariant: '#E9E3EC',
    inverseSurface: '#322D36',
    inverseOnSurface: '#F5F0F3',
    inversePrimary: '#F0A87C',
    elevation: {
      level0: 'transparent',
      level1: '#F9F7F5',
      level2: '#F5F2F0',
      level3: '#F3EEF0',
      level4: '#F0EAED',
      level5: '#ECE6EA',
    },
    surfaceDisabled: 'rgba(28, 21, 32, 0.12)',
    onSurfaceDisabled: 'rgba(28, 21, 32, 0.38)',
    backdrop: 'rgba(28, 21, 32, 0.4)',
    shadow: 'rgba(28, 21, 32, 0.08)',
    scrim: 'rgba(28, 21, 32, 0.5)',
  },
};

export const genreColors: Record<string, string> = {
  fantasy: '#C0784A',
  'sci-fi': '#6B8FB8',
  noir: '#4A4558',
  romance: '#C4657E',
  horror: '#7A3B44',
  drama: '#8B6F5A',
  adventure: '#5A8A6B',
  comedy: '#D4A050',
};

export const lightTheme = theme;

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: {
    ...MD3DarkTheme.fonts,
    ...fontConfig,
  },
  roundness: 3,
  colors: darkColors,
};

export function getTheme(mode: ThemeMode, systemScheme: 'light' | 'dark'): MD3Theme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
}
