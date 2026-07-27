"use client";

// 리포트 칸 — ① 정답률 추이(그래프+표, 양적) ② 사고유형 4축 AI 분석(질적)
// ③ 회차 간 성장 추적(지난 분석의 약점이 나아졌는지)을 보여준다.
// AI 분석은 버튼으로만 호출하고(토큰 절약), 결과는 students/{id}/reports 에 쌓인다.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import {
  buildDailyTrend,
  buildQuestionRecords,
  fetchAttempts,
  fetchReports,
  localDateStr,
  requestAnalysis,
  saveReport,
  THINKING_AXES,
  type DailyTrend,
  type PreviousSummary,
  type QuestionRecord,
  type ThinkingAxis,
  type ThinkingReport,
} from "@/lib/learn/report";

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--border-radius-lg)",
  padding: 20,
  marginBottom: 16,
};

export default function ReportPage() {
  const { student, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !student) router.replace("/login");
  }, [loading, student, router]);

  const phone = student?.phone ?? "";

  const [records, setRecords] = useState<QuestionRecord[] | null>(null);
  const [trend, setTrend] = useState<DailyTrend[]>([]);
  const [reports, setReports] = useState<ThinkingReport[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) return;
    let active = true;
    (async () => {
      const [attempts, reps] = await Promise.all([fetchAttempts(phone), fetchReports(phone)]);
      if (!active) return;
      setRecords(buildQuestionRecords(attempts));
      setTrend(buildDailyTrend(attempts));
      setReports(reps);
    })();
    return () => {
      active = false;
    };
  }, [phone]);

  const latest = reports.length ? reports[reports.length - 1] : null;
  const prevReport = reports.length > 1 ? reports[reports.length - 2] : null;
  const hasNewRecords = !latest || (records?.length ?? 0) > latest.attempt_count;

  const analyze = useCallback(async () => {
    if (!records?.length || analyzing) return;
    setAnalyzing(true);
    setError(null);
    const previous: PreviousSummary | null = latest
      ? {
          created_at: latest.created_at,
          axes: Object.fromEntries(
            THINKING_AXES.map((ax) => [ax, latest.axes[ax]?.score ?? 0])
          ) as Record<ThinkingAxis, number>,
          weaknesses: latest.weaknesses,
        }
      : null;
    const rep = await requestAnalysis({ records, trend, previous });
    if (!rep) {
      setError("분석에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } else {
      await saveReport(phone, rep);
      setReports((rs) => [...rs, rep]);
    }
    setAnalyzing(false);
  }, [records, trend, latest, analyzing, phone]);

  if (loading || !student || records === null) {
    return (
      <Shell>
        <p style={{ color: "var(--color-text-secondary)" }}>기록을 불러오는 중…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, margin: "4px 0 2px" }}>내 학습 리포트</h1>
        <Link href="/" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          ← 홈으로
        </Link>
      </div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
        지금까지 푼 문제 {records.length}건이 쌓여 있어요.
      </p>

      {records.length === 0 ? (
        <div style={card}>
          <p style={{ marginBottom: 12 }}>아직 기록이 없어요. 한 바퀴 돌고 오면 여기가 채워져요!</p>
          <Link
            href="/learn/sci_03"
            style={{
              display: "inline-block",
              background: "var(--color-accent-strong)",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 14px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            관성 학습하러 가기
          </Link>
        </div>
      ) : (
        <>
          <TrendCard trend={trend} />
          <AnalysisCard
            latest={latest}
            analyzing={analyzing}
            error={error}
            hasNewRecords={hasNewRecords}
            onAnalyze={analyze}
          />
          {latest && prevReport && <GrowthCard latest={latest} prev={prevReport} count={reports.length} />}
          <RecordsCard records={records} />
        </>
      )}
    </Shell>
  );
}

// ────────────────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 48px" }}>{children}</main>
  );
}

