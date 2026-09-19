"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSession } from "../session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
type Key = { id: string; label: string; prefix: string; status: string; };
type Access = { status: string | null; hourly_limit_minutes: number | null; window_used_seconds: number; admin_note: string | null; keys: Key[] };

export default function FridayPage() {
  const [access, setAccess] = useState<Access | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyLabel, setKeyLabel] = useState("My local app");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = () => getSession()?.accessToken ?? null;
  const loadAccess = async () => { const token = auth(); if (!token) return; const response = await fetch(`${API_BASE}/agent/access`, { headers: { Authorization: `Bearer ${token}` } }); if (response.ok) setAccess(await response.json()); };
  useEffect(() => { loadAccess().catch(() => setError("Không thể tải trạng thái Friday.")); }, []);
  const approved = access?.status === "approved";

  async function requestAccess() { const token = auth(); if (!token) return window.location.assign("/login"); setLoading(true); setError(null); try { const response = await fetch(`${API_BASE}/agent/access/request`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error("Không thể gửi yêu cầu quyền."); setAccess(await response.json()); } catch (reason) { setError(reason instanceof Error ? reason.message : "Đã có lỗi xảy ra."); } finally { setLoading(false); } }
  async function createKey(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const token = auth(); if (!token) return; setLoading(true); setApiKey(null); try { const response = await fetch(`${API_BASE}/agent/keys`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ label: keyLabel }) }); const data = await response.json(); if (!response.ok) throw new Error(data.detail ?? "Không thể tạo API key."); setApiKey(data.api_key); await loadAccess(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Đã có lỗi xảy ra."); } finally { setLoading(false); } }
  async function revokeKey(keyId: string) { const token = auth(); if (!token || !window.confirm("Revoke API key này?")) return; await fetch(`${API_BASE}/agent/keys/${keyId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); await loadAccess(); }

  return <main className="friday-page"><section className="friday-hero"><p>One agent · private workspaces</p><h1>Friday<br />Access.</h1><span>Một Friday duy nhất trên server; mỗi user là một workspace, session và quota riêng.</span></section><section className="friday-grid"><article className="friday-card"><p className="friday-label">01 · Access</p><h2>{approved ? "Friday đã sẵn sàng" : access?.status === "pending" ? "Đang chờ admin duyệt" : "Xin quyền dùng Friday"}</h2><p>{approved ? "Workspace riêng của bạn đã được cấp." : "Khi admin duyệt, Friday tạo workspace và session riêng cho bạn."}</p>{approved ? <div className="friday-quota"><strong>{Math.ceil((access?.window_used_seconds ?? 0) / 60)}/{access?.hourly_limit_minutes} phút</strong><span>đã dùng trong 60 phút</span></div> : <button className="friday-action" onClick={requestAccess} disabled={loading || access?.status === "pending"}>{access?.status === "pending" ? "Đã gửi yêu cầu" : "Xin quyền sử dụng"}</button>}{access?.admin_note ? <small>{access.admin_note}</small> : null}</article><article className="friday-card"><p className="friday-label">02 · API keys</p><h2>Keys của bạn</h2><p>Key chỉ hiện một lần và có thể thu hồi bất kỳ lúc nào.</p>{approved ? <><form className="friday-key-form" onSubmit={createKey}><input value={keyLabel} onChange={(event) => setKeyLabel(event.target.value)} maxLength={80} required /><button disabled={loading}>Tạo API key</button></form>{apiKey ? <div className="friday-secret"><strong>Sao chép ngay — key này sẽ không hiện lại.</strong><code>{apiKey}</code></div> : null}<div className="friday-key-list">{access?.keys.map((key) => <div key={key.id}><span><b>{key.label}</b><small>{key.prefix}… · {key.status}</small></span>{key.status === "active" ? <button onClick={() => revokeKey(key.id)}>Revoke</button> : null}</div>)}</div></> : <div className="friday-locked">Cần được admin duyệt trước khi tạo API key.</div>}</article></section>{error ? <p className="friday-error">{error}</p> : null}</main>;
}
