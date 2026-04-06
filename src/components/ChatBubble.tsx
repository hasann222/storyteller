import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Pressable } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import type { ChatMessage } from '../types/scene';

/** Blinking cursor shown at the end of streaming text */
function StreamingCursor({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.Text style={{ opacity, color, fontWeight: '600' }}>
      ▍
    </Animated.Text>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
  onCopyToScript?: (text: string) => void;
  onEdit?: () => void;
}

export function ChatBubble({ message, onCopyToScript, onEdit }: ChatBubbleProps) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';
  const isStreaming = !!message.isStreaming;
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
            S
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
          <Text variant="bodyMedium" style={{ color: colors.onSurface }} selectable={!isStreaming}>
            {message.content}
            {isStreaming && <StreamingCursor color={colors.primary} />}
          </Text>
          {!isStreaming && (
            <Text
              variant="labelSmall"
              style={[styles.timestamp, { color: colors.onSurfaceVariant }]}
            >
              {format(message.timestamp, 'h:mm a')}
            </Text>
          )}
        </View>

        {/* Subtle action icons tucked below the bubble's left edge — assistant only */}
        {!isUser && !isStreaming && (
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
        )}

        {/* Edit action — user messages only, when permitted */}
        {isUser && onEdit && !isStreaming && (
          <View style={[styles.actions, styles.actionsUser]}>
            <Pressable
              onPress={onEdit}
              hitSlop={8}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.5 }]}
            >
              <Icon source="pencil-outline" size={13} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>
        )}
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
  actionsUser: {
    paddingLeft: 0,
    paddingRight: 4,
    justifyContent: 'flex-end',
  },
  },
  actionBtn: {
    padding: 3,
    borderRadius: 8,
  },
});
