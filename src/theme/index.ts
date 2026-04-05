import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = configureFonts({
  config: {
    displayLarge: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
    displayMedium: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 45, lineHeight: 52 },
    displaySmall: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, lineHeight: 44 },
    headlineLarge: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, lineHeight: 40 },
    headlineMedium: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 28, lineHeight: 36 },
    headlineSmall: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 24, lineHeight: 32 },
    titleLarge: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 22, lineHeight: 28 },
    titleMedium: { fontFamily: 'PlayfairDisplay_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
    titleSmall: { fontFamily: 'PlayfairDisplay_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
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
    primary: '#C47B2B',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FDECD2',
    onPrimaryContainer: '#3D2400',
    secondary: '#6B5D4F',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F3E8D8',
    onSecondaryContainer: '#251A0C',
    tertiary: '#6B8F71',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#DFF0E0',
    onTertiaryContainer: '#0D2211',
    error: '#BA4949',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    background: '#FBF7F0',
    onBackground: '#2C2418',
    surface: '#FFFFFF',
    onSurface: '#2C2418',
    surfaceVariant: '#F5EDE2',
    onSurfaceVariant: '#524438',
    outline: '#D4C5B0',
    outlineVariant: '#E8DCD0',
    inverseSurface: '#352F27',
    inverseOnSurface: '#F9F0E7',
    inversePrimary: '#FFB95B',
    elevation: {
      level0: 'transparent',
      level1: '#FBF7F0',
      level2: '#F8F1E8',
      level3: '#F5EDE2',
      level4: '#F3E8D8',
      level5: '#F0E5D2',
    },
    surfaceDisabled: 'rgba(44, 36, 24, 0.12)',
    onSurfaceDisabled: 'rgba(44, 36, 24, 0.38)',
    backdrop: 'rgba(44, 36, 24, 0.4)',
    shadow: 'rgba(44, 36, 24, 0.08)',
    scrim: 'rgba(44, 36, 24, 0.5)',
  },
};

export const genreColors: Record<string, string> = {
  fantasy: '#C47B2B',
  'sci-fi': '#5B8FBC',
  noir: '#4A4A5A',
  romance: '#C7657B',
  horror: '#7A3B3B',
  drama: '#8B6F47',
  adventure: '#5A8A5A',
  comedy: '#D4A843',
};
