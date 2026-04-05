import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
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
        <View style={styles.footer}>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant, flex: 1 }}>
            {format(message.timestamp, 'h:mm a')}
          </Text>
          <IconButton
            icon={copied ? 'check' : 'content-copy'}
            size={14}
            iconColor={copied ? colors.tertiary : colors.onSurfaceVariant}
            onPress={handleCopy}
            style={styles.footerBtn}
          />
          {onCopyToScript && (
            <IconButton
              icon="script-text-outline"
              size={14}
              iconColor={colors.onSurfaceVariant}
              onPress={handleCopyToScript}
              style={styles.footerBtn}
            />
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
    gap: 8,
    alignItems: 'flex-end',
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
  },
  bubble: {
    maxWidth: '78%',
    padding: 12,
    paddingBottom: 4,
    borderRadius: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerBtn: {
    margin: 0,
    width: 28,
    height: 28,
  },
});
