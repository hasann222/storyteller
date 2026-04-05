import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../stores/chatStore';
import { useSceneStore } from '../stores/sceneStore';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { ThinkingBubble } from './ThinkingBubble';
import { EmptyState } from './EmptyState';
import type { ChatMessage } from '../types/scene';

interface BrainstormChatProps {
  projectId: string;
}

export function BrainstormChat({ projectId }: BrainstormChatProps) {
  const { colors } = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const allMessages = useChatStore((s) => s.messages);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const addScene = useSceneStore((s) => s.addScene);
  const allScenes = useSceneStore((s) => s.scenes);
  const messages = useMemo(
    () =>
      allMessages
        .filter((m) => m.projectId === projectId)
        .sort((a, b) => a.timestamp - b.timestamp),
    [allMessages, projectId]
  );
  const isBusy = useMemo(
    () => messages.some((m) => m.isThinking || m.isStreaming),
    [messages],
  );
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const [snackbar, setSnackbar] = React.useState('');
  // Android 15+ with edgeToEdgeEnabled: adjustResize is broken by the OS.
  // We manually track keyboard height and apply it as paddingBottom.
  // bottomInset becomes 0 when keyboard is shown (Android clears nav-bar inset),
  // so we capture the last non-zero value in a ref before that happens.
  const [keyboardPad, setKeyboardPad] = useState(0);
  const lastBottomInsetRef = useRef(bottomInset);
  useEffect(() => {
    if (bottomInset > 0) lastBottomInsetRef.current = bottomInset;
  }, [bottomInset]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      // Subtract the gesture-nav height captured before keyboard appeared
      setKeyboardPad(Math.max(0, e.endCoordinates.height - lastBottomInsetRef.current));
      setTimeout(scrollToBottom, 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardPad(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollToBottom]);

  const handleSend = (text: string) => {
    sendUserMessage(projectId, text);
    setTimeout(scrollToBottom, 100);
    setTimeout(scrollToBottom, 1000);
  };

  const handleCopyToScript = useCallback(
    (text: string) => {
      const nextOrder = allScenes.filter((s) => s.projectId === projectId).length;
      addScene({
        projectId,
        order: nextOrder,
        title: `Scene ${nextOrder + 1}`,
        narration: text,
        visualPromptMeta: {
          imagePrompt: '',
          videoPrompt: '',
          cameraDirection: '',
          lighting: '',
          mood: '',
        },
        characterIds: [],
      });
      setSnackbar('Added as new scene in Script tab');
    },
    [projectId, addScene, allScenes]
  );

  const chatContent = (
    <>
      <FlatList<ChatMessage>
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.isThinking ? (
            <ThinkingBubble />
          ) : (
            <ChatBubble message={item} onCopyToScript={handleCopyToScript} />
          )
        }
        contentContainerStyle={
          messages.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Start brainstorming"
            subtitle="Share an idea, ask for inspiration, or explore possibilities"
          />
        }
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />
      <ChatInput onSend={handleSend} disabled={isBusy} />
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </>
  );

  // On Android, adjustResize is broken when edgeToEdgeEnabled: true (Android 15+).
  // We manually apply paddingBottom = keyboard height when keyboard is up,
  // or bottomInset (navigation bar height) when keyboard is down.
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingBottom: keyboardPad,
          },
        ]}
      >
        {chatContent}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={100}
    >
      {chatContent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
