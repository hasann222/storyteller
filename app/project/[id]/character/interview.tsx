import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { Text, IconButton, Button, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useInterviewStore, type InterviewMessage } from '../../../../src/stores/interviewStore';
import { useProjectStore } from '../../../../src/stores/projectStore';
import { ChatInput } from '../../../../src/components/ChatInput';
import { useCharacterCreation } from '../../../../src/hooks/useCharacterCreation';
import { CharacterLoadingOverlay } from '../../../../src/components/CharacterLoadingOverlay';

// ── Inline interview bubble ──

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
  return <Animated.Text style={{ opacity, color, fontWeight: '600' }}>▍</Animated.Text>;
}

function ThinkingDots({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return (
    <Animated.Text style={{ opacity, color, fontSize: 16 }}>● ● ●</Animated.Text>
  );
}

function InterviewBubble({ message }: { message: InterviewMessage }) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  if (message.isThinking) {
    return (
      <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: colors.surfaceVariant }]}>
        <ThinkingDots color={colors.onSurfaceVariant} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bubble,
        isUser
          ? [styles.userBubble, { backgroundColor: colors.primaryContainer }]
          : [styles.assistantBubble, { backgroundColor: colors.surfaceVariant }],
      ]}
    >
      <Text
        variant="bodyMedium"
        style={{ color: isUser ? colors.onPrimaryContainer : colors.onSurfaceVariant }}
      >
        {message.content}
        {message.isStreaming && <StreamingCursor color={colors.onSurfaceVariant} />}
      </Text>
    </View>
  );
}

// ── Screen ──

export default function InterviewCreationScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id ?? '';
  const project = useProjectStore((s) => s.getProject(projectId));
  const genre = project?.genre ?? 'fantasy';

  const messages = useInterviewStore((s) => s.messages);
  const sendMessage = useInterviewStore((s) => s.sendMessage);
  const clearInterview = useInterviewStore((s) => s.clearInterview);
  const { createFromInterview, isCreating } = useCharacterCreation(projectId);

  const isBusy = useMemo(
    () => messages.some((m) => m.isThinking || m.isStreaming),
    [messages],
  );

  const canFinish = messages.filter((m) => m.role === 'user').length >= 2;

  const flatListRef = useRef<FlatList<InterviewMessage>>(null);

  // Keyboard handling for Android
  // Use full e.endCoordinates.height (no inset subtraction) because this is a full-screen
  // view with no tab bar below it; subtracting the inset causes under-compensation.
  const [keyboardPad, setKeyboardPad] = useState(0);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardPad(e.endCoordinates.height);
      setTimeout(scrollToBottom, 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardPad(0));
    return () => { show.remove(); hide.remove(); };
  }, [scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterview();
  }, [clearInterview]);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(projectId, text);
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 1000);
    },
    [sendMessage, projectId, scrollToBottom],
  );

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const msgs = messages
      .filter((m) => !m.isThinking && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));
    createFromInterview(msgs, genre);
  };

  const handleBack = () => {
    clearInterview();
    router.back();
  };

  // Extracted so Android (plain View) and iOS (KeyboardAvoidingView) share identical content.
  const chatBody = (
    <>
      <FlatList<InterviewMessage>
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InterviewBubble message={item} />}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
              Start describing your character and the AI will ask follow-up questions to help
              flesh them out.
            </Text>
          </View>
        }
        onContentSizeChange={scrollToBottom}
      />

      {/* Input */}
      <View style={{ paddingBottom: 8, paddingTop: 8 }}>
        <ChatInput onSend={handleSend} disabled={isBusy} />
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton icon="arrow-left" onPress={handleBack} iconColor={colors.onSurface} />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: colors.onBackground }]}>
          Character Interview
        </Text>
        <Button
          mode="contained"
          onPress={handleFinish}
          disabled={!canFinish || isBusy || isCreating}
          compact
          style={styles.finishButton}
        >
          Finish
        </Button>
      </View>

      {/* Android: plain View with paddingBottom — KAV breaks edgeToEdge+adjustResize on Android 15+.
          iOS: KeyboardAvoidingView as normal. */}
      {Platform.OS === 'android' ? (
        <View style={[styles.body, { paddingBottom: keyboardPad > 0 ? keyboardPad : insets.bottom }]}>
          {chatBody}
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.body} behavior="padding" keyboardVerticalOffset={insets.top + 60}>
          {chatBody}
        </KeyboardAvoidingView>
      )}

      <CharacterLoadingOverlay visible={isCreating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  finishButton: {
    marginRight: 8,
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
});
