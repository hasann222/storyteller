import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, IconButton, Menu } from 'react-native-paper';
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
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCopy = async () => {
    setMenuVisible(false);
    await Clipboard.setStringAsync(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyToScript = () => {
    setMenuVisible(false);
    onCopyToScript?.(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // The ⋮ menu sits OUTSIDE the bubble so it never inflates bubble size.
  // The bubble's <Text selectable> has no Pressable ancestor — native selection works.
  const actionMenu = (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <IconButton
          icon="dots-horizontal"
          size={14}
          iconColor={colors.onSurfaceVariant}
          onPress={() => setMenuVisible(true)}
          style={styles.menuBtn}
        />
      }
    >
      <Menu.Item
        leadingIcon={copied ? 'check' : 'content-copy'}
        onPress={handleCopy}
        title={copied ? 'Copied!' : 'Copy text'}
      />
      {onCopyToScript && (
        <Menu.Item
          leadingIcon="script-text-outline"
          onPress={handleCopyToScript}
          title="Copy to Script"
        />
      )}
    </Menu>
  );

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
          <Text variant="labelSmall" style={{ color: colors.primary, fontWeight: '700' }}>
            G
          </Text>
        </View>
      )}

      {/* User bubbles: menu on left side, bubble on right */}
      {isUser && actionMenu}

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

      {/* Assistant bubbles: menu on right side */}
      {!isUser && actionMenu}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    gap: 4,
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
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 16,
  },
  timestamp: {
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  menuBtn: {
    margin: 0,
    width: 24,
    height: 24,
  },
});
