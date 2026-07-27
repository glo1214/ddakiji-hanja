"use client";

/**
 * 학생 학습 분석 보고서 (학부모 전달용).
 * /teacher에서 학생을 누르면 표시된다. Firestore 진도·오답태그를 읽어
 * 강점·살펴볼 점·생각 습관을 자동 정리하고, 선생님이 코멘트를 더해 인쇄한다.
 */

import { useEffect, useMemo, useState } from "react";
import { loadProgress, loadWrongTags, getStudent, saveReportComment } from "@/lib/storage";
import { CONCEPTS, TAG_LABELS } from "../HanjaGame";
import type { Progress, WrongTagCounts, Student } from "../types";

const cardStyle: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  padding: "1.1rem 1.25rem",
};

function todayKo() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface Analysis {
  doneCount: number;
  coreTotal: number;
  bonusDone: number;
  bySubject: { subject: string; done: number; total: number }[];
  strengths: string[]; // 잘 이해한 개념어
  upcoming: string[]; // 앞으로 함께 볼 개념어
  patterns: { title: string; desc: string }[];
  draft: string;
}

function analyze(name: string, progress: Progress, tags: WrongTagCounts): Analysis {
  const ids = Object.keys(CONCEPTS);
  const coreIds = ids.filter((id) => !CONCEPTS[id].isBonus);
  const bonusIds = ids.filter((id) => CONCEPTS[id].isBonus);

  const isDone = (id: string) => progress[id]?.done;
  const doneCore = coreIds.filter(isDone);
  const bonusDone = bonusIds.filter(isDone).length;

  // 영역(subject)별 진도
  const subjMap = new Map<string, { done: number; total: number }>();
  for (const id of coreIds) {
    const s = CONCEPTS[id].subject;
    const cur = subjMap.get(s) ?? { done: 0, total: 0 };
    cur.total += 1;
    if (isDone(id)) cur.done += 1;
    subjMap.set(s, cur);
  }
  const bySubject = [...subjMap.entries()]
    .map(([subject, v]) => ({ subject, ...v }))
    .sort((a, b) => b.done / b.total - a.done / a.total || b.total - a.total);

  // 강점: 완료 개념 중 점수 높은 순 상위 3
  const strengths = doneCore
    .slice()
    .sort((a, b) => (progress[b].score ?? 0) - (progress[a].score ?? 0))
    .slice(0, 3)
    .map((id) => CONCEPTS[id].term);

  // 앞으로 함께 볼 개념: 선수개념을 모두 끝낸(=바로 도전 가능한) 미완료 개념 우선
  const notDone = coreIds.filter((id) => !isDone(id));
  const ready = notDone.filter((id) => CONCEPTS[id].prerequisites.every((p) => isDone(p)));
  const upcoming = (ready.length ? ready : notDone).slice(0, 3).map((id) => CONCEPTS[id].term);

  // 자주 보이는 생각 습관: 오답태그 상위 2
  const patterns = Object.entries(tags)
    .filter(([tag]) => TAG_LABELS[tag])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([tag]) => TAG_LABELS[tag]);

  // 코멘트 초안 (선생님이 편집)
  const parts: string[] = [];
  parts.push(`${name} 학생은 지금까지 ${doneCore.length}개의 개념을 익혔습니다${bonusDone ? ` (보너스 ${bonusDone}개 포함)` : ""}.`);
  if (strengths.length) parts.push(`특히 ${strengths.join(", ")} 같은 개념을 잘 이해했습니다.`);
  if (patterns.length) parts.push(`요즘은 '${patterns[0].title}' 부분을 함께 연습하고 있습니다.`);
  if (upcoming.length) parts.push(`앞으로는 ${upcoming.join(", ")} 개념을 차근차근 다져갈 예정입니다.`);
  parts.push(`꾸준히 잘 따라오고 있으니 가정에서도 따뜻하게 격려해 주세요.`);

  return {
    doneCount: doneCore.length,
    coreTotal: coreIds.length,
    bonusDone,
    bySubject,
    strengths,
    upcoming,
    patterns,
    draft: parts.join(" "),
  };
}

