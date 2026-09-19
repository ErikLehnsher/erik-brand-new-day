import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPublicationDate, getProfileBundle } from "../../publication-api";

export default async function ProfilePostsPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const bundle = await getProfileBundle(handle);
  if (!bundle) notFound();
  return <main className="profile-page profile-list-page"><Link href={`/${handle}`} className="profile-back">← {bundle.profile.display_name}</Link><header className="profile-list-heading"><p>All writing</p><h1>Mọi bài viết</h1><span>/{handle}</span></header><div className="profile-writing-list">{bundle.posts.map((post) => <article key={post.id}><p>{post.category} · {formatPublicationDate(post.published_at)}</p><h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2><span>{post.excerpt}</span></article>)}</div></main>;
}
