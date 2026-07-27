"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import type { Concept } from "@/lib/learn/types";
import {
  buildSetCompare,
  buildStrategyBlock,
  buildWordFormation,
} from "@/lib/learn/content/seedOverview";

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--border-radius-lg)",
  padding: 20,
  marginBottom: 16,
};

export default function SeedConceptPreview({ concept }: { concept: Concept }) {
  const { student, loading } = useAuth();
  const router = useRouter();
  const strategy = buildStrategyBlock(concept);
  const wordFormation = buildWordFormation(concept);
  const setCompare = buildSetCompare(concept);

  useEffect(() => {
    if (!loading && !student) router.replace("/login");
  }, [loading, student, router]);

  if (loading || !student) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 16px", color: "var(--color-text-secondary)" }}>
        불러오는 중…
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 48px" }}>
      <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 6 }}>
        개념 카드
      </p>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>{concept.name}</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
        {concept.subject}
        {concept.unit && <> · {concept.unit}</>}
        {concept.setName && <> · {concept.setName}</>}
      </p>

      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, margin: 0 }}>이해 2축</h2>
          {strategy.route && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 999,
                background: "var(--color-background-info)",
                whiteSpace: "nowrap",
              }}
            >
              {strategy.route}
            </span>
          )}
        </div>
        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: 0 }}>
          <div>
            <dt style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 3 }}>구조 파악</dt>
            <dd style={{ margin: 0, fontWeight: 800 }}>{strategy.structure}</dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 3 }}>기존 연결</dt>
            <dd style={{ margin: 0, fontWeight: 800 }}>{strategy.connection}</dd>
          </div>
        </dl>
      </section>

      {wordFormation && (
        <section style={card}>
          <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>조어 구조</h2>
          {wordFormation.formula && (
            <p style={{ fontSize: 18, fontWeight: 900, marginBottom: 10, letterSpacing: 0 }}>
              {wordFormation.formula}
            </p>
          )}
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 10 }}>
            = 뜻 합치기 · ⌒ 붙여 읽기 · ㅣ 끊어 읽기 · → 개념 문장
          </p>
          {wordFormation.parts.map((part) => (
            <p key={part.text} style={{ marginBottom: 6, lineHeight: 1.5 }}>
              <b style={{ fontSize: 18 }}>{part.text}</b>
              <span style={{ marginLeft: 10 }}>{part.meaning}</span>
            </p>
          ))}
          {wordFormation.readingCue && (
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {wordFormation.readingCue}
            </p>
          )}
        </section>
      )}

      {setCompare && (
        <section style={card}>
          <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>같은 묶음 · {setCompare.setName}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {setCompare.items.map((item) => {
                const focused = item.conceptId === setCompare.focusId;
                return (
                  <tr
                    key={item.conceptId ?? item.name}
                    style={{
                      borderTop: "1px solid var(--color-border-tertiary)",
                      background: focused ? "var(--color-background-info)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px 6px", fontWeight: 800, whiteSpace: "nowrap" }}>
                      {item.conceptId ? (
                        <Link href={`/learn/${item.conceptId}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td style={{ padding: "8px 6px", color: "var(--color-text-secondary)" }}>
                      {item.keyPoint ?? ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {setCompare.summary && (
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>
              {setCompare.summary}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
