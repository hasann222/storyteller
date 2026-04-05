import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Card, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import type { Project } from '../types/project';
import { genreColors } from '../theme';

interface ProjectCardProps {
  project: Project;
  onPress: (id: string) => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const { colors, fonts } = useTheme();
  const accent = genreColors[project.genre] ?? colors.primary;

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(50)}>
    <Pressable
      onPress={() => onPress(project.id)}
      style={({ pressed }) => pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }}
    >
      <Card style={styles.card} mode="elevated">
        <LinearGradient
          colors={[accent, `${accent}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text
            variant="titleLarge"
            style={[styles.title, { color: '#FFFFFF' }]}
            numberOfLines={1}
          >
            {project.title}
          </Text>
          <View style={styles.genreBadge}>
            <Text
              variant="labelSmall"
              style={{ color: '#FFFFFF', textTransform: 'capitalize' }}
            >
              {project.genre}
            </Text>
          </View>
        </LinearGradient>

        <Card.Content style={styles.content}>
          <Text
            variant="bodyMedium"
            numberOfLines={3}
            style={{ color: colors.onSurface }}
          >
            {project.premise}
          </Text>
          <Text
            variant="labelSmall"
            style={[styles.meta, { color: colors.onSurfaceVariant }]}
          >
            Updated {format(project.updatedAt, 'MMM d, yyyy')}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  genreBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  meta: {
    marginTop: 8,
  },
});
