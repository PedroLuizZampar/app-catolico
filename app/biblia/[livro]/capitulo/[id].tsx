import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Share, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getColors, spacing, typography, borderRadius } from '@/lib/theme/tokens';
import { getLivroBiblicoBySlug, getCapituloBiblia } from '@/lib/bibliaData';
import { Versiculo, FavoriteParagraph, CapituloBiblia } from '@/lib/types';
import { useFavoritesSync } from '@/lib/hooks/useFavoritesSync';

const { width } = Dimensions.get('window');

export default function CapituloBibliaScreen() {
  const { livro: livroSlug, id } = useLocalSearchParams<{ livro: string; id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const flatListRef = useRef<FlatList>(null);
  const { favorites, isFavorite: checkIsFavorite, addFavorite, removeFavorite } = useFavoritesSync();
  
  const [selectedVersiculos, setSelectedVersiculos] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const livro = getLivroBiblicoBySlug(livroSlug);

  // Preparar lista de capítulos para navegação
  const capitulosData = livro?.capitulos.map(cap => ({
    capitulo: cap.capitulo,
    data: cap,
  })) || [];

  // Encontrar índice do capítulo atual
  useEffect(() => {
    const index = capitulosData.findIndex(c => c.capitulo === parseInt(id));
    if (index !== -1 && index !== currentChapterIndex) {
      setCurrentChapterIndex(index);
      // Scroll para o capítulo correto no FlatList
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      }, 100);
    }
  }, [id]);

  // Resetar seleção quando mudar de capítulo
  useEffect(() => {
    setSelectedVersiculos([]);
    setShowMenu(false);
    setLongPressActive(false);
  }, [id]);

  const isFavorite = (versiculoNum: number) => {
    return checkIsFavorite(livroSlug, parseInt(id), versiculoNum);
  };

  const isSelected = (versiculoNum: number) => {
    return selectedVersiculos.includes(versiculoNum);
  };

  const handleChapterChange = (index: number) => {
    if (index >= 0 && index < capitulosData.length) {
      const novoCapitulo = capitulosData[index].capitulo;
      router.push(`/biblia/${livroSlug}/capitulo/${novoCapitulo}` as any);
    }
  };

  // Handlers de versículo com suporte a seleção múltipla
  const handleVersiculoPress = (versiculoNum: number) => {
    if (longPressActive) {
      // Modo seleção múltipla
      if (selectedVersiculos.includes(versiculoNum)) {
        setSelectedVersiculos(prev => prev.filter(v => v !== versiculoNum));
      } else {
        setSelectedVersiculos(prev => [...prev, versiculoNum].sort((a, b) => a - b));
      }
    } else {
      // Toque simples - seleciona apenas um
      if (selectedVersiculos.length === 1 && selectedVersiculos[0] === versiculoNum) {
        setShowMenu(!showMenu);
      } else {
        setSelectedVersiculos([versiculoNum]);
        setShowMenu(true);
      }
    }
  };

  const handleVersiculoLongPress = (versiculoNum: number) => {
    setLongPressActive(true);
    if (!selectedVersiculos.includes(versiculoNum)) {
      setSelectedVersiculos(prev => [...prev, versiculoNum].sort((a, b) => a - b));
    }
    setShowMenu(true);
  };

  const handleCopyVersiculos = async () => {
    if (selectedVersiculos.length === 0 || !livro) return;
    
    const capitulo = getCapituloBiblia(livroSlug, parseInt(id));
    if (!capitulo) return;
    
    const textoParts = selectedVersiculos.map(num => {
      const versiculo = capitulo.versiculos.find((v: Versiculo) => v.versiculo === num);
      return versiculo ? `${num} ${versiculo.texto}` : '';
    }).filter(Boolean);

    const textoCompleto = selectedVersiculos.length === 1
      ? `${livro.nome} ${capitulo.capitulo}:${selectedVersiculos[0]} - ${textoParts[0].substring(textoParts[0].indexOf(' ') + 1)}`
      : `${livro.nome} ${capitulo.capitulo}:${selectedVersiculos[0]}-${selectedVersiculos[selectedVersiculos.length - 1]}\n\n${textoParts.join('\n')}`;

    await Clipboard.setStringAsync(textoCompleto);
    Alert.alert('Copiado!', `${selectedVersiculos.length} versículo(s) copiado(s).`);
    handleCloseMenu();
  };

  const handleFavoriteVersiculos = async () => {
    if (selectedVersiculos.length === 0 || !livro) return;
    
    const capitulo = getCapituloBiblia(livroSlug, parseInt(id));
    if (!capitulo) return;
    
    try {
      let addedCount = 0;
      let removedCount = 0;

      for (const versiculoNum of selectedVersiculos) {
        const versiculo = capitulo.versiculos.find((v: Versiculo) => v.versiculo === versiculoNum);
        if (!versiculo) continue;

        const existingFav = favorites.find(
          fav => fav.bookSlug === livroSlug && 
                 fav.chapterId === parseInt(id) && 
                 fav.paragraphNumber === versiculoNum
        );

        if (existingFav) {
          await removeFavorite(existingFav);
          removedCount++;
        } else {
          const newFavorite: FavoriteParagraph = {
            bookSlug: livroSlug,
            bookTitle: livro.nome,
            chapterId: parseInt(id),
            chapterName: `Capítulo ${capitulo.capitulo}`,
            paragraphNumber: versiculoNum,
            paragraphText: versiculo.texto,
            timestamp: Date.now(),
            type: 'biblia',
          };
          await addFavorite(newFavorite);
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        Alert.alert('Salvo!', `${addedCount} versículo(s) adicionado(s) aos favoritos.`);
      } else if (removedCount > 0) {
        Alert.alert('Removido', `${removedCount} versículo(s) removido(s) dos favoritos.`);
      }
      
      handleCloseMenu();
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os favoritos.');
    }
  };

  const handleShareVersiculos = async () => {
    if (selectedVersiculos.length === 0 || !livro) return;
    
    const capitulo = getCapituloBiblia(livroSlug, parseInt(id));
    if (!capitulo) return;
    
    const textoParts = selectedVersiculos.map(num => {
      const versiculo = capitulo.versiculos.find((v: Versiculo) => v.versiculo === num);
      return versiculo ? `${num} ${versiculo.texto}` : '';
    }).filter(Boolean);

    const textoCompleto = selectedVersiculos.length === 1
      ? `${livro.nome} ${capitulo.capitulo}:${selectedVersiculos[0]}\n\n${textoParts[0].substring(textoParts[0].indexOf(' ') + 1)}`
      : `${livro.nome} ${capitulo.capitulo}:${selectedVersiculos[0]}-${selectedVersiculos[selectedVersiculos.length - 1]}\n\n${textoParts.join('\n')}`;

    try {
      await Share.share({ message: textoCompleto });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
    handleCloseMenu();
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setSelectedVersiculos([]);
    setLongPressActive(false);
  };

  // Renderizar cada página de capítulo
  const renderChapter = ({ item }: { item: { capitulo: number; data: CapituloBiblia } }) => {
    const capitulo = item.data;
    
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
              Capítulo {capitulo.capitulo}
            </Text>
            <Text style={[styles.bookTitle, { color: colors.text }]}>{livro?.nome}</Text>
            <Text style={[styles.testament, { color: colors.textMuted }]}>
              {livro?.testamento} Testamento
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          </Animated.View>

          {/* Versículos */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200).easing(Easing.out(Easing.ease))}
            style={styles.versiculosContainer}
          >
            {capitulo.versiculos.map((versiculo: Versiculo) => {
              const selected = selectedVersiculos.includes(versiculo.versiculo);
              const favorito = favorites.some(
                fav => fav.bookSlug === livroSlug && 
                       fav.chapterId === capitulo.capitulo && 
                       fav.paragraphNumber === versiculo.versiculo
              );

              return (
                <Pressable
                  key={versiculo.versiculo}
                  onPress={() => handleVersiculoPress(versiculo.versiculo)}
                  onLongPress={() => handleVersiculoLongPress(versiculo.versiculo)}
                  delayLongPress={300}
                  style={[
                    styles.versiculoContainer,
                    selected && { backgroundColor: colors.surfaceLight },
                    favorito && styles.versiculoFavorito,
                  ]}
                >
                  <View style={styles.versiculoContent}>
                    <Text style={[styles.versiculoNumber, { color: colors.primary }]}>
                      {versiculo.versiculo}
                    </Text>
                    <Text style={[styles.versiculoTexto, { color: colors.text }]}>
                      {versiculo.texto}
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

  if (!livro) {
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
      {showMenu && selectedVersiculos.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.menuContainerFixed,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              {selectedVersiculos.length} versículo{selectedVersiculos.length > 1 ? 's' : ''} selecionado{selectedVersiculos.length > 1 ? 's' : ''}
            </Text>
            <Pressable onPress={handleCloseMenu} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.menuActions}>
            <Pressable 
              style={[styles.menuButton, { backgroundColor: colors.surfaceLight }]} 
              onPress={handleCopyVersiculos}
            >
              <Ionicons name="copy-outline" size={22} color={colors.primary} />
              <Text style={[styles.menuButtonText, { color: colors.text }]}>Copiar</Text>
            </Pressable>

            <Pressable 
              style={[styles.menuButton, { backgroundColor: colors.surfaceLight }]} 
              onPress={handleFavoriteVersiculos}
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
              onPress={handleShareVersiculos}
            >
              <Ionicons name="share-outline" size={22} color={colors.primary} />
              <Text style={[styles.menuButtonText, { color: colors.text }]}>Compartilhar</Text>
            </Pressable>
          </View>

          {longPressActive && (
            <Text style={[styles.menuHint, { color: colors.textMuted }]}>
              💡 Toque em outros versículos para adicionar à seleção
            </Text>
          )}
        </Animated.View>
      )}

      {/* FlatList horizontal com paginação para swipe suave entre capítulos */}
      <FlatList
        ref={flatListRef}
        data={capitulosData}
        renderItem={renderChapter}
        keyExtractor={(item) => `chapter-${item.capitulo}`}
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
          // Tentar novamente após um delay
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 80, // Espaço para o menu fixo
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
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
  bookTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  testament: {
    ...typography.small,
    marginBottom: spacing.md,
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  versiculosContainer: {
    gap: spacing.xs,
  },
  versiculoContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  versiculoFavorito: {
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  versiculoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  versiculoNumber: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: spacing.md,
    marginTop: 2,
    minWidth: 22,
  },
  versiculoTexto: {
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
