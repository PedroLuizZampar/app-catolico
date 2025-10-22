import { useState, useEffect } from 'react';
import { downloadManager, DownloadInfo, DownloadStatus, DownloadManagerService } from '../sync/DownloadManager';
import { BookData } from '../types';

export function useDownloads() {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo>({
    totalBooks: 0,
    totalSize: 0,
    books: [],
  });
  const [downloadStatuses, setDownloadStatuses] = useState<Map<string, DownloadStatus>>(new Map());

  useEffect(() => {
    loadDownloadInfo();

    const listener = (status: DownloadStatus) => {
      setDownloadStatuses(prev => new Map(prev).set(status.slug, status));
      
      // Recarregar info quando download completar
      if (status.progress === 100 && !status.isDownloading) {
        loadDownloadInfo();
      }
    };

    downloadManager.addListener(listener);
    return () => downloadManager.removeListener(listener);
  }, []);

  const loadDownloadInfo = async () => {
    try {
      const info = await downloadManager.getDownloadInfo();
      setDownloadInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações de download:', error);
    }
  };

  const downloadBook = async (book: BookData) => {
    try {
      await downloadManager.downloadBook(book);
      await loadDownloadInfo();
    } catch (error) {
      console.error('Erro ao baixar livro:', error);
      throw error;
    }
  };

  const removeDownload = async (slug: string) => {
    try {
      await downloadManager.removeDownloadedBook(slug);
      await loadDownloadInfo();
    } catch (error) {
      console.error('Erro ao remover download:', error);
      throw error;
    }
  };

  const clearAllDownloads = async () => {
    try {
      await downloadManager.clearAllDownloads();
      await loadDownloadInfo();
    } catch (error) {
      console.error('Erro ao limpar downloads:', error);
      throw error;
    }
  };

  const isBookDownloaded = async (slug: string): Promise<boolean> => {
    try {
      return await downloadManager.isBookDownloaded(slug);
    } catch (error) {
      console.error('Erro ao verificar download:', error);
      return false;
    }
  };

  const getDownloadStatus = (slug: string): DownloadStatus | null => {
    return downloadStatuses.get(slug) || null;
  };

  const formatSize = (bytes: number): string => {
    return DownloadManagerService.formatSize(bytes);
  };

  return {
    downloadInfo,
    downloadStatuses,
    downloadBook,
    removeDownload,
    clearAllDownloads,
    isBookDownloaded,
    getDownloadStatus,
    formatSize,
  };
}
