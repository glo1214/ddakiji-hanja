"use client";

// 개념 학습(5단계) 교차분석 — students/{phone}/attempts 를 읽어
// 2×2 매트릭스·오류 태그 빈도·태그 일치(확정)·처방을 한 화면에 보여준다.
// 기존 StudentReport(레거시 게임용)와 분리된 선생님용 진단 뷰.

import { useEffect, useMemo, useState } from "react";
import {
  buildDiagnostics,
  CELL_MEANING,
  fetchAttempts,
  type LearnDiagnostics,
} from "@/lib/learn/diagnostics";
import { getBehavior, inferEntryFromBehavior } from "@/lib/learn/profile";
import { getStudent } from "@/lib/storage";
import type { EntryType } from "@/lib/learn/types";
import type { Student } from "../types";

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  padding: "1.1rem 1.25rem",
};

const cellColor: Record<string, string> = {
  A: "var(--color-background-success)",
  B: "var(--color-background-warning)",
  C: "var(--color-background-info)",
  D: "var(--color-background-danger)",
};

export default function LearnAnalysis({ student, onBack }: { student: Student; onBack: () => void }) {
  const [diag, setDiag] = useState<LearnDiagnostics | null>(null);
  const [initialEntry, setInitialEntry] = useState<EntryType | null>(null);
  const [behaviorEntry, setBehaviorEntry] = useState<EntryType | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [attempts, fresh, behavior] = await Promise.all([
          fetchAttempts(student.phone),
          getStudent(student.phone),
          getBehavior(student.phone),
        ]);
        if (!active) return;
        setDiag(buildDiagnostics(attempts));
        setInitialEntry(fresh?.entry_type ?? null);
        setBehaviorEntry(inferEntryFromBehavior(behavior));
      } catch (e) {
        console.error(e);
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [student.phone]);

  const tagRows = useMemo(
    () => (diag ? Object.entries(diag.tagFreq).sort((a, b) => b[1]! - a[1]!) : []),
    [diag]
  );

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem 1.25rem 3rem", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ marginRight: 4 }}></i> 목록
        </button>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>개념 학습 분석</span>
      </div>

      <div>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>{student.name} · 교차분석</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          객관식(따라해보기) × 주관식(설명하기)을 같은 오류 태그(①~⑥)로 묶어 봅니다.
        </p>
      </div>

      {error && <div style={{ ...card, color: "var(--color-text-danger)" }}>분석 데이터를 불러오지 못했어요.</div>}

      {!diag && !error && (
        <div style={{ ...card, color: "var(--color-text-secondary)" }}>분석을 준비하는 중…</div>
      )}

      {diag && diag.attemptsCount === 0 && (
        <div style={{ ...card, color: "var(--color-text-secondary)", fontSize: 14 }}>
          아직 학습 기록(attempts)이 없어요. 학생이 <b>/learn/&lt;개념id&gt;</b> 흐름을 돌면 이곳이 채워집니다.
        </div>
      )}

      {/* 학습 유형 (4유형 진입점 + 뇌유형 렌즈) — 기록이 없어도 초기 진단은 보여준다 */}
      {diag && (initialEntry || behaviorEntry || diag.lens) && (
        <section style={card}>
          <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>학습 유형</h2>
          <p style={{ fontSize: 14, margin: "0 0 6px" }}>
            진입점 — 초기 진단: <b>{initialEntry ?? "미진단"}</b>
            {" · "}행동 기반: <b>{behaviorEntry ?? "데이터 부족"}</b>
          </p>
          {initialEntry && behaviorEntry && initialEntry !== behaviorEntry && (
            <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: "0 0 6px" }}>
              ⮕ 행동이 초기 진단과 달라요 — 진입점을 <b>{behaviorEntry}</b>으로 갱신 권장(“행동이 이긴다”).
            </p>
          )}
          {diag.lens && (
            <p style={{ fontSize: 14, margin: "6px 0 0" }}>
              뇌유형(렌즈, 비공개): <b>{diag.lens.lens}</b>{" "}
              <span style={{ color: "var(--color-text-secondary)" }}>
                — {diag.lens.tone} (근거 {diag.lens.signalTag})
              </span>
            </p>
          )}
        </section>
      )}

      {diag && diag.attemptsCount > 0 && (
        <>
          {/* 처방 우선순위 */}
          <section style={{ ...card, background: "var(--color-background-info)" }}>
            <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>처방 우선순위</h2>
            {diag.prescription.length === 0 ? (
              <p style={{ margin: 0 }}>오류 태그가 없어요. 잘 따라오고 있습니다 👍</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {diag.prescription.map((p) => (
                  <li key={p.tag} style={{ lineHeight: 1.5 }}>
                    <b>{p.tag}</b>
                    {p.confirmed && (
                      <span style={{ color: "var(--color-text-danger)", fontWeight: 700, fontSize: 12 }}> 확정</span>
                    )}{" "}
                    — {p.text}
                  </li>
                ))}
              </ol>
            )}
            {diag.confirmedTags.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "10px 0 0" }}>
                ‘확정’ = 객관식과 주관식이 같은 태그를 가리킴(노이즈 아닌 진짜 패턴).
              </p>
            )}
          </section>

          {/* 오류 태그 빈도 */}
          <section style={card}>
            <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>오류 태그 빈도</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tagRows.map(([tag, n]) => {
                const max = Math.max(...tagRows.map(([, v]) => v!));
                return (
                  <div key={tag}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                      <span>{tag}</span>
                      <span style={{ color: "var(--color-text-secondary)" }}>{n}회</span>
                    </div>
                    <div style={{ height: 7, background: "var(--color-background-secondary)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${Math.round((n! / max) * 100)}%`, height: "100%", background: "var(--color-accent)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 개념별 2×2 */}
          <section style={card}>
            <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>개념별 2×2 매트릭스</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {diag.byConcept.map((c) => (
                <div key={c.conceptId} style={{ borderTop: "1px solid var(--color-border-tertiary)", paddingTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <b>{c.conceptName}</b>
                    {c.cell ? (
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: cellColor[c.cell] }}>
                        {c.cell}칸 · {CELL_MEANING[c.cell].title}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>두 축 중 하나만 기록됨</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>
                    객관식 {c.objCorrect}맞음 / {c.objWrong}틀림 · 설명하기{" "}
                    {c.subjExplained === null ? "기록 없음" : c.subjExplained ? "설명됨" : "안 됨"}
                  </p>
                  {(c.objTags.length > 0 || c.subjTags.length > 0) && (
                    <p style={{ fontSize: 13, margin: "0 0 2px" }}>
                      객관식 태그 [{c.objTags.join(", ") || "—"}] · 주관식 태그 [{c.subjTags.join(", ") || "—"}]
                    </p>
                  )}
                  {c.confirmedTags.length > 0 && (
                    <p style={{ fontSize: 13, margin: 0, color: "var(--color-text-danger)" }}>
                      공통(확정): <b>{c.confirmedTags.join(", ")}</b>
                    </p>
                  )}
                  {c.cell && (
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "4px 0 0" }}>
                      → {CELL_MEANING[c.cell].rx}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
