import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoritesAPI } from '../api';
import { FavoriteParagraph } from '../types';

const FAVORITES_KEY = '@app_catolico_favorites';
const SYNC_STATUS_KEY = '@favorites_sync_status';
const LAST_SYNC_KEY = '@favorites_last_sync';

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: string | null;
  pendingSync: boolean;
  error: string | null;
}

/**
 * Serviço de sincronização de favoritos entre local e nuvem
 */
export class FavoritesSyncService {
  private static instance: FavoritesSyncService;
  private syncInProgress = false;

  private constructor() {}

  static getInstance(): FavoritesSyncService {
    if (!FavoritesSyncService.instance) {
      FavoritesSyncService.instance = new FavoritesSyncService();
    }
    return FavoritesSyncService.instance;
  }

  /**
   * Migrar favoritos antigos adicionando campo 'type'
   */
  private async migrateFavoritesIfNeeded(favorites: FavoriteParagraph[]): Promise<FavoriteParagraph[]> {
    let needsMigration = false;
    
    const migrated = favorites.map(fav => {
      if (!fav.type) {
        needsMigration = true;
        // Detectar tipo baseado no formato do bookSlug
        // Livros bíblicos geralmente têm formato específico
        const isBiblia = fav.bookSlug.match(/^(genesis|exodo|levitico|numeros|deuteronomio|josue|juizes|rute|1samuel|2samuel|1reis|2reis|1cronicas|2cronicas|esdras|neemias|tobias|judite|ester|1macabeus|2macabeus|jo|salmos|proverbios|eclesiastes|canticos|sabedoria|eclesiastico|isaias|jeremias|lamentacoes|baruc|ezequiel|daniel|oseias|joel|amos|abdias|jonas|miqueias|naum|habacuc|sofonias|ageu|zacarias|malaquias|mateus|marcos|lucas|joao|atos|romanos|1corintios|2corintios|galatas|efesios|filipenses|colossenses|1tessalonicenses|2tessalonicenses|1timoteo|2timoteo|tito|filemom|hebreus|tiago|1pedro|2pedro|1joao|2joao|3joao|judas|apocalipse)$/i);
        
        return {
          ...fav,
          type: isBiblia ? 'biblia' as const : 'livro' as const
        };
      }
      return fav;
    });

    if (needsMigration) {
      await this.saveLocalFavorites(migrated);
    }

    return migrated;
  }

