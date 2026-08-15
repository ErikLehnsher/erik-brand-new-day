"use client";

import { useEffect } from "react";
import { clearSession } from "../session";

export default function LogoutPage() {
  useEffect(() => {
    clearSession();
  }, []);

  return (
    <main className="page">
      <section className="hero hero-auth">
        <div className="auth-copy">
          <p className="eyebrow">Session</p>
          <h1 className="title">See you soon.</h1>
          <p className="subtitle">
            Your local session has been cleared and the header will switch back to guest mode.
          </p>
        </div>

        <div className="auth-card">
          <p className="card-label">You are signed out.</p>
          <a className="primary-button" href="/login">
            Go back to login
          </a>
        </div>
      </section>
    </main>
  );
}
