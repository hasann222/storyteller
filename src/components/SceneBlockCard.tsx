import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import type { SceneBlock } from '../types/scene';

interface SceneBlockCardProps {
  scene: SceneBlock;
  index: number;
  drag?: () => void;
  isActive?: boolean;
  isSelecting?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEnterSelect?: (id: string) => void;
  onOpen?: () => void;
}

function SceneBlockCardInner({
  scene,
  index,
  drag,
  isActive,
  isSelecting,
  isSelected,
  onSelect,
  onEnterSelect,
  onOpen,
}: SceneBlockCardProps) {
  const { colors } = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          borderLeftColor:
            isSelecting && !isSelected ? colors.outlineVariant : colors.primary,
          borderColor: isSelected ? colors.primary : colors.outlineVariant,
          opacity: isActive ? 0.9 : isSelecting && !isSelected ? 0.65 : 1,
          backgroundColor: isSelected
            ? 'rgba(196, 123, 43, 0.12)'
            : undefined,
        },
      ]}
      mode="outlined"
    >
      <View style={styles.row}>
        {/* Drag handle / selection checkbox */}
        <Pressable
          onLongPress={!isSelecting ? drag : undefined}
          onPress={isSelecting ? () => onSelect?.(scene.id) : undefined}
          style={styles.dragHandle}
        >
          <IconButton
            icon={
              isSelecting
                ? isSelected
                  ? 'check-circle'
                  : 'circle-outline'
                : 'drag'
            }
            size={20}
            iconColor={
              isSelecting
                ? isSelected
                  ? colors.primary
                  : colors.outline
                : colors.outline
            }
          />
        </Pressable>

        {/* Card content — tap to open editor, long-press to enter selection */}
        <Pressable
          style={styles.content}
          onPress={() => {
            if (isSelecting) {
              onSelect?.(scene.id);
            } else {
              onOpen?.();
            }
          }}
          onLongPress={() => {
            if (!isSelecting) {
              onEnterSelect?.(scene.id);
            }
          }}
        >
          {/* Scene number + title */}
          <View style={styles.titleRow}>
            <View
              style={[styles.numberBadge, { backgroundColor: colors.primaryContainer }]}
            >
              <Text
                variant="labelSmall"
                style={{ color: colors.onPrimaryContainer, fontWeight: '700' }}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              variant="titleSmall"
              style={{ flex: 1, color: colors.onSurface }}
              numberOfLines={1}
            >
              {scene.title}
            </Text>
            <IconButton
              icon="chevron-right"
              size={18}
              iconColor={colors.outline}
              style={styles.openBtn}
            />
          </View>

          {/* Narration preview */}
          <Text
            variant="bodySmall"
            style={{ color: colors.onSurfaceVariant, marginTop: 4 }}
            numberOfLines={2}
          >
            {scene.narration}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

export const SceneBlockCard = React.memo(SceneBlockCardInner);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dragHandle: {
    paddingTop: 8,
    paddingLeft: 2,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openBtn: {
    margin: 0,
  },
});
