import { Stack } from 'expo-router';

export default function ProjectLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="character/standard" />
      <Stack.Screen name="character/interview" />
      <Stack.Screen name="character/[charId]" />
    </Stack>
  );
}