function dayLabel(date: string): string {
  const today = localDateStr(Date.now());
  const yesterday = localDateStr(Date.now() - 24 * 60 * 60 * 1000);
  if (date === today) return "오늘";
  if (date === yesterday) return "어제";
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

// ── ① 정답률 추이 ────────────────────────────────────────────────
function trendMessage(trend: DailyTrend[]): string | null {
  if (!trend.length) return null;
  if (trend.length === 1) {
    const t = trend[0];
    return `${dayLabel(t.date)} ${t.total}문제 중 ${t.correct}문제 정답! 기록이 더 쌓이면 추이가 보여요.`;
  }
  const prev = trend[trend.length - 2];
  const last = trend[trend.length - 1];
  const diff = last.correct - prev.correct;
  const base = `${dayLabel(prev.date)}엔 ${prev.correct}문제, ${dayLabel(last.date)}엔 ${last.correct}문제 정답!`;
  if (diff > 0) return `${base} 조금 더 성장했어요 🔥`;
  if (diff === 0) return `${base} 꾸준함이 최고예요 👍`;
  return `${base} 괜찮아요, 다음 판이 있으니까요 💪`;
}

function TrendCard({ trend }: { trend: DailyTrend[] }) {
  const days = trend.slice(-14);
  const recent = trend.slice(-7).reverse();
  const msg = trendMessage(trend);
  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>정답률 추이</h3>
      {msg && (
        <p
          style={{
            background: "var(--color-background-success)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 14,
          }}
        >
          {msg}
        </p>
      )}
      <TrendChart days={days} />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 12 }}>
        <thead>
          <tr style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>
            <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 500 }}>날짜</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 500 }}>푼 문제</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 500 }}>정답</th>
            <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 500 }}>정답률</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((t) => (
            <tr key={t.date} style={{ borderTop: "1px solid var(--color-border-tertiary)" }}>
              <td style={{ padding: "6px" }}>{dayLabel(t.date)}</td>
              <td style={{ padding: "6px", textAlign: "right" }}>{t.total}</td>
              <td style={{ padding: "6px", textAlign: "right" }}>{t.correct}</td>
              <td style={{ padding: "6px", textAlign: "right", fontWeight: 600 }}>{t.rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrendChart({ days }: { days: DailyTrend[] }) {
  const W = 44; // 하루당 폭
  const H = 160;
  const barMax = 110;
  const base = 130;
  const max = Math.max(...days.map((d) => d.total), 1);
  const slots = Math.max(days.length, 7); // 날이 적어도 막대가 거대해지지 않게 최소 폭 확보
  return (
    <svg
      viewBox={`0 0 ${slots * W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="일별 정답 개수 그래프"
    >
      {days.map((d, i) => {
        const totalH = (d.total / max) * barMax;
        const correctH = (d.correct / max) * barMax;
        const x = i * W + (W - 24) / 2;
        return (
          <g key={d.date}>
            {/* 푼 문제(연한 배경 막대) 위에 정답(진한 막대)을 겹쳐 그린다 */}
            <rect x={x} y={base - totalH} width={24} height={totalH} rx={4} fill="var(--color-border-tertiary)" />
            <rect x={x} y={base - correctH} width={24} height={correctH} rx={4} fill="var(--color-accent-strong)" />
            <text x={x + 12} y={base - totalH - 6} textAnchor="middle" fontSize={11} fill="var(--color-text-secondary)">
              {d.correct}/{d.total}
            </text>
            <text x={x + 12} y={146} textAnchor="middle" fontSize={10} fill="var(--color-text-tertiary)">
              {dayLabel(d.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── ② 사고유형 AI 분석 ───────────────────────────────────────────
function AnalysisCard({
  latest,
  analyzing,
  error,
  hasNewRecords,
  onAnalyze,
}: {
  latest: ThinkingReport | null;
  analyzing: boolean;
  error: string | null;
  hasNewRecords: boolean;
  onAnalyze: () => void;
}) {
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ marginTop: 0 }}>사고유형 분석 (AI)</h3>
        {latest && (
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
            {new Date(latest.created_at).toLocaleDateString("ko-KR")} 분석
          </span>
        )}
      </div>

      {!latest && (
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
          내가 푼 문제들을 AI가 읽고, <b>구체적 기억 · 지식의 범주화 · 논리적 연결 · 연상</b> 네 가지
          렌즈로 내 사고 습관을 분석해줘요.
        </p>
      )}

      {latest && (
        <>
          {THINKING_AXES.map((ax) => (
            <AxisBar key={ax} axis={ax} score={latest.axes[ax]?.score ?? 0} comment={latest.axes[ax]?.comment ?? ""} />
          ))}

          <h4 style={{ margin: "16px 0 6px" }}>내 사고 패턴</h4>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{latest.pattern}</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <div style={{ flex: "1 1 180px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-success)", marginBottom: 4 }}>
                잘하고 있는 것
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
                {latest.strengths.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-danger)", marginBottom: 4 }}>
                아직 아쉬운 것
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
                {latest.weaknesses.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              background: "var(--color-background-info)",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 12,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>앞으로 이렇게 해보기</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
              {latest.focus.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          {latest.progress && (
            <p
              style={{
                background: "var(--color-background-warning)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              📈 {latest.progress}
            </p>
          )}
        </>
      )}

      {error && (
        <p style={{ color: "var(--color-text-danger)", fontSize: 14, marginBottom: 8 }}>{error}</p>
      )}

      <button
        onClick={onAnalyze}
        disabled={analyzing || !hasNewRecords}
        style={{
          background: "var(--color-accent-strong)",
          color: "#fff",
          borderColor: "transparent",
          opacity: analyzing || !hasNewRecords ? 0.5 : 1,
        }}
      >
        {analyzing ? "AI가 읽고 있어요…" : latest ? "새 기록으로 다시 분석" : "AI 분석 시작"}
      </button>
      {latest && !hasNewRecords && !analyzing && (
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 6 }}>
          새 문제를 풀면 다시 분석할 수 있어요.
        </p>
      )}
    </div>
  );
}

function AxisBar({ axis, score, comment }: { axis: string; score: number; comment: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
        <b>{axis}</b>
        <span style={{ fontWeight: 700, color: "var(--color-accent-strong)" }}>{score}점</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--color-border-tertiary)" }}>
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            borderRadius: 4,
            background: "var(--color-accent-strong)",
          }}
        />
      </div>
      {comment && (
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, marginTop: 4 }}>
          {comment}
        </p>
      )}
    </div>
  );
}

// ── ③ 성장 추적 (지난 분석 대비) ─────────────────────────────────
function GrowthCard({
  latest,
  prev,
  count,
}: {
  latest: ThinkingReport;
  prev: ThinkingReport;
  count: number;
}) {
  const deltas = THINKING_AXES.map((ax) => ({
    axis: ax,
    prev: prev.axes[ax]?.score ?? 0,
    now: latest.axes[ax]?.score ?? 0,
  }));
  // 지난 분석에서 가장 낮았던 축 = 그때의 약점
  const weakest = deltas.reduce((a, b) => (b.prev < a.prev ? b : a));
  const improved = weakest.now > weakest.prev;

  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>
        성장 추적 <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>· {count}번째 분석</span>
      </h3>
      {deltas.map(({ axis, prev: p, now }) => {
        const diff = now - p;
        const color =
          diff > 0
            ? "var(--color-text-success)"
            : diff < 0
            ? "var(--color-text-danger)"
            : "var(--color-text-tertiary)";
        return (
          <p key={axis} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
            <span>{axis}</span>
            <span>
              {p}점 → <b>{now}점</b>{" "}
              <span style={{ color, fontWeight: 700 }}>
                {diff > 0 ? `▲${diff}` : diff < 0 ? `▼${-diff}` : "—"}
              </span>
            </span>
          </p>
        );
      })}
      <p
        style={{
          background: improved ? "var(--color-background-success)" : "var(--color-background-secondary)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 14,
          lineHeight: 1.6,
          marginTop: 10,
        }}
      >
        {improved
          ? `지난번 약점이었던 '${weakest.axis}'이(가) ${weakest.now - weakest.prev}점 올랐어요. 약점이 강점 되는 중 ✨`
          : `지난번 약점 '${weakest.axis}'은(는) 아직 그대로예요. 이번 학습 중점을 따라가 보면 다음 분석에서 달라질 거예요.`}
      </p>
    </div>
  );
}

// ── ④ 문제별 기록 ────────────────────────────────────────────────
function RecordsCard({ records }: { records: QuestionRecord[] }) {
  const recent = useMemo(() => records.slice(-20).reverse(), [records]);
  return (
    <div style={card}>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>
          문제별 기록 보기 (최근 {recent.length}건)
        </summary>
        {recent.map((r, i) => (
          <div
            key={i}
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--color-border-tertiary)",
              padding: "10px 0",
              marginTop: i === 0 ? 10 : 0,
              fontSize: 14,
            }}
          >
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 4 }}>
              {dayLabel(r.date)} · {r.concept} · {r.kind}
            </p>
            <p style={{ marginBottom: 4, lineHeight: 1.5 }}>{r.prompt}</p>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {r.correct ? "✅" : "❌"} “{r.answer}”
              {r.tags.length > 0 && (
                <span style={{ fontSize: 13 }}> · 태그 {r.tags.join(", ")}</span>
              )}
            </p>
          </div>
        ))}
      </details>
    </div>
  );
}
