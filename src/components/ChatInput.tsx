import React, { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
      <View
        style={[
          styles.inputWrap,
          {
            borderColor: focused ? colors.primary : colors.outlineVariant,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          style={[styles.input, { color: colors.onSurface }]}
          placeholder="Message..."
          placeholderTextColor={colors.onSurfaceVariant}
          multiline
          maxLength={2000}
          onSubmitEditing={handleSend}
          blurOnSubmit
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      <IconButton
        icon="send"
        iconColor={text.trim() ? colors.primary : colors.onSurfaceDisabled}
        onPress={handleSend}
        disabled={!text.trim()}
        size={22}
        style={styles.sendBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrap: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 110,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 80,
    padding: 0,
  },
  sendBtn: {
    margin: 0,
    marginLeft: 2,
  },
});
