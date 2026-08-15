import Image from "next/image";

const pillars = [
  {
    title: "Blog first",
    body: "A personal publishing home for essays, updates, notes, and stories that can grow into a public brand."
  },
  {
    title: "Calendar aware",
    body: "Gregorian and lunar dates will live in the same product so reminders and events feel native to daily life."
  },
  {
    title: "Future-ready",
    body: "The structure leaves room for mobile, sync, reminders, and other personal tools without a rewrite."
  }
];

export default function AboutPage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="brand-grid">
          <div className="brand-copy">
            <p className="eyebrow">About Erik Brand New Day</p>
            <h1 className="title">A personal digital home that can grow into a brand.</h1>
            <p className="subtitle">
              This is the original brand and product vision page. It explains the tone, the mascot
              system, and the larger direction behind the blog-first homepage.
            </p>
          </div>

          <aside className="brand-card" aria-label="Brand portrait">
            <div className="portrait-frame">
              <Image
                src="/brand/portrait.png"
                alt="Erik portrait in a cinematic vintage style"
                fill
                sizes="(max-width: 900px) 100vw, 420px"
                priority
                className="portrait-image"
              />
            </div>
            <div className="brand-caption">
              <span className="brand-caption-label">Brand tone</span>
              <strong>Grand Budapest warmth, editorial and personal.</strong>
              <p>
                Use this portrait as the human anchor of the ecosystem. It belongs in the about
                section, author bio, and future portfolio pages.
              </p>
            </div>
          </aside>
        </div>

        <div className="blend-gallery" aria-label="Mascot illustrations">
          <article className="blend-card blend-cat">
            <div className="blend-stage">
              <Image
                src="/brand/cat-poster.png"
                alt="Vintage poster-style white cat mascot"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                className="blend-poster blend-poster-cat"
              />
              <div className="blend-badge blend-badge-left">Cat / story mode</div>
            </div>
          </article>
          <article className="blend-card blend-dog">
            <div className="blend-stage">
              <Image
                src="/brand/header-dog.png"
                alt="Vintage poster-style dog mascot"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                className="blend-poster blend-poster-dog"
              />
              <div className="blend-badge">Dog / daily mode</div>
            </div>
          </article>
        </div>
      </section>

      <section className="grid" aria-label="Product pillars">
        {pillars.map((pillar) => (
          <article className="card" key={pillar.title}>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      <footer className="site-footer">
        <div className="site-footer-badge">
          <span className="footer-mascot-frame" aria-hidden="true">
            <Image src="/brand/header-cat.png" alt="" fill sizes="42px" className="footer-mascot-image" />
          </span>
          <span>Built for stories, daily life, and a personal brand system.</span>
          <span className="footer-mascot-frame" aria-hidden="true">
            <Image src="/brand/header-dog.png" alt="" fill sizes="42px" className="footer-mascot-image" />
          </span>
        </div>
      </footer>
    </main>
  );
}
