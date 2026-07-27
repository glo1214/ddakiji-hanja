"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const ok = await login(phone);
      if (ok) {
        router.replace("/");
      } else {
        setError("등록되지 않은 전화번호예요. 선생님께 확인해 주세요.");
      }
    } catch {
      setError("로그인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDemoStart() {
    demoLogin();
    router.replace("/learn/sci22_30");
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "0 auto",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
        padding: "1.5rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/gloon-logo-cropped.png"
          alt="글로온"
          style={{ width: 320, maxWidth: "100%", height: "auto", margin: "0 auto 12px", mixBlendMode: "multiply" }}
        />
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
          개념어가 켜지는 순간을 시작해요
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호 (예: 01012345678)"
          style={{ width: "100%", fontSize: 16, textAlign: "center" }}
        />
        {error && (
          <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: 0, textAlign: "center" }}>
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting || !phone.trim()} style={{ width: "100%" }}>
          {submitting ? "확인 중…" : "로그인"}
          {!submitting && <i className="ti ti-arrow-right" aria-hidden="true" style={{ marginLeft: 4 }}></i>}
        </button>
      </form>

      <button
        type="button"
        onClick={handleDemoStart}
        style={{
          width: "100%",
          background: "var(--color-accent-strong)",
          color: "#fff",
          borderColor: "transparent",
          fontWeight: 800,
        }}
      >
        학생 체험 바로 시작
      </button>

      <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", textAlign: "center", margin: 0 }}>
        선생님이신가요?{" "}
        <a href="/teacher" style={{ color: "var(--color-text-secondary)" }}>
          관리자 로그인
        </a>
      </p>
    </main>
  );
}
