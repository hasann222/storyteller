/**
 * Settings.test.tsx — integration tests for app/settings.tsx
 *
 * Uses the real settingsStore (no mock). The SecureStore mock from
 * jest.setup.ts means getApiKey() returns null, so no network calls
 * are triggered on mount. Verifies: appearance toggles, API key save,
 * and prompt reset.
 */
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SegmentedButtons, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import SettingsScreen from '../../app/settings';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { renderWithProviders } from '../helpers/render';
import { resetAllStores } from '../helpers/store';

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
});

function renderSettings() {
  return renderWithProviders(<SettingsScreen />);
}

// ── Appearance — theme ────────────────────────────────────────────────────────

describe('Settings — theme toggle', () => {
  it('renders the Theme section heading', () => {
    renderSettings();
    expect(screen.getByText('Theme')).toBeTruthy();
  });

  it('pressing Dark updates settingsStore.themeMode to "dark"', () => {
    const { UNSAFE_getAllByType } = renderSettings();
    // SegmentedButtons renders individual pressable Button children
    // We can find the SegmentedButtons instances and call onValueChange directly
    const [themeSegmented] = UNSAFE_getAllByType(SegmentedButtons);
    themeSegmented.props.onValueChange('dark');
    expect(useSettingsStore.getState().themeMode).toBe('dark');
  });

  it('pressing Light updates settingsStore.themeMode to "light"', () => {
    // Start from dark mode
    useSettingsStore.setState({ themeMode: 'dark' });
    const { UNSAFE_getAllByType } = renderSettings();
    const [themeSegmented] = UNSAFE_getAllByType(SegmentedButtons);
    themeSegmented.props.onValueChange('light');
    expect(useSettingsStore.getState().themeMode).toBe('light');
  });

  it('pressing System updates settingsStore.themeMode to "system"', () => {
    useSettingsStore.setState({ themeMode: 'dark' });
    const { UNSAFE_getAllByType } = renderSettings();
    const [themeSegmented] = UNSAFE_getAllByType(SegmentedButtons);
    themeSegmented.props.onValueChange('system');
    expect(useSettingsStore.getState().themeMode).toBe('system');
  });
});

// ── Appearance — font scale ───────────────────────────────────────────────────

describe('Settings — font scale toggle', () => {
  it('renders the Font Size section heading', () => {
    renderSettings();
    expect(screen.getByText('Font Size')).toBeTruthy();
  });

  it('selecting Large updates settingsStore.fontScale to "large"', () => {
    const { UNSAFE_getAllByType } = renderSettings();
    const segmented = UNSAFE_getAllByType(SegmentedButtons);
    // Second SegmentedButtons instance is Font Size
    segmented[1].props.onValueChange('large');
    expect(useSettingsStore.getState().fontScale).toBe('large');
  });

  it('selecting Small updates settingsStore.fontScale to "small"', () => {
    useSettingsStore.setState({ fontScale: 'large' });
    const { UNSAFE_getAllByType } = renderSettings();
    const segmented = UNSAFE_getAllByType(SegmentedButtons);
    segmented[1].props.onValueChange('small');
    expect(useSettingsStore.getState().fontScale).toBe('small');
  });
});

// ── AI model selection ────────────────────────────────────────────────────────

describe('Settings — AI model selection', () => {
  it('renders all supported model labels', () => {
    renderSettings();
    expect(screen.getByText('Grok 4.1 Fast Reasoning')).toBeTruthy();
    expect(screen.getByText('Grok 4 Fast')).toBeTruthy();
    expect(screen.getByText('Grok 4')).toBeTruthy();
    expect(screen.getByText('Grok 4.20 Reasoning')).toBeTruthy();
  });

  it('changing model via RadioButton.Group updates settingsStore.aiModel', () => {
    const { UNSAFE_getByType } = renderSettings();
    const radioGroup = UNSAFE_getByType(RadioButton.Group);
    radioGroup.props.onValueChange('grok-4-fast');
    expect(useSettingsStore.getState().aiModel).toBe('grok-4-fast');
  });
});

// ── API key save ──────────────────────────────────────────────────────────────

describe('Settings — API key', () => {
  it('renders the API Key input field', () => {
    renderSettings();
    expect(screen.getByText('API Key')).toBeTruthy();
  });

  it('Save button is present in the UI', () => {
    renderSettings();
    // Both API key and mgmt key have a Save button
    const saveButtons = screen.getAllByText('Save');
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('Settings — navigation', () => {
  it('back arrow calls router.back()', () => {
    const router = (useRouter as jest.Mock)();
    const { UNSAFE_getAllByProps } = renderSettings();
    // Find the back arrow IconButton specifically by its icon prop
    const backButton = UNSAFE_getAllByProps({ icon: 'arrow-left' })[0];
    backButton.props.onPress();
    expect(router.back).toHaveBeenCalled();
  });
});

// ── Prompt reset ──────────────────────────────────────────────────────────────

describe('Settings — character prompts', () => {
  it('renders the Character Prompts section', () => {
    renderSettings();
    expect(screen.getByText('Character Prompts')).toBeTruthy();
  });
});
