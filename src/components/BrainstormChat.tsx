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
  const editAndResendMessage = useChatStore((s) => s.editAndResendMessage);
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

  // The last user message — only this one gets the edit pencil
  const lastUserMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'user') ?? null,
    [messages],
  );

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInitialValue, setEditInitialValue] = useState<string | null>(null);

  const handleStartEdit = useCallback((id: string, content: string) => {
    setEditingId(id);
    setEditInitialValue(content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditInitialValue(null);
  }, []);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const [snackbar, setSnackbar] = React.useState('');
  // Android 15+ with edgeToEdgeEnabled: adjustResize is broken.
  // We measure the container's absolute bottom in screen coordinates via measureInWindow
  // (more reliable than measure/pageY on Android), then compute the exact geometric
  // overlap with the keyboard using e.endCoordinates.y (keyboard top in screen coords).
  const [keyboardPad, setKeyboardPad] = useState(0);
  const containerRef = useRef<View>(null);
  const containerBottomRef = useRef(0);

  const captureContainerBottom = useCallback(() => {
    containerRef.current?.measureInWindow((_x, y, _w, h) => {
      if (y + h > 0) containerBottomRef.current = y + h;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      // e.endCoordinates.screenY = keyboard top in screen coordinates.
      // Exact overlap = how far the keyboard pokes above the container bottom.
      const overlap = containerBottomRef.current - e.endCoordinates.screenY;
      setKeyboardPad(Math.max(0, overlap));
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

  const handleSend = useCallback((text: string) => {
    if (editingId) {
      editAndResendMessage(projectId, editingId, text);
      setEditingId(null);
      setEditInitialValue(null);
    } else {
      sendUserMessage(projectId, text);
    }
    setTimeout(scrollToBottom, 100);
    setTimeout(scrollToBottom, 1000);
  }, [editingId, editAndResendMessage, sendUserMessage, projectId, scrollToBottom]);

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
            <ChatBubble
              message={item}
              onCopyToScript={item.role === 'assistant' ? handleCopyToScript : undefined}
              onEdit={
                !isBusy && item.role === 'user' && item.id === lastUserMessage?.id
                  ? () => handleStartEdit(item.id, item.content)
                  : undefined
              }
            />
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
      <View style={{ paddingBottom: 8, paddingTop: 8 }}>
        <ChatInput
          onSend={handleSend}
          disabled={isBusy}
          editValue={editInitialValue}
          onCancelEdit={handleCancelEdit}
        />
      </View>
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
        ref={containerRef}
        onLayout={captureContainerBottom}
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            // When keyboard up: pad by exact overlap; when down: 0 (tab bar handles gap)
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
