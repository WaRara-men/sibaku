export interface Post {
  id: string;
  content?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | null;
  created_at?: string;
  shibaku_count: number;
  latitude?: number | null;
  longitude?: number | null;
}
