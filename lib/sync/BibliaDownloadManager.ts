import AsyncStorage from '@react-native-async-storage/async-storage';
import { LivroBiblico } from '../types';

const DOWNLOADED_BIBLIA_KEY = '@downloaded_biblia_livros';
const BIBLIA_COMPLETA_KEY = '@downloaded_biblia_completa';

export interface DownloadedLivroBiblico {
  slug: string;
  nome: string;
  downloadedAt: string;
  size: number;
  data: LivroBiblico;
}

export interface BibliaDownloadStatus {
  slug: string;
  progress: number;
  isDownloading: boolean;
  error: string | null;
}

/**
 * Gerenciador de downloads da Bíblia
 */
export class BibliaDownloadManager {
  private static instance: BibliaDownloadManager;
  private downloadStatuses: Map<string, BibliaDownloadStatus> = new Map();
  private listeners: Set<(status: BibliaDownloadStatus) => void> = new Set();

  private constructor() {}

  static getInstance(): BibliaDownloadManager {
    if (!BibliaDownloadManager.instance) {
      BibliaDownloadManager.instance = new BibliaDownloadManager();
    }
    return BibliaDownloadManager.instance;
  }

  /**
   * Verificar se um livro está baixado
   */
  async isLivroDownloaded(slug: string): Promise<boolean> {
    try {
      const livros = await this.getDownloadedLivros();
      return livros.some(l => l.slug === slug);
    } catch (error) {
      console.error('Erro ao verificar download:', error);
      return false;
    }
  }

  /**
   * Verificar se a Bíblia completa está baixada
   */
  async isBibliaCompletaDownloaded(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(BIBLIA_COMPLETA_KEY);
      return stored === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter livros baixados
   */
  async getDownloadedLivros(): Promise<DownloadedLivroBiblico[]> {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADED_BIBLIA_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao buscar livros baixados:', error);
      return [];
    }
  }

  /**
   * Obter livro baixado específico
   */
  async getDownloadedLivro(slug: string): Promise<DownloadedLivroBiblico | null> {
    try {
      const livros = await this.getDownloadedLivros();
      return livros.find(l => l.slug === slug) || null;
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      return null;
    }
  }

  /**
   * Baixar um livro da Bíblia
   */
  async downloadLivro(livro: LivroBiblico): Promise<void> {
    const { slug } = livro;

    try {
      if (await this.isLivroDownloaded(slug)) {
        console.log(`Livro ${slug} já está baixado`);
        return;
      }

      this.updateDownloadStatus(slug, {
        slug,
        progress: 0,
        isDownloading: true,
        error: null,
      });

      // Simular progresso
      await this.simulateProgress(slug);

      // Calcular tamanho
      const livroData = JSON.stringify(livro);
      const size = new Blob([livroData]).size;

      // Salvar livro
      const downloadedLivro: DownloadedLivroBiblico = {
        slug: livro.slug,
        nome: livro.nome,
        downloadedAt: new Date().toISOString(),
        size,
        data: livro,
      };

      const livros = await this.getDownloadedLivros();
      livros.push(downloadedLivro);
      await AsyncStorage.setItem(DOWNLOADED_BIBLIA_KEY, JSON.stringify(livros));

      this.updateDownloadStatus(slug, {
        slug,
        progress: 100,
        isDownloading: false,
        error: null,
      });

      console.log(`✅ Livro ${livro.nome} baixado!`);
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
   * Baixar Bíblia completa
   */
  async downloadBibliaCompleta(todosLivros: LivroBiblico[]): Promise<void> {
    try {
      // Baixar todos os livros
      for (let i = 0; i < todosLivros.length; i++) {
        const livro = todosLivros[i];
        
        this.updateDownloadStatus('biblia-completa', {
          slug: 'biblia-completa',
          progress: Math.round((i / todosLivros.length) * 100),
          isDownloading: true,
          error: null,
        });

        if (!(await this.isLivroDownloaded(livro.slug))) {
          await this.downloadLivro(livro);
        }
      }

      // Marcar como completa
      await AsyncStorage.setItem(BIBLIA_COMPLETA_KEY, 'true');

      this.updateDownloadStatus('biblia-completa', {
        slug: 'biblia-completa',
        progress: 100,
        isDownloading: false,
        error: null,
      });

      console.log('✅ Bíblia completa baixada!');
    } catch (error) {
      console.error('Erro ao baixar Bíblia completa:', error);
      this.updateDownloadStatus('biblia-completa', {
        slug: 'biblia-completa',
        progress: 0,
        isDownloading: false,
        error: 'Erro ao baixar Bíblia',
      });
      throw error;
    }
  }

  /**
   * Remover livro baixado
   */
  async removeLivro(slug: string): Promise<void> {
    try {
      const livros = await this.getDownloadedLivros();
      const filtered = livros.filter(l => l.slug !== slug);
      await AsyncStorage.setItem(DOWNLOADED_BIBLIA_KEY, JSON.stringify(filtered));
      
      // Se não tem mais livros, marcar Bíblia como não completa
      if (filtered.length === 0) {
        await AsyncStorage.setItem(BIBLIA_COMPLETA_KEY, 'false');
      }
      
      this.downloadStatuses.delete(slug);
      console.log(`🗑️ Livro ${slug} removido`);
    } catch (error) {
      console.error('Erro ao remover livro:', error);
      throw error;
    }
  }

  /**
   * Remover Bíblia completa
   */
  async removeBibliaCompleta(): Promise<void> {
    try {
      await AsyncStorage.setItem(DOWNLOADED_BIBLIA_KEY, JSON.stringify([]));
      await AsyncStorage.setItem(BIBLIA_COMPLETA_KEY, 'false');
      this.downloadStatuses.clear();
      console.log('🗑️ Bíblia completa removida');
    } catch (error) {
      console.error('Erro ao remover Bíblia:', error);
      throw error;
    }
  }

  /**
   * Obter informações de download
   */
  async getDownloadInfo(): Promise<{
    totalLivros: number;
    totalSize: number;
    bibliaCompleta: boolean;
  }> {
    try {
      const livros = await this.getDownloadedLivros();
      const totalSize = livros.reduce((sum, l) => sum + l.size, 0);
      const bibliaCompleta = await this.isBibliaCompletaDownloaded();

      return {
        totalLivros: livros.length,
        totalSize,
        bibliaCompleta,
      };
    } catch (error) {
      console.error('Erro ao obter info:', error);
      return {
        totalLivros: 0,
        totalSize: 0,
        bibliaCompleta: false,
      };
    }
  }

  /**
   * Formatar tamanho
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Obter status de download
   */
  getDownloadStatus(slug: string): BibliaDownloadStatus | null {
    return this.downloadStatuses.get(slug) || null;
  }

  /**
   * Adicionar listener
   */
  addListener(listener: (status: BibliaDownloadStatus) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remover listener
   */
  removeListener(listener: (status: BibliaDownloadStatus) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Atualizar status
   */
  private updateDownloadStatus(slug: string, status: BibliaDownloadStatus): void {
    this.downloadStatuses.set(slug, status);
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Simular progresso
   */
  private async simulateProgress(slug: string): Promise<void> {
    const steps = [10, 30, 50, 70, 90];
    
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const current = this.downloadStatuses.get(slug);
      if (current) {
        this.updateDownloadStatus(slug, { ...current, progress });
      }
    }
  }
}

export const bibliaDownloadManager = BibliaDownloadManager.getInstance();
