"use client";

// 유형 진단 — 초기 6문항(콜드 스타트). 가장 많이 고른 유형이 학습 진입점이 된다.
// 결과는 현재 학생에 반영(localStorage)하고, 등록 학생이면 Firestore에도 저장한다.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { saveEntryType } from "@/lib/storage";
import {
  DIAGNOSE_QUESTIONS,
  scoreEntryType,
} from "@/lib/learn/profile";
import { ENTRY_START_STAGE, type EntryType } from "@/lib/learn/types";

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--border-radius-lg)",
  padding: 20,
  marginBottom: 16,
};

const ENTRY_BLURB: Record<EntryType, string> = {
  느낌먼저: "‘이게 나랑 무슨 상관?’부터 — 상황·예시로 출발하는 게 잘 맞아요.",
  개념정리: "‘정확한 뜻과 기준’부터 — 정의·한자 뜻으로 출발하는 게 잘 맞아요.",
  따라해보기: "‘일단 해보자’부터 — 예시 문제로 출발하는 게 잘 맞아요.",
  크게보기: "‘전체 그림’부터 — 흐름·연결로 출발하는 게 잘 맞아요.",
};

export default function DiagnosePage() {
  const { student, loading, updateStudent } = useAuth();
  const router = useRouter();

  // 진단 결과를 학생 계정에 저장해야 하므로 로그인 필수
  useEffect(() => {
    if (!loading && !student) router.replace("/login");
  }, [loading, student, router]);

  const [answers, setAnswers] = useState<(EntryType | null)[]>(
    Array(DIAGNOSE_QUESTIONS.length).fill(null)
  );
  const [result, setResult] = useState<EntryType | null>(null);
  const [saving, setSaving] = useState(false);

  const answeredCount = answers.filter(Boolean).length;
  const allAnswered = answeredCount === DIAGNOSE_QUESTIONS.length;

  function choose(qi: number, type: EntryType) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = type;
      return next;
    });
  }

  async function finish() {
    if (!allAnswered || saving) return;
    setSaving(true);
    const entry = scoreEntryType(answers.filter(Boolean) as EntryType[]);
    setResult(entry);
    updateStudent({ entry_type: entry });
    if (student) {
      try {
        await saveEntryType(student.phone, entry);
      } catch (e) {
        console.error("[diagnose] entry_type 저장 실패:", e);
      }
    }
    setSaving(false);
  }

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

  if (result) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 48px" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>너의 출발점은 “{result}” 🎯</h1>
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
          {ENTRY_BLURB[result]}
        </p>
        <div style={{ ...card, background: "var(--color-background-info)" }}>
          <p style={{ lineHeight: 1.6 }}>
            앞으로 개념을 배울 때 <b>{ENTRY_START_STAGE[result]}</b> 단계부터 시작해요.
            물론 다른 단계도 다 열려 있고, 쓰다 보면 너에게 더 맞는 출발점으로 저절로 바뀌어요.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setResult(null); setAnswers(Array(DIAGNOSE_QUESTIONS.length).fill(null)); }}>
            다시 하기
          </button>
          <button
            onClick={() => router.push("/learn/sci_03")}
            style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent" }}
          >
            관성으로 시작하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 48px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>나는 어떤 학습 유형일까?</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 8 }}>
        새 개념을 만나면 나는? 끌리는 걸 하나씩 골라줘 (30초).
      </p>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {DIAGNOSE_QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: answers[i] ? "var(--color-accent-strong)" : "var(--color-border-tertiary)",
            }}
          />
        ))}
      </div>

      {DIAGNOSE_QUESTIONS.map((question, qi) => (
        <div key={qi} style={card}>
          <p style={{ fontWeight: 600, marginBottom: 12 }}>
            {qi + 1}. {question.q}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {question.options.map((opt) => {
              const selected = answers[qi] === opt.type;
              return (
                <button
                  key={opt.label}
                  onClick={() => choose(qi, opt.type)}
                  style={{
                    textAlign: "left",
                    lineHeight: 1.5,
                    background: selected ? "var(--color-background-success)" : "var(--color-background-primary)",
                    borderColor: selected ? "var(--color-accent-strong)" : "var(--color-border-secondary)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ position: "sticky", bottom: 12, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={finish}
          disabled={!allAnswered || saving}
          style={{
            background: "var(--color-accent-strong)",
            color: "#fff",
            borderColor: "transparent",
            opacity: allAnswered ? 1 : 0.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {saving ? "정하는 중…" : allAnswered ? "결과 보기" : `${answeredCount}/${DIAGNOSE_QUESTIONS.length} 선택됨`}
        </button>
      </div>
    </main>
  );
}
