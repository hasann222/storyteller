import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, IconButton, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
      <TextInput
        value={text}
        onChangeText={setText}
        mode="outlined"
        style={styles.input}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        outlineStyle={{ borderRadius: 20, borderWidth: 1.5 }}
        dense
        multiline
        maxLength={2000}
        onSubmitEditing={handleSend}
        blurOnSubmit
      />
      <IconButton
        icon="send"
        iconColor={text.trim() ? colors.primary : colors.onSurfaceDisabled}
        onPress={handleSend}
        disabled={!text.trim()}
        size={24}
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
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
  },
});