  /**
   * Buscar favoritos locais
   */
  async getLocalFavorites(): Promise<FavoriteParagraph[]> {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites = stored ? JSON.parse(stored) : [];
      return await this.migrateFavoritesIfNeeded(favorites);
    } catch (error) {
      console.error('Erro ao buscar favoritos locais:', error);
      return [];
    }
  }

  /**
   * Salvar favoritos localmente
   */
  async saveLocalFavorites(favorites: FavoriteParagraph[]): Promise<void> {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos locais:', error);
      throw error;
    }
  }

  /**
   * Adicionar favorito local e sincronizar com nuvem
   */
  async addFavorite(favorite: FavoriteParagraph): Promise<void> {
    try {
      // 1. Salvar localmente primeiro (para resposta rápida)
      const favorites = await this.getLocalFavorites();
      
      // Verificar se já existe
      const exists = favorites.some(
        f => f.bookSlug === favorite.bookSlug && 
             f.chapterId === favorite.chapterId && 
             f.paragraphNumber === favorite.paragraphNumber
      );

      if (!exists) {
        favorites.push(favorite);
        await this.saveLocalFavorites(favorites);
      }

      // 2. Tentar sincronizar com nuvem
      try {
        await favoritesAPI.addFavorite({
          book_slug: favorite.bookSlug,
          chapter_id: favorite.chapterId.toString(),
          paragraph_index: favorite.paragraphNumber,
          paragraph_text: favorite.paragraphText,
        });
        
        await this.updateSyncStatus({ pendingSync: false });
      } catch (error) {
        // Se falhar, marcar como pendente de sincronização
        await this.updateSyncStatus({ pendingSync: true });
        console.warn('Favorito salvo localmente, sincronização pendente');
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }
  }

  /**
   * Remover favorito local e da nuvem
   */
  async removeFavorite(favorite: FavoriteParagraph): Promise<void> {
    try {
      // 1. Remover localmente
      const favorites = await this.getLocalFavorites();
      const filtered = favorites.filter(
        f => !(f.bookSlug === favorite.bookSlug && 
               f.chapterId === favorite.chapterId && 
               f.paragraphNumber === favorite.paragraphNumber)
      );
      await this.saveLocalFavorites(filtered);

      // 2. Tentar remover da nuvem
      try {
        const cloudFavorites = await favoritesAPI.getFavorites();
        const cloudFavorite = cloudFavorites.find(
          (f: any) => f.book_slug === favorite.bookSlug && 
               f.chapter_id === favorite.chapterId && 
               f.paragraph_index === favorite.paragraphNumber
        );

        if (cloudFavorite) {
          await favoritesAPI.removeFavorite(cloudFavorite.id);
        }
      } catch (error) {
        console.warn('Erro ao remover favorito da nuvem:', error);
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  }

  /**
   * Limpar todos os favoritos (local e nuvem)
   */
  async clearAllFavorites(): Promise<void> {
    try {
      await this.saveLocalFavorites([]);
      
      try {
        await favoritesAPI.clearAll();
      } catch (error) {
        console.warn('Erro ao limpar favoritos da nuvem:', error);
      }
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      throw error;
    }
  }

  /**
   * Sincronizar favoritos: mesclar local com nuvem
   */
  async syncFavorites(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sincronização já em andamento');
      return;
    }

    try {
      this.syncInProgress = true;
      await this.updateSyncStatus({ isSyncing: true, error: null });

      // 1. Buscar favoritos locais e da nuvem
      const localFavorites = await this.getLocalFavorites();
      const cloudFavorites = await favoritesAPI.getFavorites();

      // 2. Converter favoritos da nuvem para formato local
      const cloudAsFavorites: FavoriteParagraph[] = cloudFavorites.map((cf: any) => {
        const bookSlug = cf.book_slug;
        const isBiblia = bookSlug.match(/^(genesis|exodo|levitico|numeros|deuteronomio|josue|juizes|rute|1samuel|2samuel|1reis|2reis|1cronicas|2cronicas|esdras|neemias|tobias|judite|ester|1macabeus|2macabeus|jo|salmos|proverbios|eclesiastes|canticos|sabedoria|eclesiastico|isaias|jeremias|lamentacoes|baruc|ezequiel|daniel|oseias|joel|amos|abdias|jonas|miqueias|naum|habacuc|sofonias|ageu|zacarias|malaquias|mateus|marcos|lucas|joao|atos|romanos|1corintios|2corintios|galatas|efesios|filipenses|colossenses|1tessalonicenses|2tessalonicenses|1timoteo|2timoteo|tito|filemom|hebreus|tiago|1pedro|2pedro|1joao|2joao|3joao|judas|apocalipse)$/i);
        
        return {
          bookSlug,
          bookTitle: '', // Será preenchido depois se necessário
          chapterId: cf.chapter_id,
          chapterName: '', // Será preenchido depois se necessário
          paragraphNumber: cf.paragraph_index,
          paragraphText: cf.paragraph_text,
          timestamp: cf.created_at ? new Date(cf.created_at).getTime() : Date.now(),
          type: isBiblia ? 'biblia' as const : 'livro' as const,
        };
      });

      // 3. Mesclar: união de ambos (sem duplicatas)
      const merged = [...localFavorites];
      
      for (const cloudFav of cloudAsFavorites) {
        const exists = merged.some(
          f => f.bookSlug === cloudFav.bookSlug && 
               f.chapterId === cloudFav.chapterId && 
               f.paragraphNumber === cloudFav.paragraphNumber
        );
        
        if (!exists) {
          merged.push(cloudFav);
        }
      }

      // 4. Enviar favoritos locais que não estão na nuvem
      for (const localFav of localFavorites) {
        const existsInCloud = cloudAsFavorites.some(
          cf => cf.bookSlug === localFav.bookSlug && 
                cf.chapterId === localFav.chapterId && 
                cf.paragraphNumber === localFav.paragraphNumber
        );

        if (!existsInCloud) {
          try {
            await favoritesAPI.addFavorite({
              book_slug: localFav.bookSlug,
              chapter_id: localFav.chapterId.toString(),
              paragraph_index: localFav.paragraphNumber,
              paragraph_text: localFav.paragraphText,
            });
          } catch (error) {
            console.warn('Erro ao enviar favorito para nuvem:', error);
          }
        }
      }

      // 5. Salvar favoritos mesclados localmente
      await this.saveLocalFavorites(merged);

      // 6. Atualizar status
      await this.updateSyncStatus({
        isSyncing: false,
        lastSync: new Date().toISOString(),
        pendingSync: false,
        error: null,
      });

      console.log(`✅ Sincronização concluída: ${merged.length} favoritos`);
    } catch (error) {
      console.error('Erro na sincronização:', error);
      await this.updateSyncStatus({
        isSyncing: false,
        error: 'Erro ao sincronizar favoritos',
        pendingSync: true,
      });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Obter status da sincronização
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao buscar status de sincronização:', error);
    }

    return {
      isSyncing: false,
      lastSync: null,
      pendingSync: false,
      error: null,
    };
  }

  /**
   * Atualizar status da sincronização
   */
  private async updateSyncStatus(updates: Partial<SyncStatus>): Promise<void> {
    try {
      const current = await this.getSyncStatus();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao atualizar status de sincronização:', error);
    }
  }
}

// Exportar instância singleton
export const favoritesSyncService = FavoritesSyncService.getInstance();
