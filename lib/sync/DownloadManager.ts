import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, BookData } from '../types';

const DOWNLOADED_BOOKS_KEY = '@downloaded_books';
const DOWNLOAD_STATUS_KEY = '@download_status';

export interface DownloadedBook {
  slug: string;
  title: string;
  downloadedAt: string;
  size: number; // em bytes
  data: Book;
}

export interface DownloadStatus {
  slug: string;
  progress: number; // 0-100
  isDownloading: boolean;
  error: string | null;
}

export interface DownloadInfo {
  totalBooks: number;
  totalSize: number;
  books: Array<{
    slug: string;
    title: string;
    downloadedAt: string;
    size: number;
  }>;
}

/**
 * Gerenciador de downloads de livros para acesso offline
 */
export class DownloadManagerService {
  private static instance: DownloadManagerService;
  private downloadStatuses: Map<string, DownloadStatus> = new Map();
  private listeners: Set<(status: DownloadStatus) => void> = new Set();

  private constructor() {}

  static getInstance(): DownloadManagerService {
    if (!DownloadManagerService.instance) {
      DownloadManagerService.instance = new DownloadManagerService();
    }
    return DownloadManagerService.instance;
  }

  /**
   * Verificar se um livro está baixado
   */
  async isBookDownloaded(slug: string): Promise<boolean> {
    try {
      const books = await this.getDownloadedBooks();
      return books.some(b => b.slug === slug);
    } catch (error) {
      console.error('Erro ao verificar download:', error);
      return false;
    }
  }

  /**
   * Obter todos os livros baixados
   */
  async getDownloadedBooks(): Promise<DownloadedBook[]> {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADED_BOOKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao buscar livros baixados:', error);
      return [];
    }
  }

  /**
   * Obter um livro baixado específico
   */
  async getDownloadedBook(slug: string): Promise<DownloadedBook | null> {
    try {
      const books = await this.getDownloadedBooks();
      return books.find(b => b.slug === slug) || null;
    } catch (error) {
      console.error('Erro ao buscar livro baixado:', error);
      return null;
    }
  }

  /**
   * Baixar um livro para acesso offline
   */
  async downloadBook(bookData: BookData): Promise<void> {
    const { slug } = bookData;

    try {
      // Verificar se já está baixado
      if (await this.isBookDownloaded(slug)) {
        console.log(`Livro ${slug} já está baixado`);
        return;
      }

      // Iniciar download
      this.updateDownloadStatus(slug, {
        slug,
        progress: 0,
        isDownloading: true,
        error: null,
      });

      // Simular progresso (JSON já está em memória, mas mostramos progresso para UX)
      await this.simulateProgress(slug);

      // Calcular tamanho (aproximado)
      const bookDataStr = JSON.stringify(bookData.data);
      const size = new Blob([bookDataStr]).size;

      // Salvar livro
      const downloadedBook: DownloadedBook = {
        slug: bookData.slug,
        title: bookData.title,
        downloadedAt: new Date().toISOString(),
        size,
        data: bookData.data,
      };

      const books = await this.getDownloadedBooks();
      books.push(downloadedBook);
      await AsyncStorage.setItem(DOWNLOADED_BOOKS_KEY, JSON.stringify(books));

      // Finalizar download
      this.updateDownloadStatus(slug, {
        slug,
        progress: 100,
        isDownloading: false,
        error: null,
      });

      console.log(`✅ Livro ${bookData.title} baixado com sucesso!`);
    } catch (error) {
      console.error('Erro ao baixar livro:', error);
      this.updateDownloadStatus(slug, {
        slug,
        progress: 0,
        isDownloading: false,
        error: 'Erro ao baixar livro',
      });
      throw error;
    }
  }

  /**
   * Remover um livro baixado
   */
  async removeDownloadedBook(slug: string): Promise<void> {
    try {
      const books = await this.getDownloadedBooks();
      const filtered = books.filter(b => b.slug !== slug);
      await AsyncStorage.setItem(DOWNLOADED_BOOKS_KEY, JSON.stringify(filtered));
      
      // Limpar status
      this.downloadStatuses.delete(slug);
      
      console.log(`🗑️ Livro ${slug} removido`);
    } catch (error) {
      console.error('Erro ao remover livro:', error);
      throw error;
    }
  }

  /**
   * Limpar todos os downloads
   */
  async clearAllDownloads(): Promise<void> {
    try {
      await AsyncStorage.setItem(DOWNLOADED_BOOKS_KEY, JSON.stringify([]));
      this.downloadStatuses.clear();
      console.log('🗑️ Todos os downloads removidos');
    } catch (error) {
      console.error('Erro ao limpar downloads:', error);
      throw error;
    }
  }

  /**
   * Obter informações sobre downloads
   */
  async getDownloadInfo(): Promise<DownloadInfo> {
    try {
      const books = await this.getDownloadedBooks();
      const totalSize = books.reduce((sum, book) => sum + book.size, 0);

      return {
        totalBooks: books.length,
        totalSize,
        books: books.map(b => ({
          slug: b.slug,
          title: b.title,
          downloadedAt: b.downloadedAt,
          size: b.size,
        })),
      };
    } catch (error) {
      console.error('Erro ao obter informações de download:', error);
      return {
        totalBooks: 0,
        totalSize: 0,
        books: [],
      };
    }
  }

  /**
   * Formatar tamanho em bytes para string legível
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Obter status de download de um livro
   */
  getDownloadStatus(slug: string): DownloadStatus | null {
    return this.downloadStatuses.get(slug) || null;
  }

  /**
   * Adicionar listener para mudanças de status
   */
  addListener(listener: (status: DownloadStatus) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remover listener
   */
  removeListener(listener: (status: DownloadStatus) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Atualizar status e notificar listeners
   */
  private updateDownloadStatus(slug: string, status: DownloadStatus): void {
    this.downloadStatuses.set(slug, status);
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Simular progresso de download (para melhor UX)
   */
  private async simulateProgress(slug: string): Promise<void> {
    const steps = [10, 30, 50, 70, 90];
    
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const current = this.downloadStatuses.get(slug);
      if (current) {
        this.updateDownloadStatus(slug, {
          ...current,
          progress,
        });
      }
    }
  }
}

// Exportar instância singleton
export const downloadManager = DownloadManagerService.getInstance();
