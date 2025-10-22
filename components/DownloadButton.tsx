import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { downloadManager, DownloadStatus } from '../lib/sync/DownloadManager';
import { BookData } from '../lib/types';

interface DownloadButtonProps {
  book: BookData;
  size?: 'small' | 'large';
}

export function DownloadButton({ book, size = 'small' }: DownloadButtonProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDownloadStatus();
  }, [book.slug]);

  useEffect(() => {
    const listener = (status: DownloadStatus) => {
      if (status.slug === book.slug) {
        setDownloadStatus(status);
        if (status.progress === 100 && !status.isDownloading) {
          setIsDownloaded(true);
        }
      }
    };

    downloadManager.addListener(listener);
    return () => downloadManager.removeListener(listener);
  }, [book.slug]);

  const checkDownloadStatus = async () => {
    try {
      const downloaded = await downloadManager.isBookDownloaded(book.slug);
      setIsDownloaded(downloaded);
    } catch (error) {
      console.error('Erro ao verificar download:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadManager.downloadBook(book);
      Alert.alert(
        'Download concluído!',
        `O livro "${book.title}" está disponível offline.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro no download:', error);
      Alert.alert(
        'Erro no download',
        'Não foi possível baixar o livro. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remover download',
      `Deseja remover "${book.title}" dos downloads?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await downloadManager.removeDownloadedBook(book.slug);
              setIsDownloaded(false);
              setDownloadStatus(null);
            } catch (error) {
              console.error('Erro ao remover:', error);
              Alert.alert('Erro', 'Não foi possível remover o livro.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.button, size === 'small' ? styles.small : styles.large]}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  }

  // Mostrando progresso de download
  if (downloadStatus?.isDownloading) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.button, size === 'small' ? styles.small : styles.large, styles.downloading]}
      >
        <ActivityIndicator size="small" color="#fff" />
        <Text style={styles.progressText}>{downloadStatus.progress}%</Text>
      </Animated.View>
    );
  }

  // Livro já baixado
  if (isDownloaded) {
    return (
      <TouchableOpacity
        onPress={handleRemove}
        style={[styles.button, size === 'small' ? styles.small : styles.large, styles.downloaded]}
      >
        <Ionicons name="checkmark-circle" size={size === 'small' ? 20 : 24} color="#10b981" />
        {size === 'large' && <Text style={styles.downloadedText}>Baixado</Text>}
      </TouchableOpacity>
    );
  }

  // Disponível para download
  return (
    <TouchableOpacity
      onPress={handleDownload}
      style={[styles.button, size === 'small' ? styles.small : styles.large, styles.download]}
    >
      <Ionicons name="cloud-download-outline" size={size === 'small' ? 20 : 24} color="#6b7280" />
      {size === 'large' && <Text style={styles.downloadText}>Baixar</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 6,
  },
  small: {
    padding: 8,
  },
  large: {
    padding: 12,
    paddingHorizontal: 16,
  },
  download: {
    backgroundColor: '#f3f4f6',
  },
  downloading: {
    backgroundColor: '#3b82f6',
  },
  downloaded: {
    backgroundColor: '#d1fae5',
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadedText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
});
