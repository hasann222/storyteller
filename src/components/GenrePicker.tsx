import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Chip, IconButton, useTheme } from 'react-native-paper';
import type { Genre } from '../types/project';
import { DEFAULT_GENRES } from '../types/project';
import { genreColors } from '../theme';
import { useProjectStore } from '../stores/projectStore';

interface GenrePickerProps {
  selected: Genre | null;
  onSelect: (genre: Genre | null) => void;
}

export function GenrePicker({ selected, onSelect }: GenrePickerProps) {
  const { colors } = useTheme();
  const customGenres = useProjectStore((s) => s.customGenres);
  const addCustomGenre = useProjectStore((s) => s.addCustomGenre);
  const deleteCustomGenre = useProjectStore((s) => s.deleteCustomGenre);
  const [adding, setAdding] = useState(false);
  const [newGenre, setNewGenre] = useState('');

  const allGenres = [...DEFAULT_GENRES, ...customGenres];

  const handleSubmitCustom = () => {
    const trimmed = newGenre.trim().toLowerCase();
    if (trimmed && !allGenres.includes(trimmed)) {
      addCustomGenre(trimmed);
      onSelect(trimmed);
    } else if (trimmed) {
      onSelect(trimmed);
    }
    setNewGenre('');
    setAdding(false);
  };

  const handleDeleteCustom = (genre: string) => {
    deleteCustomGenre(genre);
    if (selected === genre) onSelect(null);
  };

  return (
    <View style={styles.container}>
      {/* Built-in genres — no delete */}
      {DEFAULT_GENRES.map((genre) => {
        const isSelected = selected === genre;
        const accent = genreColors[genre] ?? colors.primary;
        return (
          <Chip
            key={genre}
            selected={isSelected}
            onPress={() => onSelect(genre)}
            mode={isSelected ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              isSelected && { backgroundColor: accent },
              !isSelected && { borderColor: colors.outline },
            ]}
            textStyle={[
              { textTransform: 'capitalize' },
              isSelected && { color: '#FFFFFF' },
            ]}
            selectedColor={isSelected ? '#FFFFFF' : colors.onSurface}
            showSelectedCheck={false}
          >
            {genre}
          </Chip>
        );
      })}

      {/* Custom genres — deletable via × button */}
      {customGenres.map((genre) => {
        const isSelected = selected === genre;
        return (
          <Chip
            key={genre}
            selected={isSelected}
            onPress={() => onSelect(genre)}
            onClose={() => handleDeleteCustom(genre)}
            closeIcon="close-circle"
            mode={isSelected ? 'flat' : 'outlined'}
            style={[
              styles.chip,
              isSelected && { backgroundColor: colors.primary },
              !isSelected && { borderColor: colors.outline },
            ]}
            textStyle={[
              { textTransform: 'capitalize' },
              isSelected && { color: '#FFFFFF' },
            ]}
            selectedColor={isSelected ? '#FFFFFF' : colors.onSurface}
            showSelectedCheck={false}
          >
            {genre}
          </Chip>
        );
      })}

      {adding ? (
        <View style={[styles.inputWrap, { borderColor: colors.primary }]}>
          <TextInput
            style={[styles.input, { color: colors.onSurface }]}
            value={newGenre}
            onChangeText={setNewGenre}
            onSubmitEditing={handleSubmitCustom}
            onBlur={() => { setAdding(false); setNewGenre(''); }}
            placeholder="genre name"
            placeholderTextColor={colors.onSurfaceVariant}
            autoFocus
            maxLength={24}
            returnKeyType="done"
          />
        </View>
      ) : (
        <Chip
          icon="plus"
          onPress={() => setAdding(true)}
          mode="outlined"
          style={[styles.chip, { borderColor: colors.outline, borderStyle: 'dashed' }]}
          textStyle={{ color: colors.onSurfaceVariant }}
        >
          Custom
        </Chip>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    minWidth: 100,
  },
  input: {
    fontSize: 14,
    padding: 0,
  },
});
