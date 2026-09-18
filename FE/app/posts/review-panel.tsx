"use client";

import { useState } from "react";
import { getSession } from "../session";

export type Review = {
  id: string;
  rating: number;
  body: string;
  author_name: string;
  created_at: string;
};

type ReviewSummary = {
  count: number;
  average_rating: number | null;
  reviews: Review[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function Stars({ rating }: { rating: number }) {
  return <span className="review-stars" aria-label={`${rating} out of 5 stars`}>{"★★★★★".split("").map((star, index) => <span key={`${star}-${index}`} className={index < rating ? "is-filled" : ""}>{star}</span>)}</span>;
}

export function ReviewPanel({ slug, initial }: { slug: string; initial: ReviewSummary }) {
  const [summary, setSummary] = useState(initial);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session) {
      window.location.href = `/login?next=${encodeURIComponent(`/posts/${slug}`)}`;
      return;
    }
    if (!rating) {
      setError("Chọn số sao trước khi gửi review nhé.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/posts/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ rating, body })
      });
      const review: Review & { detail?: string } = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(review.detail ?? "Không thể gửi review lúc này.");
      const withoutCurrentAuthor = summary.reviews.filter((item) => item.author_name !== review.author_name);
      const reviews = [review, ...withoutCurrentAuthor];
      const average_rating = reviews.reduce((total, item) => total + item.rating, 0) / reviews.length;
      setSummary({ reviews, count: reviews.length, average_rating: Math.round(average_rating * 10) / 10 });
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi review lúc này.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="review-panel" aria-labelledby="reviews-title">
    <div className="review-summary">
      <p className="publication-kicker">Community reviews</p>
      <div className="review-score"><strong>{summary.average_rating?.toFixed(1) ?? "–"}</strong><div><Stars rating={Math.round(summary.average_rating ?? 0)} /><span>{summary.count} review{summary.count === 1 ? "" : "s"}</span></div></div>
    </div>
    <div className="review-content">
      <h2 id="reviews-title">Bạn thấy bài này thế nào?</h2>
      <form onSubmit={submitReview} className="review-form">
        <div className="rating-picker" aria-label="Your rating">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={value <= rating ? "is-selected" : ""} onClick={() => setRating(value)} aria-label={`${value} stars`}>★</button>)}</div>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={3} maxLength={2000} placeholder="Chia sẻ một nhận xét ngắn…" required />
        {error ? <p className="auth-error">{error}</p> : null}
        <button className="review-submit" type="submit" disabled={saving}>{saving ? "Đang gửi…" : "Gửi review"}</button>
      </form>
      {summary.reviews.length ? <div className="review-list">{summary.reviews.map((review) => <article className="review-item" key={review.id}><div><strong>{review.author_name}</strong><Stars rating={review.rating} /></div><p>{review.body}</p><time>{new Date(review.created_at).toLocaleDateString("vi-VN")}</time></article>)}</div> : <p className="review-empty">Chưa có review nào. Hãy là người đầu tiên.</p>}
    </div>
  </section>;
}
