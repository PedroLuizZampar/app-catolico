import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getColors, spacing, borderRadius, typography, shadows } from '@/lib/theme/tokens';
import { BookData, FavoriteParagraph } from '@/lib/types';
import { BOOKS } from '@/lib/data';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { MeditationShareCard } from '@/components/MeditationShareCard';
import { useFavoritesSync } from '@/lib/hooks/useFavoritesSync';

// Função para pegar um parágrafo aleatório de qualquer livro
const getRandomParagraph = () => {
  const randomBook = BOOKS[Math.floor(Math.random() * BOOKS.length)];
  const randomChapter = randomBook.data.chapters[
    Math.floor(Math.random() * randomBook.data.chapters.length)
  ];
  const randomParagraph = randomChapter.paragraphs[
    Math.floor(Math.random() * randomChapter.paragraphs.length)
  ];

  return {
    text: randomParagraph.text,
    number: randomParagraph.number,
    chapterNumber: randomChapter.chapter,
    chapterName: randomChapter.name,
    bookTitle: randomBook.title,
    bookSlug: randomBook.slug,
    bookIcon: randomBook.icon,
    bookColor: randomBook.color,
    bookAuthor: randomBook.author,
  };
};

export default function MeditacaoScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [meditation, setMeditation] = useState(() => getRandomParagraph());
  const [refreshCount, setRefreshCount] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  
  // Hooks de favoritos
  const { favorites, addFavorite, removeFavorite } = useFavoritesSync();
  
  // Verificar se a meditação atual é favorita
  const isFavorited = useMemo(() => {
    return favorites.some(
      fav => fav.bookSlug === meditation.bookSlug &&
             fav.chapterId === meditation.chapterNumber &&
             fav.paragraphNumber === meditation.number
    );
  }, [favorites, meditation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setMeditation(getRandomParagraph());
      setRefreshCount(prev => prev + 1);
      setRefreshing(false);
    }, 500);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      setIsSharing(true);
      
      // Verifica se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo');
        return;
      }

      // Captura a view como imagem
      if (shareCardRef.current) {
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1,
        });

        // Compartilha a imagem
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartilhar Meditação',
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a meditação');
    } finally {
      setIsSharing(false);
    }
  }, []);

  const handleToggleFavorite = useCallback(async () => {
    try {
      if (isFavorited) {
        // Remover favorito
        const toRemove = favorites.find(
          fav => fav.bookSlug === meditation.bookSlug &&
                 fav.chapterId === meditation.chapterNumber &&
                 fav.paragraphNumber === meditation.number
        );
        if (toRemove) {
          await removeFavorite(toRemove);
          Alert.alert('Removido', 'Meditação removida dos favoritos');
        }
      } else {
        // Adicionar favorito
        const newFavorite: FavoriteParagraph = {
          bookSlug: meditation.bookSlug,
          bookTitle: meditation.bookTitle,
          chapterId: meditation.chapterNumber,
          chapterName: meditation.chapterName,
          paragraphNumber: meditation.number,
          paragraphText: meditation.text,
          timestamp: Date.now(),
          type: 'livro',
        };
        await addFavorite(newFavorite);
        Alert.alert('Salvo!', 'Meditação adicionada aos favoritos');
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Não foi possível salvar o favorito');
    }
  }, [isFavorited, meditation, favorites]);

  const handleOpenInBook = useCallback(() => {
    router.push({
      pathname: `/livro/${meditation.bookSlug}/capitulo/${meditation.chapterNumber}`,
      params: { paragraph: meditation.number.toString() }
    } as any);
  }, [meditation, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.sm + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Card de Instrução */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[
            styles.instructionCard,
            shadows.sm,
            { backgroundColor: colors.surfaceLight, borderColor: colors.border }
          ]}
        >
          <Ionicons name="bulb-outline" size={24} color={colors.primary} />
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            Puxe para baixo para uma nova reflexão
          </Text>
        </Animated.View>

        {/* Card Principal de Meditação */}
        <Animated.View
          key={refreshCount} // Força re-animação ao atualizar
          entering={FadeIn.duration(600)}
        >
          <Pressable
            onPress={handleOpenInBook}
            style={[
              styles.meditationCard,
              shadows.lg,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            {/* Header do Card com Botão Favoritar */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                <Text style={styles.bookIcon}>{meditation.bookIcon}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.bookTitle, { color: colors.text }]}>
                  {meditation.bookTitle}
                </Text>
                <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>
                  {meditation.bookAuthor}
                </Text>
              </View>
              
              {/* Botão Favoritar no canto superior direito */}
              <Pressable
                onPress={handleToggleFavorite}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.favoriteButton}
              >
                <Ionicons 
                  name={isFavorited ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorited ? colors.error : colors.textMuted}
                />
              </Pressable>
            </View>

            {/* Referência */}
            <View style={[styles.referenceContainer, { borderColor: colors.divider }]}>
              <Text style={[styles.chapterText, { color: colors.primary }]}>
                Capítulo {meditation.chapterNumber}
              </Text>
              <Text style={[styles.chapterName, { color: colors.textMuted }]}>
                {meditation.chapterName}
              </Text>
              <View style={[styles.paragraphBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.paragraphNumber}>
                  #{meditation.number}
                </Text>
              </View>
            </View>

            {/* Texto da Meditação */}
            <Text style={[styles.meditationText, { color: colors.text }]}>
              {meditation.text}
            </Text>

            {/* Decoração inferior */}
            <View style={[styles.decorationBar, { backgroundColor: colors.divider }]} />
            
            {/* Footer com data */}
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Botão Compartilhar */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.actionContainer}
        >
          {/* Botão Compartilhar */}
          <Pressable
            onPress={handleShare}
            disabled={isSharing}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                opacity: pressed || isSharing ? 0.8 : 1,
              }
            ]}
          >
            {isSharing ? (
              <>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Preparando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Compartilhar</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

      </ScrollView>

      {/* Card invisível para compartilhamento */}
      <View style={styles.offscreenContainer}>
        <MeditationShareCard
          ref={shareCardRef}
          text={meditation.text}
          number={meditation.number}
          chapterNumber={meditation.chapterNumber}
          chapterName={meditation.chapterName}
          bookTitle={meditation.bookTitle}
          bookIcon={meditation.bookIcon}
          bookAuthor={meditation.bookAuthor}
          bookColor={meditation.bookColor}
          date={new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        />
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offscreenContainer: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  instructionText: {
    ...typography.small,
    fontWeight: '500',
  },
  meditationCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookIcon: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  bookTitle: {
    ...typography.h3,
    fontWeight: '600',
  },
  bookAuthor: {
    ...typography.small,
    marginTop: spacing.xs,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  referenceContainer: {
    paddingBottom: spacing.md,
    marginBottom: spacing.lg,
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  chapterText: {
    ...typography.body,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapterName: {
    ...typography.small,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  paragraphBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.sm,
  },
  paragraphNumber: {
    ...typography.small,
    color: '#fff',
    fontWeight: 'bold',
  },
  meditationText: {
    ...typography.bodyLarge,
    lineHeight: 32,
    textAlign: 'justify',
    marginBottom: spacing.xl,
  },
  decorationBar: {
    height: 2,
    width: 60,
    alignSelf: 'center',
    marginBottom: spacing.md,
    borderRadius: 1,
  },
  footerText: {
    ...typography.small,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionContainer: {
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  shareButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  refreshButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statNumber: {
    ...typography.h2,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.small,
  },
});
