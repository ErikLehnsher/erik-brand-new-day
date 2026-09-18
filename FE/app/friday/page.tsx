"use client";

import { FormEvent, useState } from "react";
import { getSession } from "../session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function FridayPage() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }
    const message = prompt.trim();
    if (!message) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ prompt: message })
      });
      const data = (await response.json().catch(() => ({}))) as { answer?: string; detail?: string };
      if (!response.ok || !data.answer) {
        throw new Error(data.detail ?? "Friday could not respond.");
      }
      setAnswer(data.answer);
      setPrompt("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Friday could not respond.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero hero-auth">
        <div className="auth-copy">
          <p className="eyebrow">Private assistant</p>
          <h1 className="title">Friday</h1>
          <p className="subtitle">Your messages stay in a private workspace tied to this website account.</p>
        </div>
        <form className="auth-card" onSubmit={sendMessage}>
          <label className="field">
            <span>What would you like to do?</span>
            <textarea
              name="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={6}
              placeholder="Ask Friday anything that does not need elevated access."
              required
            />
          </label>
          {answer ? <pre className="auth-error" style={{ whiteSpace: "pre-wrap", color: "inherit" }}>{answer}</pre> : null}
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Friday is thinking…" : "Send to Friday"}
          </button>
        </form>
      </section>
    </main>
  );
}
