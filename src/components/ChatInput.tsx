import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { IconButton, Icon, Text, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** When non-null, the input enters edit mode: text is pre-filled and an editing banner is shown. */
  editValue?: string | null;
  onCancelEdit?: () => void;
}

export function ChatInput({ onSend, disabled, editValue, onCancelEdit }: ChatInputProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isEditing = editValue != null;

  // Populate + focus when entering edit mode; clear when cancelling
  useEffect(() => {
    if (editValue != null) {
      setText(editValue);
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      setText('');
    }
  }, [editValue]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.outer, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
      {isEditing && (
        <View style={[styles.editingBar, { borderLeftColor: colors.primary }]}>
          <Icon source="pencil-outline" size={12} color={colors.primary} />
          <Text variant="labelSmall" style={[styles.editingLabel, { color: colors.primary }]}>
            Editing message
          </Text>
          <Pressable
            onPress={onCancelEdit}
            hitSlop={10}
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.5 }]}
          >
            <Icon source="close" size={15} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      )}
      <View style={styles.row}>
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
            ref={inputRef}
            value={text}
            onChangeText={setText}
            style={[styles.input, { color: colors.onSurface }]}
            placeholder={disabled ? 'Waiting for response...' : 'Message...'}
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
            blurOnSubmit
            editable={!disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
        <IconButton
          icon={isEditing ? 'check' : 'send'}
          iconColor={text.trim() && !disabled ? colors.primary : colors.onSurfaceDisabled}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          size={22}
          style={styles.sendBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingLeft: 8,
    paddingVertical: 4,
    borderLeftWidth: 2,
    gap: 6,
  },
  editingLabel: {
    flex: 1,
  },
  cancelBtn: {
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
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

