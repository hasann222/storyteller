import { theme, darkTheme, lightTheme, genreColors, getTheme } from '../../src/theme';

describe('theme', () => {
  it('lightTheme and theme reference the same object', () => {
    expect(lightTheme).toBe(theme);
  });

  it('lightTheme primary color is the brand amber', () => {
    expect(theme.colors.primary).toBe('#C47B2B');
  });

  it('darkTheme primary color is the lighter amber variant', () => {
    expect(darkTheme.colors.primary).toBe('#FFB95B');
  });

  it('roundness is 3 on both themes', () => {
    expect(theme.roundness).toBe(3);
    expect(darkTheme.roundness).toBe(3);
  });
});

describe('genreColors', () => {
  it('has an entry for every default genre', () => {
    const defaultGenres = ['fantasy', 'sci-fi', 'noir', 'romance', 'horror', 'drama', 'adventure', 'comedy'];
    for (const genre of defaultGenres) {
      expect(genreColors[genre]).toBeDefined();
    }
  });

  it('fantasy color matches the brand primary', () => {
    expect(genreColors['fantasy']).toBe('#C47B2B');
  });
});

describe('getTheme', () => {
  it('returns lightTheme when mode is "light"', () => {
    expect(getTheme('light', 'light')).toBe(lightTheme);
    expect(getTheme('light', 'dark')).toBe(lightTheme);
  });

  it('returns darkTheme when mode is "dark"', () => {
    expect(getTheme('dark', 'light')).toBe(darkTheme);
    expect(getTheme('dark', 'dark')).toBe(darkTheme);
  });

  it('follows system scheme when mode is "system"', () => {
    expect(getTheme('system', 'light')).toBe(lightTheme);
    expect(getTheme('system', 'dark')).toBe(darkTheme);
  });
});
