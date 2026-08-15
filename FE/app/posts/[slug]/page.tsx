import Link from "next/link";

type TipTapMark = {
  type: string;
  attrs?: Record<string, string>;
};

type TipTapNode = {
  type: string;
  attrs?: Record<string, string | number | null | undefined>;
  text?: string;
  marks?: TipTapMark[];
  content?: TipTapNode[];
};

type PostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
  published_at: string | null;
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function getPost(slug: string): Promise<PostDetail | null> {
  try {
    const response = await fetch(`${API_BASE}/posts/${slug}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PostDetail;
  } catch {
    return null;
  }
}

function parsePostContent(content: string): TipTapNode[] | null {
  try {
    const parsed = JSON.parse(content) as { type?: string; content?: TipTapNode[] };
    if (!parsed || parsed.type !== "doc" || !Array.isArray(parsed.content)) return null;
    return parsed.content;
  } catch {
    return null;
  }
}

function renderMarks(text: string, marks?: TipTapMark[], key?: string) {
  let node: React.ReactNode = text;
  const markTypes = marks?.map((mark) => mark.type) ?? [];
  const color = marks?.find((mark) => mark.type === "textStyle")?.attrs?.color;
  const fontFamily = marks?.find((mark) => mark.type === "textStyle")?.attrs?.fontFamily;

  if (color || fontFamily) {
    node = <span style={{ color, fontFamily }}>{node}</span>;
  }
  if (markTypes.includes("bold")) node = <strong>{node}</strong>;
  if (markTypes.includes("italic")) node = <em>{node}</em>;
  if (markTypes.includes("strike")) node = <s>{node}</s>;
  if (markTypes.includes("underline")) node = <u>{node}</u>;
  return <span key={key}>{node}</span>;
}

function renderNode(node: TipTapNode, key: string): React.ReactNode {
  if (node.type === "paragraph") {
    return <p key={key} className="post-block-paragraph">{renderInline(node.content)}</p>;
  }

  if (node.type === "heading") {
    const level = Number(node.attrs?.level ?? 2);
    const HeadingTag = (`h${Math.min(Math.max(level, 1), 3)}` as "h1" | "h2" | "h3");
    return <HeadingTag key={key} className="post-block-heading">{renderInline(node.content)}</HeadingTag>;
  }

  if (node.type === "blockquote") {
    return <blockquote key={key} className="post-block-quote">{renderChildren(node.content)}</blockquote>;
  }

  if (node.type === "bulletList") {
    return <ul key={key} className="post-block-list">{renderChildren(node.content)}</ul>;
  }

  if (node.type === "orderedList") {
    return <ol key={key} className="post-block-list">{renderChildren(node.content)}</ol>;
  }

  if (node.type === "listItem") {
    return <li key={key}>{renderChildren(node.content)}</li>;
  }

  if (node.type === "horizontalRule") {
    return <hr key={key} className="post-divider" />;
  }

  if (node.type === "image") {
    return <img key={key} src={String(node.attrs?.src ?? "")} alt={String(node.attrs?.alt ?? "Post image")} className="post-inline-image" />;
  }

  return <div key={key}>{renderChildren(node.content)}</div>;
}

function renderInline(nodes?: TipTapNode[]) {
  if (!nodes?.length) return null;
  return nodes.map((node, index) => {
    if (node.type === "text") {
      return renderMarks(node.text ?? "", node.marks, `text-${index}`);
    }
    if (node.type === "hardBreak") {
      return <br key={`br-${index}`} />;
    }
    return renderNode(node, `inline-${index}`);
  });
}

function renderChildren(nodes?: TipTapNode[]) {
  if (!nodes?.length) return null;
  return nodes.map((node, index) => renderNode(node, `${node.type}-${index}`));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const parsed = post ? parsePostContent(post.content) : null;

  if (!post) {
    return (
      <main className="page">
        <section className="hero">
          <p className="eyebrow">Post not found</p>
          <h1 className="title">This story has not been written yet.</h1>
          <p className="subtitle">The slug `{slug}` does not match a published post.</p>
          <Link className="text-link" href="/">
            Back to homepage
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <article className="hero post-detail">
        <p className="eyebrow">Published post</p>
        <h1 className="title">{post.title}</h1>
        <p className="subtitle">{post.excerpt}</p>
        <div className="post-detail-meta">
          <span>{post.status}</span>
          <span>
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })
              : "Draft"}
          </span>
        </div>
        <div className="post-body">
          {parsed?.length
            ? renderChildren(parsed)
            : post.content.split("\n\n").map((paragraph, index) => (
                <p key={`${slug}-${index}`} className="post-block-paragraph">
                  {paragraph}
                </p>
              ))}
        </div>
        <Link className="text-link" href="/">
          Back to posts
        </Link>
      </article>
    </main>
  );
}
