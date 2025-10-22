import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable, Share, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getBookBySlug, getChapter } from '@/lib/data';
import { FavoriteParagraph, Chapter } from '@/lib/types';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getColors, spacing, typography, borderRadius } from '@/lib/theme/tokens';
import { useFavoritesSync } from '@/lib/hooks/useFavoritesSync';

const { width } = Dimensions.get('window');

export default function ChapterScreen() {
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const flatListRef = useRef<FlatList>(null);
  const { favorites, isFavorite: checkIsFavorite, addFavorite, removeFavorite } = useFavoritesSync();
  
  const [selectedParagraphs, setSelectedParagraphs] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const book = getBookBySlug(slug);

  // Preparar lista de capítulos para navegação
  const chaptersData = book?.data.chapters.map(cap => ({
    chapterId: cap.chapter,
    data: cap,
  })) || [];

  // Encontrar índice do capítulo atual
  useEffect(() => {
    const index = chaptersData.findIndex(c => c.chapterId === parseInt(id));
    if (index !== -1 && index !== currentChapterIndex) {
      setCurrentChapterIndex(index);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      }, 100);
    }
  }, [id]);

  // Resetar seleção quando mudar de capítulo
  useEffect(() => {
    setSelectedParagraphs([]);
    setShowMenu(false);
    setLongPressActive(false);
  }, [id]);

  const isFavorite = (paragraphNumber: number) => {
    return checkIsFavorite(slug, parseInt(id), paragraphNumber);
  };

  const handleChapterChange = (index: number) => {
    if (index >= 0 && index < chaptersData.length) {
      const novoCapitulo = chaptersData[index].chapterId;
      router.push(`/livro/${slug}/capitulo/${novoCapitulo}` as any);
    }
  };

  // Handlers de parágrafo com suporte a seleção múltipla
  const handleParagraphPress = (paragraphNum: number) => {
    if (longPressActive) {
      // Modo seleção múltipla
      if (selectedParagraphs.includes(paragraphNum)) {
        setSelectedParagraphs(prev => prev.filter(v => v !== paragraphNum));
      } else {
        setSelectedParagraphs(prev => [...prev, paragraphNum].sort((a, b) => a - b));
      }
    } else {
      // Toque simples - seleciona apenas um
      if (selectedParagraphs.length === 1 && selectedParagraphs[0] === paragraphNum) {
        setShowMenu(!showMenu);
      } else {
        setSelectedParagraphs([paragraphNum]);
        setShowMenu(true);
      }
    }
  };

  const handleParagraphLongPress = (paragraphNum: number) => {
    setLongPressActive(true);
    if (!selectedParagraphs.includes(paragraphNum)) {
      setSelectedParagraphs(prev => [...prev, paragraphNum].sort((a, b) => a - b));
    }
    setShowMenu(true);
  };

  const handleCopyParagraphs = async () => {
    if (selectedParagraphs.length === 0 || !book) return;
    
    const chapter = getChapter(slug, parseInt(id));
    if (!chapter) return;
    
    const textoParts = selectedParagraphs.map(num => {
      const paragraph = chapter.paragraphs.find(p => p.number === num);
      return paragraph ? `${num}. ${paragraph.text}` : '';
    }).filter(Boolean);

    const textoCompleto = selectedParagraphs.length === 1
      ? `${book.title} - ${chapter.name}\n\n${textoParts[0]}`
      : `${book.title} - ${chapter.name}\nParágrafos ${selectedParagraphs[0]}-${selectedParagraphs[selectedParagraphs.length - 1]}\n\n${textoParts.join('\n\n')}`;

    await Clipboard.setStringAsync(textoCompleto);
    Alert.alert('Copiado!', `${selectedParagraphs.length} parágrafo(s) copiado(s).`);
    handleCloseMenu();
  };

  const handleFavoriteParagraphs = async () => {
    if (selectedParagraphs.length === 0 || !book) return;
    
    const chapter = getChapter(slug, parseInt(id));
    if (!chapter) return;
    
    try {
      let addedCount = 0;
      let removedCount = 0;

      for (const paragraphNum of selectedParagraphs) {
        const paragraph = chapter.paragraphs.find(p => p.number === paragraphNum);
        if (!paragraph) continue;

        const existingFav = favorites.find(
          fav => fav.bookSlug === slug && 
                 fav.chapterId === parseInt(id) && 
                 fav.paragraphNumber === paragraphNum
        );

        if (existingFav) {
          await removeFavorite(existingFav);
          removedCount++;
        } else {
          const newFavorite: FavoriteParagraph = {
            bookSlug: slug,
            bookTitle: book.title,
            chapterId: parseInt(id),
            chapterName: chapter.name,
            paragraphNumber: paragraphNum,
            paragraphText: paragraph.text,
            timestamp: Date.now(),
            type: 'livro',
          };
          await addFavorite(newFavorite);
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        Alert.alert('Salvo!', `${addedCount} parágrafo(s) adicionado(s) aos favoritos.`);
      } else if (removedCount > 0) {
        Alert.alert('Removido', `${removedCount} parágrafo(s) removido(s) dos favoritos.`);
      }
      
      handleCloseMenu();
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os favoritos.');
    }
  };

  const handleShareParagraphs = async () => {
    if (selectedParagraphs.length === 0 || !book) return;
    
    const chapter = getChapter(slug, parseInt(id));
    if (!chapter) return;
    
    const textoParts = selectedParagraphs.map(num => {
      const paragraph = chapter.paragraphs.find(p => p.number === num);
      return paragraph ? `${num}. ${paragraph.text}` : '';
    }).filter(Boolean);

    const textoCompleto = selectedParagraphs.length === 1
      ? `${book.title} - ${chapter.name}\n\n${textoParts[0]}`
      : `${book.title} - ${chapter.name}\nParágrafos ${selectedParagraphs[0]}-${selectedParagraphs[selectedParagraphs.length - 1]}\n\n${textoParts.join('\n\n')}`;

    try {
      await Share.share({ message: textoCompleto });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
    handleCloseMenu();
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setSelectedParagraphs([]);
    setLongPressActive(false);
  };

  // Renderizar cada página de capítulo
  const renderChapter = ({ item }: { item: { chapterId: number; data: Chapter } }) => {
    const chapter = item.data;
    
    return (
      <View style={[styles.pageContainer, { width }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header do capítulo */}
          <Animated.View
            entering={FadeInDown.duration(600).easing(Easing.out(Easing.cubic))}
            style={styles.header}
          >
            <Text style={[styles.chapterNumber, { color: colors.textSecondary }]}>
              Capítulo {chapter.chapter}
            </Text>
            <Text style={[styles.chapterName, { color: colors.text }]}>
              {chapter.name}
            </Text>
            <Text style={[styles.bookTitle, { color: colors.textMuted }]}>
              {book?.title}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          </Animated.View>

          {/* Parágrafos - estilo natural com seleção múltipla */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200).easing(Easing.out(Easing.ease))}
            style={styles.paragraphsContainer}
          >
            {chapter.paragraphs.map((paragraph) => {
              const selected = selectedParagraphs.includes(paragraph.number);
              const favorito = isFavorite(paragraph.number);

              return (
                <Pressable
                  key={paragraph.number}
                  onPress={() => handleParagraphPress(paragraph.number)}
                  onLongPress={() => handleParagraphLongPress(paragraph.number)}
                  delayLongPress={300}
                  style={[
                    styles.paragraphContainer,
                    selected && { backgroundColor: colors.surfaceLight },
                    favorito && styles.paragraphFavorite,
                  ]}
                >
                  <View style={styles.paragraphContent}>
                    <Text style={[styles.paragraphNumber, { color: colors.primary }]}>
                      {paragraph.number}
                    </Text>
                    <Text style={[styles.paragraphText, { color: colors.text }]}>
                      {paragraph.text}
                    </Text>
                    {favorito && (
                      <Ionicons 
                        name="heart" 
                        size={14} 
                        color={colors.error} 
                        style={styles.favoriteIcon}
                      />
                    )}
                    {selected && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={colors.primary} 
                        style={styles.selectedIcon}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </Animated.View>
        </ScrollView>
      </View>
    );
  };

  if (!book) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Livro não encontrado
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Menu de ações flutuante - fixo no topo */}
      {showMenu && selectedParagraphs.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.menuContainerFixed,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              {selectedParagraphs.length} parágrafo{selectedParagraphs.length > 1 ? 's' : ''} selecionado{selectedParagraphs.length > 1 ? 's' : ''}
            </Text>
            <Pressable onPress={handleCloseMenu} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.menuActions}>
            <Pressable 
              style={[styles.menuButton, { backgroundColor: colors.surfaceLight }]} 
              onPress={handleCopyParagraphs}
            >
              <Ionicons name="copy-outline" size={22} color={colors.primary} />
              <Text style={[styles.menuButtonText, { color: colors.text }]}>Copiar</Text>
            </Pressable>

            <Pressable 
              style={[styles.menuButton, { backgroundColor: colors.surfaceLight }]} 
              onPress={handleFavoriteParagraphs}
            >
              <Ionicons 
                name="heart" 
                size={22} 
                color={colors.error} 
              />
              <Text style={[styles.menuButtonText, { color: colors.text }]}>Favoritos</Text>
            </Pressable>

            <Pressable 
              style={[styles.menuButton, { backgroundColor: colors.surfaceLight }]} 
              onPress={handleShareParagraphs}
            >
              <Ionicons name="share-outline" size={22} color={colors.primary} />
              <Text style={[styles.menuButtonText, { color: colors.text }]}>Compartilhar</Text>
            </Pressable>
          </View>

          {longPressActive && (
            <Text style={[styles.menuHint, { color: colors.textMuted }]}>
              💡 Toque em outros parágrafos para adicionar à seleção
            </Text>
          )}
        </Animated.View>
      )}

      {/* FlatList horizontal com paginação para swipe suave entre capítulos */}
      <FlatList
        ref={flatListRef}
        data={chaptersData}
        renderItem={renderChapter}
        keyExtractor={(item) => `chapter-${item.chapterId}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          handleChapterChange(index);
        }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={currentChapterIndex}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 100);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 80, // Espaço para o menu fixo
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  chapterNumber: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  chapterName: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  bookTitle: {
    ...typography.small,
    marginBottom: spacing.md,
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  paragraphsContainer: {
    gap: spacing.xs,
  },
  paragraphContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  paragraphFavorite: {
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  paragraphContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  paragraphNumber: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: spacing.md,
    marginTop: 2,
    minWidth: 22,
  },
  paragraphText: {
    ...typography.body,
    lineHeight: 26,
    fontSize: 16,
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: spacing.sm,
    marginTop: 4,
  },
  selectedIcon: {
    marginLeft: spacing.xs,
    marginTop: 4,
  },
  // Menu fixo no topo
  menuContainerFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: spacing.lg,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  menuTitle: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 16,
  },
  menuActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menuButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  menuButtonText: {
    ...typography.small,
    fontWeight: '600',
    fontSize: 12,
  },
  menuHint: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
