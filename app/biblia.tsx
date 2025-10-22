import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getColors, spacing, typography, borderRadius, shadows } from '@/lib/theme/tokens';
import { biblia, bibliaStats, todosLivros } from '@/lib/bibliaData';
import { LivroBiblico } from '@/lib/types';
import { bibliaDownloadManager, BibliaDownloadStatus } from '@/lib/sync/BibliaDownloadManager';

export default function BibliaScreen() {
  const [selectedTestament, setSelectedTestament] = useState<'Antigo' | 'Novo'>('Antigo');
  const [searchQuery, setSearchQuery] = useState('');
  const [bibliaCompleta, setBibliaCompleta] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<BibliaDownloadStatus | null>(null);
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkBibliaDownload();

    const listener = (status: BibliaDownloadStatus) => {
      if (status.slug === 'biblia-completa') {
        setDownloadStatus(status);
        if (status.progress === 100 && !status.isDownloading) {
          setBibliaCompleta(true);
        }
      }
    };

    bibliaDownloadManager.addListener(listener);
    return () => bibliaDownloadManager.removeListener(listener);
  }, []);

  const checkBibliaDownload = async () => {
    const isDownloaded = await bibliaDownloadManager.isBibliaCompletaDownloaded();
    setBibliaCompleta(isDownloaded);
  };

  const handleDownloadBiblia = async () => {
    Alert.alert(
      'Baixar Bíblia Completa',
      `Deseja baixar toda a Bíblia Sagrada para acesso offline? (${bibliaStats.totalLivros} livros)`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Baixar',
          onPress: async () => {
            try {
              await bibliaDownloadManager.downloadBibliaCompleta(todosLivros);
              Alert.alert('Sucesso!', 'Bíblia completa baixada com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível baixar a Bíblia.');
            }
          },
        },
      ]
    );
  };

  const handleRemoveBiblia = () => {
    Alert.alert(
      'Remover Download',
      'Deseja remover a Bíblia completa dos downloads?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await bibliaDownloadManager.removeBibliaCompleta();
              setBibliaCompleta(false);
              setDownloadStatus(null);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover a Bíblia.');
            }
          },
        },
      ]
    );
  };

  const livros = selectedTestament === 'Antigo' ? biblia.antigoTestamento : biblia.novoTestamento;

  const filteredLivros = searchQuery
    ? livros.filter(livro =>
        livro.nome.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : livros;

  const handleLivroPress = (livro: LivroBiblico) => {
    router.push(`/biblia/${livro.slug}` as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingBottom: spacing.xl + insets.bottom }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header simplificado */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>📖 Bíblia Sagrada</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ave Maria</Text>

        {/* Botão de Download da Bíblia Completa */}
        {downloadStatus?.isDownloading ? (
          <View style={[styles.downloadButton, { backgroundColor: colors.primary }]}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.downloadButtonText}>
              Baixando... {downloadStatus.progress}%
            </Text>
          </View>
        ) : bibliaCompleta ? (
          <Pressable
            style={[styles.downloadButton, { backgroundColor: '#10b981' }]}
            onPress={handleRemoveBiblia}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.downloadButtonText}>Baixada</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.downloadButton, { backgroundColor: colors.primary }]}
            onPress={handleDownloadBiblia}
          >
            <Ionicons name="cloud-download-outline" size={18} color="#fff" />
            <Text style={styles.downloadButtonText}>Baixar Completa</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Busca compacta */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.searchContainer}
      >
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar livro..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Seletor de Testamento */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.testamentSelector}
      >
        <Pressable
          style={[
            styles.testamentButton,
            selectedTestament === 'Antigo' && { backgroundColor: colors.primary },
            { borderColor: colors.border },
          ]}
          onPress={() => setSelectedTestament('Antigo')}
        >
          <Text
            style={[
              styles.testamentText,
              { color: selectedTestament === 'Antigo' ? '#fff' : colors.textSecondary },
            ]}
          >
            Antigo Testamento
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.testamentButton,
            selectedTestament === 'Novo' && { backgroundColor: colors.primary },
            { borderColor: colors.border },
          ]}
          onPress={() => setSelectedTestament('Novo')}
        >
          <Text
            style={[
              styles.testamentText,
              { color: selectedTestament === 'Novo' ? '#fff' : colors.textSecondary },
            ]}
          >
            Novo Testamento
          </Text>
        </Pressable>
      </Animated.View>

      {/* Lista de Livros */}
      <View style={styles.livrosContainer}>
        {filteredLivros.map((livro, index) => (
          <Animated.View
            key={livro.slug}
            entering={FadeInDown.duration(400).delay(300 + index * 30)}
          >
            <Pressable
              style={({ pressed }) => [
                styles.livroCard,
                shadows.sm,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleLivroPress(livro)}
            >
              <View style={styles.livroContent}>
                <Text style={[styles.livroNome, { color: colors.text }]}>
                  {livro.nome}
                </Text>
                <Text style={[styles.livroInfo, { color: colors.textSecondary }]}>
                  {livro.capitulos.length} {livro.capitulos.length === 1 ? 'capítulo' : 'capítulos'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>
          </Animated.View>
        ))}

        {filteredLivros.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum livro encontrado
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.small,
    marginBottom: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
  },
  testamentSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testamentButton: {
    flex: 1,
    padding: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  testamentText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  livrosContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  livroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  livroContent: {
    flex: 1,
  },
  livroNome: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  livroInfo: {
    ...typography.small,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  downloadButtonText: {
    color: '#fff',
    ...typography.small,
    fontWeight: '600',
  },
});
