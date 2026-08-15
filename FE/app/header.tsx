"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearSession, getSession, onSessionChange, SessionState } from "./session";

const guestNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" }
];

const memberNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/posts/new", label: "New post" },
  { href: "/logout", label: "Logout" }
];

export function Header() {
  const [session, setSessionState] = useState<SessionState | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    sync();
    return onSessionChange(sync);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const navItems = useMemo(() => (session ? memberNavItems : guestNavItems), [session]);
  const displayName = session?.user.display_name ?? "Erik Brand New Day";

  return (
    <header className="site-header">
      <div className="site-brand">
        <a href="/" className="site-brand-link">
          <span className="mini-mascot mini-mascot-frame mini-mascot-left" aria-hidden="true">
            <Image src="/brand/header-cat.png" alt="" fill sizes="64px" className="mini-mascot-image" />
          </span>
          <span className="site-brand-text">{displayName}</span>
          <span className="mini-mascot mini-mascot-frame mini-mascot-right" aria-hidden="true">
            <Image src="/brand/header-dog.png" alt="" fill sizes="64px" className="mini-mascot-image" />
          </span>
        </a>
      </div>

      <div className="site-header-actions" ref={menuRef}>
        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="site-nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        {session ? (
          <div className="user-menu-wrap">
            <button className="user-menu-trigger" type="button" onClick={() => setOpen((value) => !value)}>
              <span className="user-menu-pill">{session.user.display_name}</span>
              <span className="user-menu-caret">▾</span>
            </button>
            {open ? (
              <div className="user-menu-dropdown" role="menu" aria-label="User detail menu">
                <div className="user-menu-meta">
                  <strong>{session.user.display_name}</strong>
                  <span>{session.user.email}</span>
                </div>
                <a href="/posts/new" role="menuitem">New post</a>
                <a href="/about" role="menuitem">About profile</a>
                <a href="/logout" role="menuitem">Log out</a>
                <button
                  type="button"
                  onClick={() => {
                    clearSession();
                    setOpen(false);
                    window.location.href = "/";
                  }}
                >
                  Clear session
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
