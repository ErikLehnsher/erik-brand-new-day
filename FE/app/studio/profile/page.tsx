"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSession } from "../../session";

type ProfileForm = {
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  visibility: "public" | "private";
  default_theme: string;
};

type Theme = { id: string; name: string; description: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ProfileStudioPage() {
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const session = useMemo(() => getSession(), []);

  useEffect(() => {
    if (!session) return;
    const headers = { Authorization: `Bearer ${session.accessToken}` };
    Promise.all([
      fetch(`${API_BASE}/studio/profile`, { headers }),
      fetch(`${API_BASE}/studio/themes`, { headers })
    ]).then(async ([profileResponse, themeResponse]) => {
      if (!profileResponse.ok) throw new Error("Không thể tải profile. Hãy đăng nhập lại.");
      const profile = await profileResponse.json();
      const themeData = themeResponse.ok ? await themeResponse.json() : { themes: [] };
      setForm({
        handle: profile.handle,
        display_name: profile.display_name,
        bio: profile.bio ?? "",
        avatar_url: profile.avatar_url ?? "",
        visibility: profile.visibility,
        default_theme: profile.default_theme
      });
      setThemes(themeData.themes ?? []);
    }).catch((reason: Error) => setError(reason.message));
  }, [session]);

  function change(field: keyof ProfileForm, value: string) {
    setForm((current) => current ? { ...current, [field]: value } : current);
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !form) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const headers = { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" };
      const profileResponse = await fetch(`${API_BASE}/studio/profile`, {
        method: "PUT", headers,
        body: JSON.stringify({
          handle: form.handle.trim().toLowerCase(),
          display_name: form.display_name.trim(),
          bio: form.bio.trim() || null,
          avatar_url: form.avatar_url.trim() || null,
          visibility: form.visibility
        })
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileData.detail ?? "Không thể lưu profile.");
      const themeResponse = await fetch(`${API_BASE}/studio/theme`, {
        method: "PUT", headers,
        body: JSON.stringify({ default_theme: form.default_theme, theme_settings: {} })
      });
      const themeData = await themeResponse.json();
      if (!themeResponse.ok) throw new Error(themeData.detail ?? "Không thể lưu giao diện.");
      setForm((current) => current ? { ...current, handle: profileData.handle } : current);
      setMessage("Đã lưu profile và giao diện của bạn.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Đã có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  if (!session) return <main className="studio-page"><section className="studio-login"><p>Profile studio</p><h1>Đăng nhập để chỉnh không gian của bạn.</h1><Link href="/login">Đăng nhập →</Link></section></main>;
  if (!form) return <main className="studio-page"><p className="studio-loading">{error || "Đang tải profile…"}</p></main>;

  const initials = form.display_name.trim().slice(0, 2).toUpperCase() || "ME";
  return <main className="studio-page">
    <section className="studio-intro"><div><p>Profile studio</p><h1>Thiết kế nơi<br />người khác đọc bạn.</h1><span>Profile là trang chủ riêng: giới thiệu, chuyên mục và nhịp trình bày của chính bạn.</span></div><Link href={`/${form.handle}`}>Xem profile công khai ↗</Link></section>
    <section className="studio-layout">
      <form className="studio-form" onSubmit={save}>
        <div className="studio-form-head"><p>Identity</p><h2>Thông tin cơ bản</h2></div>
        <label>Tên hiển thị<input value={form.display_name} onChange={(event) => change("display_name", event.target.value)} required maxLength={120} /></label>
        <label>Handle<input value={form.handle} onChange={(event) => change("handle", event.target.value.replace(/\s+/g, "-").toLowerCase())} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" minLength={3} /><small>Chỉ dùng chữ thường, số và dấu gạch ngang. URL: /{form.handle || "ten-cua-ban"}</small></label>
        <label>Giới thiệu<textarea value={form.bio} onChange={(event) => change("bio", event.target.value)} rows={4} maxLength={1000} placeholder="Bạn viết về điều gì?" /></label>
        <label>Avatar URL<input type="url" value={form.avatar_url} onChange={(event) => change("avatar_url", event.target.value)} placeholder="https://…" /></label>
        <fieldset><legend>Hiển thị</legend><label className="studio-choice"><input type="radio" checked={form.visibility === "public"} onChange={() => change("visibility", "public")} /> Công khai — mọi người có thể mở profile</label><label className="studio-choice"><input type="radio" checked={form.visibility === "private"} onChange={() => change("visibility", "private")} /> Riêng tư — chỉ bạn xem được trong Studio</label></fieldset>
        <div className="studio-form-head studio-theme-heading"><p>Appearance</p><h2>Theme mặc định</h2></div>
        <div className="studio-theme-grid">{themes.map((theme) => <label key={theme.id} className={`studio-theme-option ${form.default_theme === theme.id ? "is-selected" : ""}`}><input type="radio" name="theme" value={theme.id} checked={form.default_theme === theme.id} onChange={() => change("default_theme", theme.id)} /><strong>{theme.name}</strong><span>{theme.description}</span></label>)}</div>
        {error ? <p className="studio-notice is-error">{error}</p> : null}{message ? <p className="studio-notice">{message}</p> : null}
        <button className="studio-save" disabled={saving}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button>
      </form>
      <aside className={`studio-preview profile-theme-${form.default_theme}`}><p>Live preview</p><div className="studio-preview-card"><div className="studio-preview-avatar">{form.avatar_url ? <img src={form.avatar_url} alt="" /> : initials}</div><span>/{form.handle || "your-handle"}</span><h2>{form.display_name || "Tên của bạn"}</h2><p>{form.bio || "Một vài dòng giới thiệu để người đọc biết họ đang ở đâu."}</p><div><b>12</b> bài viết <b>4</b> chuyên mục</div></div></aside>
    </section>
  </main>;
}
