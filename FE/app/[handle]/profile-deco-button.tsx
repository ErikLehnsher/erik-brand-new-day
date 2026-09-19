"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "../session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export function ProfileDecoButton({ handle }: { handle: string }) {
  const [ownsProfile, setOwnsProfile] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    fetch(`${API_BASE}/studio/profile`, { headers: { Authorization: `Bearer ${session.accessToken}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((profile: { handle?: string } | null) => setOwnsProfile(profile?.handle === handle))
      .catch(() => setOwnsProfile(false));
  }, [handle]);

  return ownsProfile ? <Link className="profile-deco-link" href="/studio/profile">Deco ↗</Link> : null;
}
