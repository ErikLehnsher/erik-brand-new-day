import Image from "next/image";
import Link from "next/link";

type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string | null;
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function getPosts(): Promise<PostSummary[]> {
  try {
    const response = await fetch(`${API_BASE}/posts`, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as PostSummary[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="page page-home">
      <section className="hero home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Erik Brand New Day</p>
          <h1 className="title">Stories, daily logs, and long-form posts.</h1>
          <p className="subtitle">
            This homepage now pulls from the blog API. The old intro content lives in About, while
            this page becomes the real front door to your writing.
          </p>
        </div>

        <aside className="home-hero-aside" aria-label="Brand portrait">
          <div className="portrait-frame">
            <Image
              src="/brand/portrait.png"
              alt="Erik portrait in a cinematic vintage style"
              fill
              sizes="(max-width: 900px) 100vw, 380px"
              priority
              className="portrait-image"
            />
          </div>
          <div className="brand-caption">
            <span className="brand-caption-label">Latest mood</span>
            <strong>Red-dominant, vintage, intimate, and editorial.</strong>
            <p>This portrait stays as the author image while the page leads with posts rather than a landing pitch.</p>
          </div>
        </aside>
      </section>

      <section className="post-grid" aria-label="Recent posts">
        {posts.map((post) => (
          <article className="post-card" key={post.id}>
            <div className="post-card-top">
              <span className="post-tag">Published</span>
              <span className="post-date">
                {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Draft"}
              </span>
            </div>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <Link href={`/posts/${post.slug}`} className="text-link">
              Read post
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
