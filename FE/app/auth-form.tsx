"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setSession } from "./session";

type AuthMode = "login" | "register";
type AuthResponse = { detail?: string; access_token?: string; user?: { id: string; email: string; display_name: string } };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function safeNextPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/posts/new";
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nextPath, setNextPath] = useState("/posts/new");

  useEffect(() => {
    setNextPath(safeNextPath(new URLSearchParams(window.location.search).get("next")));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirm_password") ?? "");

    if (mode === "register") {
      if (password.length < 8) return setError("Mật khẩu cần ít nhất 8 ký tự.");
      if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return setError("Mật khẩu cần có ít nhất một chữ cái và một chữ số.");
      if (password !== confirmPassword) return setError("Hai mật khẩu chưa trùng khớp.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json().catch(() => ({})) as AuthResponse;
      if (!response.ok || !data.access_token || !data.user) throw new Error(data.detail ?? "Không thể xác thực tài khoản.");

      setSession({ accessToken: data.access_token, user: data.user });
      router.replace(nextPath);
      router.refresh();
    } catch (caught) {
      if (caught instanceof TypeError) setError("Không kết nối được tới máy chủ. Kiểm tra backend đang chạy và URL API.");
      else setError(caught instanceof Error ? caught.message : "Không thể xác thực tài khoản.");
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";
  const alternatePath = isRegister ? "/login" : "/register";
  const alternateLabel = isRegister ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Tạo tài khoản";

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="auth-title">
        <aside className="auth-intro">
          <Link href="/" className="auth-wordmark">ERIK BRAND NEW DAY</Link>
          <div className="auth-intro-copy">
            <p className="auth-kicker">Your personal publication</p>
            <h1>{isRegister ? "Bắt đầu một nơi để viết." : "Chào mừng bạn quay lại."}</h1>
            <p>Ghi lại điều đang sống, đang xây và những ý tưởng đáng được lưu giữ.</p>
          </div>
          <p className="auth-quote">Một không gian cá nhân, có cấu trúc và mang đúng phong cách của bạn.</p>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel-head">
            <p className="auth-kicker">{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</p>
            <h2 id="auth-title">{isRegister ? "Tạo không gian của bạn" : "Tiếp tục viết"}</h2>
            <p>{isRegister ? "Đăng ký xong là có thể viết ngay." : "Đăng nhập để quản lý trang và bài viết của bạn."}</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <label><span>Email</span><input type="email" name="email" placeholder="you@example.com" autoComplete="email" required /></label>
            <label>
              <span>Mật khẩu</span>
              <div className="auth-password-field"><input type={showPassword ? "text" : "password"} name="password" placeholder="Ít nhất 8 ký tự" autoComplete={isRegister ? "new-password" : "current-password"} required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Ẩn" : "Hiện"}</button></div>
            </label>
            {isRegister ? <label><span>Xác nhận mật khẩu</span><input type={showPassword ? "text" : "password"} name="confirm_password" placeholder="Nhập lại mật khẩu" autoComplete="new-password" required /></label> : null}
            {error ? <p className="auth-message auth-message-error" role="alert">{error}</p> : null}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Đang xử lý…" : isRegister ? "Tạo tài khoản" : "Đăng nhập"}</button>
          </form>

          <div className="auth-panel-footer"><span>{isRegister ? "Đã sẵn sàng rồi?" : "Lần đầu ở đây?"}</span><Link href={`${alternatePath}?next=${encodeURIComponent(nextPath)}`}>{alternateLabel}</Link></div>
        </section>
      </section>
    </main>
  );
}
