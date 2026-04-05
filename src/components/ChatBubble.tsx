import React, { useState, useRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme, Menu } from 'react-native-paper';
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
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<View>(null);

  const handleLongPress = () => {
    bubbleRef.current?.measureInWindow((x, y, w, h) => {
      // Pin the menu to the bottom-inner corner of the bubble
      setMenuAnchor({ x: isUser ? x : x + w, y: y + h });
      setMenuVisible(true);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

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

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
          <Text variant="labelSmall" style={{ color: colors.primary, fontWeight: '700' }}>
            G
          </Text>
        </View>
      )}

      {/* Long-press the bubble itself — no persistent visible button */}
      <Pressable onLongPress={handleLongPress} delayLongPress={500} style={styles.pressable}>
        <View
          ref={bubbleRef}
          collapsable={false}
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primaryContainer, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.surfaceVariant, borderBottomLeftRadius: 4 },
          ]}
        >
          <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
            {message.content}
          </Text>
          <Text
            variant="labelSmall"
            style={[styles.timestamp, { color: colors.onSurfaceVariant }]}
          >
            {format(message.timestamp, 'h:mm a')}
          </Text>
        </View>
      </Pressable>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuAnchor}
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
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
    marginRight: 4,
  },
  pressable: {
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
});
