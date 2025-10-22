import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavoriteParagraph } from '@/lib/types';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getColors, spacing, typography, borderRadius, shadows } from '@/lib/theme/tokens';
import { useFavoritesSync } from '@/lib/hooks/useFavoritesSync';

type FilterType = 'todos' | 'biblia' | 'livro';
type SortType = 'recente' | 'antigo' | 'livro' | 'capitulo';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { favorites, loading, removeFavorite: removeFromSync, clearAll } = useFavoritesSync();

  const [filterType, setFilterType] = useState<FilterType>('todos');
  const [sortType, setSortType] = useState<SortType>('recente');

  // Filtrar e ordenar favoritos
  const processedFavorites = useMemo(() => {
    let filtered = [...favorites];

    // Aplicar filtro por tipo
    if (filterType === 'biblia') {
      filtered = filtered.filter(f => f.type === 'biblia');
    } else if (filterType === 'livro') {
      filtered = filtered.filter(f => f.type === 'livro');
    }

    // Aplicar ordenação
    switch (sortType) {
      case 'recente':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'antigo':
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'livro':
        filtered.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
        break;
      case 'capitulo':
        filtered.sort((a, b) => {
          if (a.bookSlug === b.bookSlug) {
            return a.chapterId - b.chapterId;
          }
          return a.bookTitle.localeCompare(b.bookTitle);
        });
        break;
    }

    return filtered;
  }, [favorites, filterType, sortType]);

  const handleRemoveFavorite = async (favorite: FavoriteParagraph) => {
    Alert.alert(
      'Remover favorito',
      'Deseja remover este parágrafo dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromSync(favorite);
            } catch (error) {
              console.error('Erro ao remover favorito:', error);
              Alert.alert('Erro', 'Não foi possível remover o favorito');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpar favoritos',
      'Deseja remover todos os favoritos? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAll();
            } catch (error) {
              console.error('Erro ao limpar favoritos:', error);
              Alert.alert('Erro', 'Não foi possível limpar os favoritos');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {favorites.length === 0 ? (
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={styles.emptyState}
        >
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum favorito</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Adicione parágrafos aos favoritos para acessá-los rapidamente aqui
          </Text>
        </Animated.View>
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <Text style={[styles.count, { color: colors.textSecondary }]}>
              {processedFavorites.length} {processedFavorites.length === 1 ? 'favorito' : 'favoritos'}
            </Text>
            <Pressable 
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.clearText, { color: colors.error }]}>Limpar tudo</Text>
            </Pressable>
          </View>

          {/* Filtros */}
          <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Filtrar:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              <Pressable
                style={[
                  styles.filterChip,
                  { backgroundColor: filterType === 'todos' ? colors.primary : colors.surface, borderColor: colors.border }
                ]}
                onPress={() => setFilterType('todos')}
              >
                <Ionicons 
                  name="apps-outline" 
                  size={16} 
                  color={filterType === 'todos' ? '#fff' : colors.text} 
                />
                <Text style={[styles.filterChipText, { color: filterType === 'todos' ? '#fff' : colors.text }]}>
                  Todos
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  { backgroundColor: filterType === 'biblia' ? colors.primary : colors.surface, borderColor: colors.border }
                ]}
                onPress={() => setFilterType('biblia')}
              >
                <Ionicons 
                  name="book-outline" 
                  size={16} 
                  color={filterType === 'biblia' ? '#fff' : colors.text} 
                />
                <Text style={[styles.filterChipText, { color: filterType === 'biblia' ? '#fff' : colors.text }]}>
                  Bíblia
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  { backgroundColor: filterType === 'livro' ? colors.primary : colors.surface, borderColor: colors.border }
                ]}
                onPress={() => setFilterType('livro')}
              >
                <Ionicons 
                  name="library-outline" 
                  size={16} 
                  color={filterType === 'livro' ? '#fff' : colors.text} 
                />
                <Text style={[styles.filterChipText, { color: filterType === 'livro' ? '#fff' : colors.text }]}>
                  Livros
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Ordenação */}
          <View style={[styles.sortContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Ordenar:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              <Pressable
                style={[
                  styles.sortChip,
                  { backgroundColor: sortType === 'recente' ? colors.surfaceLight : colors.surface, borderColor: sortType === 'recente' ? colors.primary : colors.border }
                ]}
                onPress={() => setSortType('recente')}
              >
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color={sortType === 'recente' ? colors.primary : colors.textSecondary} 
                />
                <Text style={[styles.sortChipText, { color: sortType === 'recente' ? colors.primary : colors.textSecondary }]}>
                  Mais recentes
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.sortChip,
                  { backgroundColor: sortType === 'antigo' ? colors.surfaceLight : colors.surface, borderColor: sortType === 'antigo' ? colors.primary : colors.border }
                ]}
                onPress={() => setSortType('antigo')}
              >
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color={sortType === 'antigo' ? colors.primary : colors.textSecondary} 
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
                <Text style={[styles.sortChipText, { color: sortType === 'antigo' ? colors.primary : colors.textSecondary }]}>
                  Mais antigos
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.sortChip,
                  { backgroundColor: sortType === 'livro' ? colors.surfaceLight : colors.surface, borderColor: sortType === 'livro' ? colors.primary : colors.border }
                ]}
                onPress={() => setSortType('livro')}
              >
                <Ionicons 
                  name="list-outline" 
                  size={14} 
                  color={sortType === 'livro' ? colors.primary : colors.textSecondary} 
                />
                <Text style={[styles.sortChipText, { color: sortType === 'livro' ? colors.primary : colors.textSecondary }]}>
                  Por livro
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.sortChip,
                  { backgroundColor: sortType === 'capitulo' ? colors.surfaceLight : colors.surface, borderColor: sortType === 'capitulo' ? colors.primary : colors.border }
                ]}
                onPress={() => setSortType('capitulo')}
              >
                <Ionicons 
                  name="reorder-four-outline" 
                  size={14} 
                  color={sortType === 'capitulo' ? colors.primary : colors.textSecondary} 
                />
                <Text style={[styles.sortChipText, { color: sortType === 'capitulo' ? colors.primary : colors.textSecondary }]}>
                  Por capítulo
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: spacing.xl + insets.bottom }
            ]}
            showsVerticalScrollIndicator={false}
          >
            {processedFavorites.map((favorite, index) => (
              <Animated.View
                key={`${favorite.bookSlug}-${favorite.chapterId}-${favorite.paragraphNumber}-${index}`}
                entering={FadeInDown.duration(300).delay(index * 50)}
              >
                <Pressable
                  style={[styles.favoriteCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    const path = favorite.type === 'biblia' 
                      ? `/biblia/${favorite.bookSlug}/capitulo/${favorite.chapterId}`
                      : `/livro/${favorite.bookSlug}/capitulo/${favorite.chapterId}`;
                    router.push(path as any);
                  }}
                >
                  <View style={styles.favoriteHeader}>
                    <Text style={[styles.bookTitle, { color: colors.text }]}>{ favorite.bookTitle}</Text>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleRemoveFavorite(favorite)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                    </Pressable>
                  </View>
                  
                  <Text style={[styles.chapterInfo, { color: colors.textMuted }]}>
                    Cap. {favorite.chapterId}: {favorite.chapterName}
                  </Text>
                  
                  <View style={[styles.paragraphBadge, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                    <Text style={[styles.paragraphNumber, { color: colors.textSecondary }]}>
                      #{favorite.paragraphNumber}
                    </Text>
                  </View>
                  
                  <Text style={[styles.paragraphText, { color: colors.textSecondary }]} numberOfLines={4}>
                    {favorite.paragraphText}
                  </Text>
                  
                  <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                    {new Date(favorite.timestamp).toLocaleDateString('pt-BR')}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  count: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  clearText: {
    ...typography.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  favoriteCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  bookTitle: {
    ...typography.body,
    fontWeight: '500',
    flex: 1,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  chapterInfo: {
    ...typography.small,
    marginBottom: spacing.sm,
  },
  paragraphBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  paragraphNumber: {
    ...typography.small,
    fontWeight: '500',
  },
  paragraphText: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  timestamp: {
    ...typography.small,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sortContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterLabel: {
    ...typography.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    gap: spacing.xs,
    borderWidth: 1,
  },
  filterChipText: {
    ...typography.small,
    fontWeight: '600',
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    gap: 4,
    borderWidth: 1,
  },
  sortChipText: {
    ...typography.small,
    fontSize: 11,
    fontWeight: '500',
  },
});
