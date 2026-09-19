"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "../../session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
type Request = { user_id: string; email: string; status: string; hourly_limit_minutes: number; requested_at: string; admin_note: string | null };

export default function FridayAdminPage() {
  const [requests, setRequests] = useState<Request[]>([]); const [error, setError] = useState(""); const [ready, setReady] = useState(false);
  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getSession()?.accessToken ?? ""}` });
  const load = async () => { const response = await fetch(`${API_BASE}/agent/admin/access`, { headers: headers() }); if (response.status === 403) throw new Error("Tài khoản này chưa được cấu hình là Friday admin. Thêm email đăng nhập vào FRIDAY_ADMIN_EMAILS rồi restart backend."); if (!response.ok) throw new Error("Không thể tải danh sách yêu cầu Friday."); setRequests(await response.json()); };
  useEffect(() => { load().catch((reason) => setError(reason.message)).finally(() => setReady(true)); }, []);
  const decide = async (request: Request, status: "approved" | "revoked") => { const response = await fetch(`${API_BASE}/agent/admin/access/${request.user_id}`, { method: "PUT", headers: headers(), body: JSON.stringify({ status, hourly_limit_minutes: request.hourly_limit_minutes }) }); if (!response.ok) return setError("Không thể cập nhật quyền."); await load(); };
  return <main className="friday-page friday-admin-page"><Link className="profile-back" href="/friday">← Friday access</Link><section className="friday-admin-head"><p>Friday administration</p><h1>Duyệt quyền<br />và quota.</h1><span>Mỗi user được duyệt sẽ có workspace/session riêng trên Friday server.</span></section>{!ready ? <p className="studio-loading">Đang kiểm tra quyền admin…</p> : error ? <section className="friday-admin-empty"><h2>Chưa thể mở Friday Admin</h2><p>{error}</p><code>FRIDAY_ADMIN_EMAILS=your-login-email@example.com</code></section> : <div className="friday-admin-list">{requests.map((request) => <article key={request.user_id}><div><p>{request.status}</p><h2>{request.email}</h2><span>Yêu cầu: {new Date(request.requested_at).toLocaleString("vi-VN")}</span></div><label>Quota/phút mỗi giờ<input type="number" min="1" max="60" value={request.hourly_limit_minutes} onChange={(event) => setRequests((items) => items.map((item) => item.user_id === request.user_id ? { ...item, hourly_limit_minutes: Number(event.target.value) } : item))} /></label><div className="friday-admin-actions"><button className="friday-action" onClick={() => decide(request, "approved")}>Duyệt</button><button onClick={() => decide(request, "revoked")}>Thu hồi</button></div></article>)}{!requests.length ? <p>Chưa có yêu cầu nào.</p> : null}</div>}</main>;
}
