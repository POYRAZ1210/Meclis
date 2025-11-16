import { createClient } from '@supabase/supabase-js';

// Backend-specific environment variables (NOT VITE_ prefixed)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not configured. Blüten auto-sync will be disabled.');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  username?: string;
}

export class InstagramService {
  private accessToken: string | undefined;
  private businessAccountId: string | undefined;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  }

  /**
   * Instagram Graph API'den son postları çek
   */
  async fetchRecentPosts(limit: number = 10): Promise<InstagramPost[]> {
    if (!this.accessToken || !this.businessAccountId) {
      console.log('Instagram credentials not configured. Skipping auto-fetch.');
      return [];
    }

    try {
      const url = `https://graph.facebook.com/v20.0/${this.businessAccountId}/media`;
      const params = new URLSearchParams({
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username',
        limit: limit.toString(),
        access_token: this.accessToken,
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Instagram API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      return [];
    }
  }

  /**
   * Yeni postları Supabase'e kaydet
   */
  async syncNewPosts(): Promise<number> {
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, skipping sync');
      return 0;
    }

    try {
      // Sync durumunu kontrol et
      const { data: syncState } = await supabase
        .from('instagram_sync_state')
        .select('*')
        .single();

      if (!syncState?.sync_enabled) {
        console.log('Instagram auto-sync is disabled');
        return 0;
      }

      // Instagram'dan son postları çek
      const posts = await this.fetchRecentPosts(25);
      if (posts.length === 0) {
        console.log('No Instagram posts fetched');
        return 0;
      }

      let newPostsCount = 0;
      const lastSyncedId = syncState.last_synced_post_id;

      for (const post of posts) {
        // Son senkronize edilen post'a ulaşırsak dur
        if (post.id === lastSyncedId) break;

        // Veritabanında zaten var mı kontrol et
        const { data: existing } = await supabase
          .from('bluten_posts')
          .select('id')
          .eq('instagram_post_id', post.id)
          .single();

        if (existing) continue;

        // Yeni postu ekle
        const { error } = await supabase
          .from('bluten_posts')
          .insert({
            instagram_post_id: post.id,
            instagram_url: post.permalink,
            media_url: post.media_url || post.thumbnail_url,
            media_type: post.media_type,
            caption: post.caption,
            username: post.username,
            posted_at: new Date(post.timestamp).toISOString(),
            is_visible: true,
          });

        if (!error) {
          newPostsCount++;
        } else {
          console.error('Error inserting Instagram post:', error);
        }
      }

      // ALWAYS update sync state with latest post ID, even if no new posts inserted
      // This prevents re-scanning the same batch on every sync
      if (posts.length > 0) {
        await supabase
          .from('instagram_sync_state')
          .update({
            last_synced_post_id: posts[0].id,
            last_sync_timestamp: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', syncState.id);

        if (newPostsCount > 0) {
          console.log(`✅ ${newPostsCount} new Instagram posts synced`);
        } else {
          console.log(`✓ Instagram sync completed, no new posts`);
        }
      }

      return newPostsCount;
    } catch (error) {
      console.error('Error in syncNewPosts:', error);
      return 0;
    }
  }

  /**
   * Manuel olarak Instagram post URL'sinden bilgi çek (oEmbed API)
   */
  async fetchPostByUrl(instagramUrl: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/instagram_oembed?url=${encodeURIComponent(instagramUrl)}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Invalid Instagram URL or post not accessible');
      }

      const data = await response.json();
      return {
        title: data.title || '',
        author_name: data.author_name || '',
        thumbnail_url: data.thumbnail_url,
        html: data.html,
      };
    } catch (error) {
      console.error('Error fetching Instagram post by URL:', error);
      throw error;
    }
  }

  /**
   * Otomatik senkronizasyonu başlat (15 dakikada bir)
   */
  startAutoSync() {
    if (this.syncInterval) {
      console.log('Auto-sync already running');
      return;
    }

    console.log('🔄 Starting Instagram auto-sync (every 15 minutes)');
    
    // İlk senkronizasyonu hemen yap
    this.syncNewPosts();

    // Her 15 dakikada bir çalıştır
    this.syncInterval = setInterval(() => {
      this.syncNewPosts();
    }, 15 * 60 * 1000); // 15 dakika
  }

  /**
   * Otomatik senkronizasyonu durdur
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('❌ Instagram auto-sync stopped');
    }
  }

  /**
   * Servis durumunu kontrol et
   */
  getStatus() {
    return {
      configured: !!(this.accessToken && this.businessAccountId),
      autoSyncRunning: !!this.syncInterval,
      credentials: {
        hasToken: !!this.accessToken,
        hasAccountId: !!this.businessAccountId,
      }
    };
  }
}

// Singleton instance
export const instagramService = new InstagramService();
