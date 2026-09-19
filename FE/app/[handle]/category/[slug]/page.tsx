import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPublicationDate, getCategoryPosts, getProfileBundle } from "../../../publication-api";

export default async function CategoryPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const bundle = await getProfileBundle(handle);
  const posts = await getCategoryPosts(handle, slug);
  const category = bundle?.categories.find((item) => item.slug === slug);
  if (!bundle || !category || posts === null) notFound();
  return <main className="profile-page profile-list-page"><Link href={`/${handle}`} className="profile-back">← {bundle.profile.display_name}</Link><header className="profile-list-heading"><p style={{ color: category.color || undefined }}>Category</p><h1>{category.name}</h1><span>{category.description || `Bài viết thuộc ${category.name}.`}</span></header><div className="profile-writing-list">{posts.length ? posts.map((post) => <article key={post.id}><p>{formatPublicationDate(post.published_at)}</p><h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2><span>{post.excerpt}</span></article>) : <div className="profile-empty">Chuyên mục này chưa có bài viết công khai.</div>}</div></main>;
}
