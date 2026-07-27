"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers";
import HanjaGame from "./HanjaGame";

const DEMO_CONCEPTS = [
  { id: "sci22_30", name: "비열", note: "물은 왜 천천히 데워질까?" },
  { id: "sci22_36", name: "응고", note: "액체가 굳어지는 변화" },
  { id: "sci22_27", name: "열의 이동", note: "전도·대류·복사 비교" },
  { id: "sci22_50", name: "질량↔무게", note: "달에 가면 무엇이 바뀔까?" },
  { id: "sci22_55", name: "태양계", note: "태양 중심의 천체 묶음" },
];

function GloOnLogo({ compact = false }: { compact?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/gloon-logo-cropped.png"
      alt="글로온"
      style={{
        width: compact ? 184 : 280,
        height: "auto",
        display: "block",
        mixBlendMode: "multiply",
      }}
    />
  );
}

export default function Home() {
  const { student, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !student) router.replace("/login");
  }, [loading, student, router]);

  if (loading || !student) {
    return (
      <main
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        불러오는 중…
      </main>
    );
  }

  return (
    <main style={{ padding: "0 1rem 2rem" }}>
      <header
        style={{
          maxWidth: 480,
          margin: "0 auto",
          display: "grid",
          gap: 12,
          padding: "14px 0 12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <GloOnLogo compact />
          <button onClick={logout} style={{ fontSize: 12, padding: "7px 10px" }}>
            로그아웃
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--color-text-secondary)",
          }}
        >
          <span>
            <i className="ti ti-user" aria-hidden="true" style={{ marginRight: 4 }}></i>
            {student.name}
            {student.isDemo && (
              <span
                style={{
                  marginLeft: 6,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                체험 모드
              </span>
            )}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/report"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "var(--color-text-success)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <i className="ti ti-chart-bar" aria-hidden="true"></i>
              리포트
            </Link>
            <Link
              href="/essay-feedback"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "var(--color-text-info)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <i className="ti ti-writing" aria-hidden="true"></i>
              서술형
            </Link>
          </span>
        </div>
      </header>
      <section
        style={{
          maxWidth: 480,
          margin: "0 auto 16px",
          padding: "16px",
          border: "1px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-lg)",
          background: "var(--color-background-primary)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div style={{ display: "grid", gap: 3, marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--color-accent-strong)" }}>내일 발표 데모</span>
          <h2 style={{ fontSize: 20, margin: 0 }}>개념이 켜지는 5개 코스</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            한자 실마리, 비주얼씽킹, 따라그리기, 설명하기까지 한 번에 보여줘요.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {DEMO_CONCEPTS.map((concept) => (
            <Link
              key={concept.id}
              href={`/learn/${concept.id}`}
              style={{
                display: "block",
                minHeight: 78,
                padding: "10px 12px",
                border: "1px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-md)",
                background: "#fffdf8",
                color: "var(--color-text-primary)",
                textDecoration: "none",
              }}
            >
              <b style={{ display: "block", fontSize: 16, marginBottom: 5 }}>{concept.name}</b>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.35 }}>
                {concept.note}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section
        style={{
          maxWidth: 480,
          margin: "0 auto 16px",
          padding: "16px",
          border: "1px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-lg)",
          background: "var(--color-background-primary)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--color-accent-strong)" }}>
              보상 미리보기
            </span>
            <h2 style={{ fontSize: 19, margin: "3px 0 4px" }}>글로콩 키우기</h2>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>
              개념 ON에 성공하면 빛에너지가 모이고, 글로콩이 새싹을 틔워요.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/glo-kong.svg" alt="글로콩" style={{ width: 74, height: 74 }} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              height: 12,
              border: "1px solid var(--color-border-secondary)",
              borderRadius: 999,
              overflow: "hidden",
              background: "var(--color-background-secondary)",
            }}
          >
            <div style={{ width: "42%", height: "100%", background: "var(--color-accent-strong)" }} />
          </div>
          <p style={{ marginTop: 7, fontSize: 12, color: "var(--color-text-tertiary)" }}>
            빛에너지 12 / 30 · 다음 성장: 싹튼 글로콩
          </p>
        </div>
      </section>
      {student.isDemo ? (
        <section
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "14px 16px",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-secondary)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          내일 학생 체험은 위 5개 코스만 보여줘요. 처음 보내는 링크는{" "}
          <b style={{ color: "var(--color-text-primary)" }}>/demo</b>가 가장 안전해요.
        </section>
      ) : (
        <HanjaGame phone={student.phone} />
      )}
    </main>
  );
}
