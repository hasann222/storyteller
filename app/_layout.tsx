import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '../src/theme';
import { useProjectStore } from '../src/stores/projectStore';
import { useCharacterStore } from '../src/stores/characterStore';
import { useSceneStore } from '../src/stores/sceneStore';
import { useChatStore } from '../src/stores/chatStore';
import {
  mockProjects,
  mockCharacters,
  mockScenes,
  mockChatMessages,
} from '../src/data/mock';

SplashScreen.preventAutoHideAsync();

function useSeedMockData() {
  const projects = useProjectStore((s) => s.projects);
  const hydrated = useProjectStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated || projects.length > 0) return;

    // Seed projects
    for (const p of mockProjects) {
      useProjectStore.getState().addProject(p.title, p.premise, p.genre);
    }
    // Overwrite with mock IDs and timestamps for stable references
    useProjectStore.setState({ projects: mockProjects });
    useCharacterStore.setState({ characters: mockCharacters });
    useSceneStore.setState({ scenes: mockScenes });
    useChatStore.setState({ messages: mockChatMessages });
  }, [hydrated, projects.length]);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  useSeedMockData();

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutReady}>
        <PaperProvider theme={theme}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="new-project"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="project/[id]" />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
