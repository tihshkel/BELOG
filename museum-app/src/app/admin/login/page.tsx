"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MuseumLogo } from "@/components/kiosk/MuseumLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: login.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Ошибка входа");
        return;
      }

      router.push("/admin/site");
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-scene admin-scene--login">
      <div className="admin-scene__bg" aria-hidden>
        <Image src="/assets/bg-horizontal.jpg" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="admin-scene__overlay" />
      </div>

      <div className="admin-scene__inner admin-scene__inner--center">
        <form onSubmit={handleSubmit} className="admin-login__card admin-panel">
          <div className="admin-login__brand">
            <MuseumLogo size={56} className="admin-login__logo" />
            <h1 className="admin-login__title">Музей БелОГ</h1>
            <p className="admin-login__sub">Вход в панель управления</p>
          </div>

          {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

          <div className="admin-field">
            <label className="admin-label" htmlFor="login">
              Логин
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="admin-input admin-input--large"
              autoComplete="username"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input admin-input--large"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="admin-btn-primary admin-btn-primary--block admin-btn-primary--large">
            {loading ? "Вход..." : "Войти"}
          </button>

          <p className="admin-login__hint">
            Логин: <code>belog_admin</code>
            <br />
            Пароль: <code>MuzeiBelOG2026</code>
          </p>

          <Link href="/" className="admin-login__back">
            На главную
          </Link>
        </form>
      </div>
    </div>
  );
}
