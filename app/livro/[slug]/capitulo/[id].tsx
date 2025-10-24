import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable, Share, FlatList, Dimensions, Animated as RNAnimated } from 'react-native';
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

// Componente memoizado para cada parágrafo
const ParagraphItem = React.memo<{
  paragraph: { number: number; text: string };
  selected: boolean;
  favorito: boolean;
  colors: any;
  onPress: () => void;
  onLongPress: () => void;
  setRef: (ref: View | null) => void;
  highlightOpacity?: RNAnimated.Value;
}>(({
  paragraph,
  selected,
  favorito,
  colors,
  onPress,
  onLongPress,
  setRef,
  highlightOpacity,
}) => {
  const backgroundOpacity = highlightOpacity || new RNAnimated.Value(selected ? 1 : 0);
  
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={[
        styles.paragraphContainer,
        favorito && styles.paragraphFavorite,
      ]}
    >
      {/* Camada de destaque animada */}
      {selected && (
        <RNAnimated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: colors.surfaceLight,
              borderRadius: borderRadius.md,
              opacity: backgroundOpacity,
            },
          ]}
        />
      )}
      <View ref={setRef} style={styles.paragraphContent}>
        <Text style={[styles.paragraphNumber, { color: colors.primary }]}>
          {paragraph.number}
        </Text>
        <View style={styles.paragraphTextContainer}>
          <Text style={[styles.paragraphText, { color: colors.text }]}>
            {paragraph.text}
          </Text>
        </View>
      </View>
      {favorito && (
        <Ionicons 
          name="heart" 
          size={14} 
          color={colors.error} 
          style={styles.favoriteIcon}
        />
      )}
    </Pressable>
  );
});

ParagraphItem.displayName = 'ParagraphItem';

export default function ChapterScreen() {
  const { slug, id, paragraph } = useLocalSearchParams<{ slug: string; id: string; paragraph?: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const paragraphRefs = useRef<{ [key: number]: View | null }>({});
  const highlightOpacity = useRef(new RNAnimated.Value(0)).current;
  const { favorites, isFavorite: checkIsFavorite, addFavorite, removeFavorite } = useFavoritesSync();
  
  const [selectedParagraphs, setSelectedParagraphs] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);

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

  // Scroll até o parágrafo específico quando fornecido
  useEffect(() => {
    if (paragraph && scrollViewRef.current && layoutReady) {
      const paragraphNum = parseInt(paragraph);
      if (!isNaN(paragraphNum)) {
        // Seleciona o parágrafo para destaque temporário
        setSelectedParagraphs([paragraphNum]);
        
        // Anima a opacidade do destaque (fade in)
        highlightOpacity.setValue(1);
        
        // Aguarda um momento para garantir que o layout foi calculado
        const scrollTimer = setTimeout(() => {
          const paragraphView = paragraphRefs.current[paragraphNum];
          if (paragraphView && scrollViewRef.current) {
            paragraphView.measureLayout(
              scrollViewRef.current as any,
              (x, y) => {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
              },
              () => console.log('Erro ao medir parágrafo')
            );
          }
        }, 300);
        
        // Inicia o fade out após 1.5 segundos e remove a seleção ao terminar
        const highlightTimer = setTimeout(() => {
          RNAnimated.timing(highlightOpacity, {
            toValue: 0,
            duration: 800, // Fade out suave de 800ms
            useNativeDriver: true,
          }).start(() => {
            setSelectedParagraphs([]);
          });
        }, 1500);
        
        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(highlightTimer);
        };
      }
    }
  }, [paragraph, currentChapterIndex, layoutReady]);

  const isFavorite = (paragraphNumber: number) => {
    return checkIsFavorite(slug, parseInt(id), paragraphNumber);
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
      
      // Gerar ID de grupo para múltiplas seleções
      const groupId = selectedParagraphs.length > 1 
        ? `${slug}-${parseInt(id)}-${Date.now()}` 
        : undefined;
      
      const groupRange = selectedParagraphs.length > 1 
        ? `${selectedParagraphs[0]}-${selectedParagraphs[selectedParagraphs.length - 1]}`
        : undefined;

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
            groupId,
            groupRange,
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
    const isCurrentChapter = item.chapterId === parseInt(id);
    
    return (
      <View style={[styles.pageContainer, { width }]}>
        <ScrollView
          ref={isCurrentChapter ? scrollViewRef : null}
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
            onLayout={() => {
              if (isCurrentChapter) {
                setLayoutReady(true);
              }
            }}
          >
            {chapter.paragraphs.map((paragraph) => {
              const selected = selectedParagraphs.includes(paragraph.number);
              const favorito = isFavorite(paragraph.number);

              return (
                <ParagraphItem
                  key={paragraph.number}
                  paragraph={paragraph}
                  selected={selected}
                  favorito={favorito}
                  colors={colors}
                  onPress={() => handleParagraphPress(paragraph.number)}
                  onLongPress={() => handleParagraphLongPress(paragraph.number)}
                  setRef={(ref) => {
                    if (isCurrentChapter) {
                      paragraphRefs.current[paragraph.number] = ref;
                    }
                  }}
                  highlightOpacity={highlightOpacity}
                />
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
        scrollEventThrottle={16}
        snapToAlignment="center"
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffsetX / width);
          if (index >= 0 && index < chaptersData.length && index !== currentChapterIndex) {
            const novoCapitulo = chaptersData[index].chapterId;
            router.push(`/livro/${slug}/capitulo/${novoCapitulo}` as any);
          }
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
    paddingBottom: spacing.xl,
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
    position: 'relative',
  },
  paragraphFavorite: {
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  paragraphContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  paragraphTextContainer: {
    flex: 1,
    paddingRight: spacing.lg, // Espaço para o ícone de favorito
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
  },
  favoriteIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
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
