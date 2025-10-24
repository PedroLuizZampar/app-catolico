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
      const migrated = await this.migrateFavoritesIfNeeded(favorites);
      
      // Remover duplicatas se existirem
      return this.removeDuplicates(migrated);
    } catch (error) {
      console.error('Erro ao buscar favoritos locais:', error);
      return [];
    }
  }

  /**
   * Remover duplicatas do array de favoritos
   */
  private removeDuplicates(favorites: FavoriteParagraph[]): FavoriteParagraph[] {
    const seen = new Map<string, FavoriteParagraph>();
    
    for (const fav of favorites) {
      const key = `${fav.bookSlug}-${fav.chapterId}-${fav.paragraphNumber}`;
      
      // Se não existe ou o existente é mais antigo, substituir
      if (!seen.has(key) || seen.get(key)!.timestamp < fav.timestamp) {
        seen.set(key, fav);
      }
    }
    
    return Array.from(seen.values());
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
      
      // Verificar se já existe (chave única: bookSlug + chapterId + paragraphNumber)
      const exists = favorites.some(
        f => f.bookSlug === favorite.bookSlug && 
             f.chapterId === favorite.chapterId && 
             f.paragraphNumber === favorite.paragraphNumber
      );

      if (exists) {
        console.log('Favorito já existe localmente, pulando');
        return; // Não adicionar duplicata
      }

      favorites.push(favorite);
      await this.saveLocalFavorites(favorites);

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
               parseInt(f.chapter_id) === favorite.chapterId && 
               f.paragraph_index === favorite.paragraphNumber
        );

        if (cloudFavorite) {
          await favoritesAPI.removeFavorite(cloudFavorite.id);
          console.log('✅ Favorito removido da nuvem:', cloudFavorite.id);
        } else {
          console.warn('⚠️ Favorito não encontrado na nuvem para remover');
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
      // Criar um Map para garantir unicidade baseada em chave composta
      const mergedMap = new Map<string, FavoriteParagraph>();
      
      // Adicionar favoritos locais primeiro
      for (const localFav of localFavorites) {
        const key = `${localFav.bookSlug}-${localFav.chapterId}-${localFav.paragraphNumber}`;
        mergedMap.set(key, localFav);
      }
      
      // Adicionar favoritos da nuvem (não sobrescreve se já existir)
      for (const cloudFav of cloudAsFavorites) {
        const key = `${cloudFav.bookSlug}-${cloudFav.chapterId}-${cloudFav.paragraphNumber}`;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, cloudFav);
        }
      }
      
      // Converter Map de volta para array
      const merged = Array.from(mergedMap.values());

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
   * Limpar duplicatas existentes
   */
  async cleanDuplicates(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites = stored ? JSON.parse(stored) : [];
      const originalCount = favorites.length;
      
      const cleaned = this.removeDuplicates(favorites);
      const duplicatesRemoved = originalCount - cleaned.length;
      
      if (duplicatesRemoved > 0) {
        await this.saveLocalFavorites(cleaned);
        console.log(`✅ ${duplicatesRemoved} duplicata(s) removida(s)`);
      }
      
      return duplicatesRemoved;
    } catch (error) {
      console.error('Erro ao limpar duplicatas:', error);
      return 0;
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
