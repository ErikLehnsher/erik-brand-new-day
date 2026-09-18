import Image from "next/image";
import Link from "next/link";

type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "daily" | "odoo" | "technology" | "video";
  cover_image_url: string | null;
  video_url: string | null;
  published_at: string | null;
  created_at: string;
};

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOPICS = [
  { id: "daily", label: "Daily", description: "Những ghi chép nhỏ, đời sống và công việc." },
  { id: "odoo", label: "Odoo", description: "Triển khai, kỹ thuật và những thứ học được khi vận hành ERP." },
  { id: "technology", label: "Technology", description: "AI, product, engineering và những công cụ đáng để nhớ." },
  { id: "video", label: "Video", description: "Một góc nhìn nhanh qua hình ảnh và video." }
] as const;

async function getPosts(): Promise<PostSummary[]> {
  try {
    const response = await fetch(`${API_BASE}/posts`, { cache: "no-store" });
    return response.ok ? (await response.json()) as PostSummary[] : [];
  } catch { return []; }
}

function formatDate(value: string | null): string {
  return value ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Draft";
}

function topicLabel(category: string) { return TOPICS.find((topic) => topic.id === category)?.label ?? "Notes"; }

function PostVisual({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  if (post.cover_image_url) return <img src={post.cover_image_url} alt="" className="publication-cover" loading={priority ? "eager" : "lazy"} />;
  return <div className={`publication-fallback publication-fallback-${post.category}`}><span>{topicLabel(post.category)}</span></div>;
}

function ReadingCard({ post, compact = false }: { post: PostSummary; compact?: boolean }) {
  return <article className={`reading-card ${compact ? "reading-card-compact" : ""}`}>
    <Link href={`/posts/${post.slug}`} className="reading-card-visual" aria-label={`Đọc ${post.title}`}><PostVisual post={post} />{post.category === "video" ? <span className="play-mark">▶</span> : null}</Link>
    <div className="reading-card-copy"><div className="reading-meta"><span>{topicLabel(post.category)}</span><span>{formatDate(post.published_at)}</span></div><h3><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>{!compact ? <p>{post.excerpt}</p> : null}</div>
  </article>;
}

export default async function HomePage() {
  const posts = await getPosts();
  const featured = posts[0];
  const recent = posts.slice(1, 5);
  const videos = posts.filter((post) => post.category === "video").slice(0, 3);
  return <main className="page publication-home">
    <section className="publication-intro"><p className="publication-kicker">Erik Brand New Day</p><div className="publication-intro-row"><h1>Viết về những điều đang sống, đang xây, và đáng để lưu lại.</h1><p>Một nơi cho daily notes, Odoo, công nghệ, video và những quan sát chưa kịp thuộc về đâu cả.</p></div><nav className="topic-rail" aria-label="Topics">{TOPICS.map((topic) => <a href={`#${topic.id}`} key={topic.id}>{topic.label}</a>)}</nav></section>
    {featured ? <section className="publication-lead"><Link href={`/posts/${featured.slug}`} className="publication-lead-visual" aria-label={`Đọc ${featured.title}`}>{featured.cover_image_url ? <PostVisual post={featured} priority /> : <Image src="/brand/portrait.png" alt="Erik" fill priority sizes="(max-width: 900px) 100vw, 55vw" className="publication-portrait" />}{featured.category === "video" ? <span className="lead-play">▶ Watch</span> : null}</Link><article className="publication-lead-copy"><div className="reading-meta"><span>{topicLabel(featured.category)}</span><span>{formatDate(featured.published_at)}</span></div><h2>{featured.title}</h2><p>{featured.excerpt}</p><Link href={`/posts/${featured.slug}`} className="publication-link">Đọc bài viết <span>↗</span></Link></article></section> : <section className="publication-empty"><p>Chưa có bài viết nào. Bắt đầu từ một ghi chú ngắn nhé.</p></section>}
    <section id="daily" className="publication-stream"><div className="section-title"><div><p className="publication-kicker">Mới nhất</p><h2>Đọc tiếp</h2></div><Link href="/posts/new" className="publication-link">Viết bài mới ↗</Link></div><div className="reading-grid">{recent.map((post) => <ReadingCard key={post.id} post={post} />)}</div></section>
    {TOPICS.filter((topic) => topic.id !== "video").map((topic) => { const post = posts.find((item) => item.category === topic.id); return <section id={topic.id} className="topic-feature" key={topic.id}><div><p className="publication-kicker">{topic.label}</p><h2>{topic.description}</h2></div>{post ? <ReadingCard post={post} compact /> : <p className="topic-empty">Bài viết đầu tiên cho mục này đang được chuẩn bị.</p>}</section>; })}
    <section id="video" className="video-shelf"><div className="section-title"><div><p className="publication-kicker">Video</p><h2>Watch &amp; learn</h2></div></div><div className="video-grid">{videos.length ? videos.map((post) => <ReadingCard key={post.id} post={post} />) : <p className="topic-empty">Đăng một bài có Topic “Video” và Video URL để bắt đầu video shelf.</p>}</div></section>
    <footer className="publication-footer"><span>Erik Brand New Day</span><span>Daily notes · Odoo · Technology · Video</span></footer>
  </main>;
}