export default function StudentReport({
  student,
  onBack,
}: {
  student: Student;
  onBack: () => void;
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [tags, setTags] = useState<WrongTagCounts>({});
  const [comment, setComment] = useState("");
  const [savedComment, setSavedComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [p, t, fresh] = await Promise.all([
          loadProgress(student.phone),
          loadWrongTags(student.phone),
          getStudent(student.phone),
        ]);
        if (!active) return;
        setProgress(p);
        setTags(t);
        setSavedComment(fresh?.reportComment ?? "");
      } catch {
        if (active) setLoadError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [student.phone]);

  const analysis = useMemo(
    () => (progress ? analyze(student.name, progress, tags) : null),
    [progress, tags, student.name],
  );

  // 데이터 로드 후 코멘트 초기값: 저장된 코멘트 우선, 없으면 자동 초안
  useEffect(() => {
    if (analysis) setComment(savedComment || analysis.draft);
  }, [analysis, savedComment]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveReportComment(student.phone, comment);
      setSavedComment(comment);
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem" }}>
        <button className="no-print" onClick={onBack} style={{ marginBottom: 12 }}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ marginRight: 4 }}></i> 목록
        </button>
        <p style={{ color: "var(--color-text-danger)" }}>학습 데이터를 불러오지 못했어요.</p>
      </main>
    );
  }

  if (!analysis) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
        보고서를 준비하는 중…
      </main>
    );
  }

  const started = analysis.doneCount > 0 || Object.keys(tags).length > 0;

  return (
    <main className="report-root" style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem 1.25rem 3rem", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 상단 도구 (인쇄 시 숨김) */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ marginRight: 4 }}></i> 목록
        </button>
        <button onClick={() => window.print()} style={{ background: "var(--color-accent)", borderColor: "var(--color-accent-strong)", fontWeight: 600 }}>
          <i className="ti ti-printer" aria-hidden="true" style={{ marginRight: 4 }}></i> 인쇄 / PDF 저장
        </button>
      </div>

      {/* 헤더 */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.5px", marginBottom: 6 }}>
          딱이지<span style={{ color: "var(--color-accent)" }}>.</span> 학습 보고서
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>{student.name} 학생</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          {(student.grade?.trim() || "학년 미지정")} · {todayKo()} 기준
        </p>
      </div>

      {!started && (
        <div style={{ ...cardStyle, color: "var(--color-text-secondary)", fontSize: 14 }}>
          아직 학습 기록이 없어요. 학생이 한자앱에서 개념을 학습하면 이곳에 분석이 채워집니다.
        </div>
      )}

      {/* 학습 현황 */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 17, margin: "0 0 12px" }}>학습 현황</h2>
        <p style={{ fontSize: 15, margin: "0 0 14px" }}>
          지금까지 <b>{analysis.doneCount}개</b> 개념을 익혔어요
          <span style={{ color: "var(--color-text-tertiary)" }}> / 전체 {analysis.coreTotal}개</span>
          {analysis.bonusDone > 0 && (
            <span style={{ color: "var(--color-text-success)" }}> · 보너스 {analysis.bonusDone}개 ✨</span>
          )}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {analysis.bySubject.map((s) => (
            <div key={s.subject}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                <span>{s.subject}</span>
                <span style={{ color: "var(--color-text-secondary)" }}>{s.done}/{s.total}</span>
              </div>
              <div style={{ height: 7, background: "var(--color-background-secondary)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((s.done / s.total) * 100)}%`, height: "100%", background: "var(--color-accent)" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 강점 */}
      {analysis.strengths.length > 0 && (
        <section style={{ ...cardStyle, background: "var(--color-background-success)" }}>
          <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>잘하고 있어요 👍</h2>
          <p style={{ fontSize: 15, margin: 0, lineHeight: 1.6 }}>
            특히 <b>{analysis.strengths.join(", ")}</b> 개념을 잘 이해했어요. 한자의 뜻으로 개념을 풀어내는 힘이 자라고 있습니다.
          </p>
        </section>
      )}

      {/* 자주 보이는 생각 습관 */}
      {analysis.patterns.length > 0 && (
        <section style={cardStyle}>
          <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>요즘 함께 연습하는 부분</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analysis.patterns.map((p) => (
              <div key={p.title}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{p.title}</p>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.55 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 앞으로 함께 볼 개념 */}
      {analysis.upcoming.length > 0 && (
        <section style={cardStyle}>
          <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>앞으로 함께 볼 개념</h2>
          <p style={{ fontSize: 15, margin: 0, lineHeight: 1.6 }}>
            다음에는 <b>{analysis.upcoming.join(", ")}</b> 개념을 차근차근 다져볼 거예요.
          </p>
        </section>
      )}

      {/* 선생님 한마디 */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>선생님 한마디</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="report-comment"
          style={{ width: "100%", resize: "vertical", lineHeight: 1.6, fontSize: 14 }}
        />
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <button onClick={handleSave} disabled={saving || comment === savedComment}>
            {saving ? "저장 중…" : comment === savedComment ? "저장됨" : "코멘트 저장"}
          </button>
          {analysis.draft && comment !== analysis.draft && (
            <button onClick={() => setComment(analysis.draft)} style={{ fontSize: 13 }}>
              자동 초안 다시 넣기
            </button>
          )}
        </div>
      </section>

      <p className="no-print" style={{ fontSize: 12, color: "var(--color-text-tertiary)", textAlign: "center", margin: 0 }}>
        ‘인쇄 / PDF 저장’을 누르면 도구 버튼은 빠지고 보고서만 깔끔하게 출력돼요.
      </p>
    </main>
  );
}
