import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import type { ChatMessage } from '../types/scene';

interface ChatBubbleProps {
  message: ChatMessage;
  onCopyToScript?: (text: string) => void;
}

export function ChatBubble({ message, onCopyToScript }: ChatBubbleProps) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyToScript = () => {
    onCopyToScript?.(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
          <Text variant="labelSmall" style={{ color: colors.primary, fontWeight: '700' }}>
            G
          </Text>
        </View>
      )}

      <View style={styles.bubbleColumn}>
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primaryContainer, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.surfaceVariant, borderBottomLeftRadius: 4 },
          ]}
        >
          <Text variant="bodyMedium" style={{ color: colors.onSurface }} selectable>
            {message.content}
          </Text>
          <Text
            variant="labelSmall"
            style={[styles.timestamp, { color: colors.onSurfaceVariant }]}
          >
            {format(message.timestamp, 'h:mm a')}
          </Text>
        </View>

        {/* Subtle action icons tucked below the bubble's left edge */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleCopy}
            hitSlop={6}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.5 }]}
          >
            <Icon
              source={copied ? 'check' : 'content-copy'}
              size={13}
              color={copied ? colors.tertiary : colors.onSurfaceVariant}
            />
          </Pressable>
          {onCopyToScript && (
            <Pressable
              onPress={handleCopyToScript}
              hitSlop={6}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.5 }]}
            >
              <Icon
                source="script-text-outline"
                size={13}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginTop: 2,
  },
  bubbleColumn: {
    maxWidth: '78%',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 16,
  },
  timestamp: {
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    paddingLeft: 8,
    paddingTop: 2,
    gap: 4,
  },
  actionBtn: {
    padding: 3,
    borderRadius: 8,
  },
});
