export type PublicProfile = {
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  default_theme: string;
  theme_settings: Record<string, string>;
  visibility: string;
};

export type PublicCategory = { id: string; name: string; slug: string; description: string | null; color: string | null; sort_order: number };
export type PublicCollection = { id: string; title: string; slug: string; introduction: string | null; cover_image_url: string | null; theme_override: string | null };
export type PublicPost = { id: string; slug: string; title: string; excerpt: string; category: string; category_slug: string | null; author_handle: string | null; cover_image_url: string | null; video_url: string | null; published_at: string | null; created_at: string };

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    return response.ok ? await response.json() as T : null;
  } catch {
    return null;
  }
}

export async function getProfileBundle(handle: string) {
  const profile = await getJson<PublicProfile>(`/profiles/${encodeURIComponent(handle)}`);
  if (!profile) return null;
  const [categories, collections, posts] = await Promise.all([
    getJson<PublicCategory[]>(`/profiles/${encodeURIComponent(handle)}/categories`),
    getJson<PublicCollection[]>(`/profiles/${encodeURIComponent(handle)}/collections`),
    getJson<PublicPost[]>(`/profiles/${encodeURIComponent(handle)}/posts`)
  ]);
  return { profile, categories: categories ?? [], collections: collections ?? [], posts: posts ?? [] };
}

export async function getCategoryPosts(handle: string, category: string) {
  return getJson<PublicPost[]>(`/profiles/${encodeURIComponent(handle)}/categories/${encodeURIComponent(category)}/posts`);
}

export function formatPublicationDate(value: string | null): string {
  if (!value) return "Draft";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
