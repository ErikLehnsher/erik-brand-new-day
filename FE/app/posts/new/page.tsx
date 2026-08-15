"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TiptapPostEditor } from "../tiptap-post-editor";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function NewPostPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="page">
      <TiptapPostEditor
        loading={loading}
        error={error}
        setError={setError}
        onPublish={async (payload) => {
          setLoading(true);
          setError(null);

          try {
            const response = await fetch(`${API_BASE}/posts`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            const data: { detail?: string; slug?: string } = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data.detail ?? "Failed to create post");
            }

            const slug = data.slug ?? payload.slug;
            router.push(`/posts/${slug}`);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown post error");
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}
