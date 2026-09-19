import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPublicationDate, getProfileBundle, type PublicPost } from "../publication-api";

function PostCard({ post, handle }: { post: PublicPost; handle: string }) {
  return <article className="profile-post-card">
    <Link href={`/posts/${post.slug}`} className="profile-post-visual" aria-label={`Đọc ${post.title}`}>
      {post.cover_image_url ? <img src={post.cover_image_url} alt="" /> : <span>{post.category.slice(0, 1)}</span>}
    </Link>
    <div><p>{post.category} · {formatPublicationDate(post.published_at)}</p><h3><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3><span className="profile-post-handle">/{handle}</span></div>
  </article>;
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const bundle = await getProfileBundle(handle);
  if (!bundle) notFound();
  const { profile, categories, collections, posts } = bundle;
  const initials = profile.display_name.trim().slice(0, 2).toUpperCase();

  return <main className={`profile-page profile-theme-${profile.default_theme}`}>
    <section className="profile-hero">
      <div className="profile-avatar">{profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : initials}</div>
      <div className="profile-hero-copy"><p className="profile-handle">/{profile.handle}</p><h1>{profile.display_name}</h1><p>{profile.bio || "Một không gian để viết, lưu lại và chia sẻ những điều có ý nghĩa."}</p><div className="profile-stats"><span><strong>{posts.length}</strong> bài viết</span><span><strong>{categories.length}</strong> chuyên mục</span><span><strong>{collections.length}</strong> tuyển tập</span></div></div>
      <Link className="profile-follow-link" href={`/posts/new?profile=${profile.handle}`}>Viết bài</Link>
    </section>

    <nav className="profile-category-nav" aria-label="Profile categories"><Link href={`/${profile.handle}/posts`}>Tất cả</Link>{categories.map((category) => <Link key={category.id} href={`/${profile.handle}/category/${category.slug}`}>{category.name}</Link>)}</nav>

    {collections.length ? <section className="profile-section"><div className="profile-section-head"><p>Collections</p><h2>Đọc theo tuyển tập</h2></div><div className="profile-collection-grid">{collections.map((collection) => <article key={collection.id} className="profile-collection-card"><div>{collection.cover_image_url ? <img src={collection.cover_image_url} alt="" /> : <span>{collection.title.slice(0, 1)}</span>}</div><p>{collection.theme_override || profile.default_theme}</p><h3>{collection.title}</h3><span>{collection.introduction || "Một tuyển tập đang được xây dựng."}</span></article>)}</div></section> : null}

    <section className="profile-section"><div className="profile-section-head"><p>Recent writing</p><h2>Những bài mới nhất</h2><Link href={`/${profile.handle}/posts`}>Xem tất cả ↗</Link></div>{posts.length ? <div className="profile-post-grid">{posts.slice(0, 6).map((post) => <PostCard key={post.id} post={post} handle={profile.handle} />)}</div> : <div className="profile-empty">Chưa có bài viết công khai nào.</div>}</section>
  </main>;
}
