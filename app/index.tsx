import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookCard } from '@/components/BookCard';
import { BOOKS } from '@/lib/data';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getColors, spacing, typography, borderRadius } from '@/lib/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.sm + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header minimalista */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.header}
        >
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Biblioteca</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>São Josemaria Escrivá</Text>
          </View>
          <Pressable 
            style={[styles.iconButton, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            onPress={() => router.push('/favoritos')}
          >
            <Ionicons name="heart-outline" size={20} color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* Card de Meditação Rápida */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Pressable
            style={({ pressed }) => [
              styles.meditationCard,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={() => router.push('/meditacao')}
          >
            <View style={styles.meditationContent}>
              <View style={styles.meditationIcon}>
                <Text style={styles.meditationEmoji}>🙏</Text>
              </View>
              <View style={styles.meditationText}>
                <Text style={styles.meditationTitle}>Meditação Rápida</Text>
                <Text style={styles.meditationSubtitle}>
                  Um parágrafo inspirador para sua reflexão diária
                </Text>
              </View>
              <View style={styles.meditationArrow}>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Lista de livros */}
        <View style={styles.booksSection}>
          {BOOKS.map((book, index) => (
            <Animated.View
              key={book.id}
              entering={FadeInDown.duration(400).delay(200 + index * 100)}
            >
              <BookCard
                book={book}
                onPress={() => router.push(`/livro/${book.slug}`)}
              />
            </Animated.View>
          ))}
        </View>

        {/* Footer minimalista */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(600)}
          style={[styles.footer, { borderTopColor: colors.divider }]}
        >
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Desenvolvido com ❤️ para a glória de Deus
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  meditationCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  meditationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  meditationIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meditationEmoji: {
    fontSize: 32,
  },
  meditationText: {
    flex: 1,
    gap: spacing.xs,
  },
  meditationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  meditationSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  meditationArrow: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  booksSection: {
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  footerText: {
    ...typography.caption,
  },
});
