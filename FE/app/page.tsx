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

const API_BASE =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

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

function formatDate(value: string | null): string {
  if (!value) return "In the notebook";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export default async function HomePage() {
  const posts = await getPosts();
  const [featured, ...journal] = posts;

  return (
    <main className="page page-home editorial-home">
      <section className="editorial-masthead" aria-labelledby="home-title">
        <p className="editorial-kicker">Erik Brand New Day · Journal</p>
        <div className="editorial-masthead-row">
          <h1 id="home-title">A quieter place for the things worth keeping.</h1>
          <p>
            Notes on work, culture, building, and the shape of an ordinary day.
            Written slowly. Kept close.
          </p>
        </div>
      </section>

      {featured ? (
        <article className="featured-story">
          <div className="featured-story-copy">
            <div className="featured-meta">
              <span>Featured story</span>
              <span>{formatDate(featured.published_at)}</span>
            </div>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <Link href={`/posts/${featured.slug}`} className="editorial-link">
              Read the story <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <aside className="featured-portrait" aria-label="Portrait of Erik">
            <Image
              src="/brand/portrait.png"
              alt="Erik portrait"
              fill
              sizes="(max-width: 900px) 100vw, 480px"
              priority
              className="portrait-image"
            />
            <span className="portrait-note">Field notes · 2026</span>
          </aside>
        </article>
      ) : (
        <section className="empty-journal">
          <p className="editorial-kicker">The journal is beginning</p>
          <h2>The first story is on its way.</h2>
        </section>
      )}

      <section className="journal-section" aria-label="More stories">
        <div className="journal-heading">
          <div>
            <p className="editorial-kicker">From the journal</p>
            <h2>Recent writing</h2>
          </div>
          <Link href="/friday" className="quiet-link">Talk to Friday <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="journal-list">
          {journal.map((post, index) => (
            <article className="journal-entry" key={post.id}>
              <span className="journal-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="journal-entry-copy">
                <p className="journal-date">{formatDate(post.published_at)}</p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
              <Link href={`/posts/${post.slug}`} className="entry-arrow" aria-label={`Read ${post.title}`}>↗</Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="editorial-footer">
        <span>Erik Brand New Day</span>
        <span>A personal journal, in progress.</span>
      </footer>
    </main>
  );
}
