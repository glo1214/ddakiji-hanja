"use client";

// 관성 수직 슬라이스 — 5단계(느낌→개념→따라해보기 객관식→크게보기→설명하기 필수).
// 앞 4단계는 건너뛸 수 있고, 설명하기만 필수 게이트(앱_단계_설계 §3).
// 매 답마다 attempts에 결과·오류태그가 기록된다.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DrawingPad from "@/app/components/DrawingPad";
import { useAuth } from "@/app/providers";
import {
  STAGES,
  type Attempt,
  type Concept,
} from "@/lib/learn/types";
import type {
  ConceptContent,
  DefinitionImageCard,
  HanjaMatchItem,
  OxCheckItem,
  SetCompare,
  StrategyBlock,
  VisualSpec,
  VisualThinkingScreen,
  WordFormation,
} from "@/lib/learn/content/sci_03";
import {
  buildSetCompare,
  buildWordFormation,
} from "@/lib/learn/content/seedOverview";
import { autoTag } from "@/lib/learn/autotag";
import { autoTagHybrid } from "@/lib/learn/autotagLLM";
import { bumpDiagnostics, markStageVisited, recordAttempt } from "@/lib/learn/attempts";
import { getBehavior, recordStageBehavior, resolveStart, type ResolvedStart } from "@/lib/learn/profile";
import { applyResult, getSrs, markKnown, nextReviewLabel } from "@/lib/learn/srs";

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--border-radius-lg)",
  padding: 20,
  marginBottom: 16,
};

export default function LearnFlow({
  concept,
  content,
}: {
  concept: Concept;
  content: ConceptContent;
}) {
  const { student, loading } = useAuth();
  const router = useRouter();

  // 흐름 기록이 학생 계정에 저장돼야 하므로 로그인 필수
  useEffect(() => {
    if (!loading && !student) router.replace("/login");
  }, [loading, student, router]);

  const phone = student?.phone ?? "";
  const persistRemote = !!phone && !student?.isDemo;

  const [start, setStart] = useState<ResolvedStart | null>(null);
  const [stageIdx, setStageIdx] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [log, setLog] = useState<Attempt[]>([]); // 화면 요약용 미러
  const [predict, setPredict] = useState<{ weather: number; light: number } | null>(null); // 학습 전 예측(메타인지)
  const [skipped, setSkipped] = useState(false); // 사전 체크 통과 → 이미 앎으로 넘김

  // 사전 체크 통과: 이미 아는 단어 → 복습 큐로만 예약하고 풀코스 스킵
  const handleSkipKnown = () => {
    if (phone) markKnown(phone, concept.id);
    setSkipped(true);
    setFinished(true);
  };

  // 진입점 결정: 행동(확신) > 초기 진단 > 느낌 기본값. ("행동이 이긴다")
  useEffect(() => {
    if (!phone || start) return;
    if (student?.isDemo) {
      const resolved = resolveStart(student.entry_type, { engage: {}, skip: {} });
      setStart(resolved);
      setStageIdx(STAGES.indexOf(resolved.stage));
      return;
    }
    let active = true;
    (async () => {
      const behavior = await getBehavior(phone);
      if (!active) return;
      const resolved = resolveStart(student?.entry_type, behavior);
      setStart(resolved);
      setStageIdx(STAGES.indexOf(resolved.stage));
    })();
    return () => {
      active = false;
    };
  }, [phone, student?.entry_type, student?.isDemo, start]);

  const stage = stageIdx !== null ? STAGES[stageIdx] : null;

  // 단계 진입 기록 (결과 화면 제외)
  useEffect(() => {
    if (persistRemote && !finished && stage) markStageVisited(phone, concept.id, stage);
  }, [persistRemote, phone, concept.id, stage, finished]);

  const pushLog = useCallback((a: Attempt) => setLog((prev) => [...prev, a]), []);

  const goNext = () => {
    setStageIdx((i) => (i !== null && i < STAGES.length - 1 ? i + 1 : i));
  };

  // 선택 단계를 떠날 때 참여/건너뛰기를 행동 데이터로 기록 후 다음 단계로.
  const leaveStage = (action: "engage" | "skip") => {
    if (persistRemote && stage && stage !== "설명하기") recordStageBehavior(phone, stage, action);
    goNext();
  };

  if (loading || stageIdx === null || !stage) {
    return <Shell><p style={{ color: "var(--color-text-secondary)" }}>불러오는 중…</p></Shell>;
  }

  if (!predict && !finished) {
    return (
      <Shell>
        <PreflightScreen
          concept={concept}
          content={content}
          onStart={(p) => setPredict(p)}
          onSkipKnown={handleSkipKnown}
        />
      </Shell>
    );
  }

  if (finished) {
    return (
      <Shell>
        <ResultSummary
          concept={concept}
          phone={phone}
          predict={predict}
          skipped={skipped}
          log={log}
          onRestart={() => {
            setLog([]);
            setStageIdx(start ? STAGES.indexOf(start.stage) : 0);
            setFinished(false);
          }}
          onHome={() => router.push("/")}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <ProgressBar current={stageIdx} />
      <h1 style={{ fontSize: 22, margin: "4px 0 2px" }}>
        {concept.name} <span style={{ color: "var(--color-text-tertiary)", fontSize: 15 }}>· {concept.subject}</span>
      </h1>
      <div style={{ height: 12 }} />

      {stage === "느낌" && (
        <FeelStageView content={content} onSkip={() => leaveStage("skip")} onEngage={() => leaveStage("engage")} />
      )}
      {stage === "개념" && (
        <ConceptStageView
          concept={concept}
          content={content}
          onSkip={() => leaveStage("skip")}
          onEngage={() => leaveStage("engage")}
        />
      )}
      {stage === "따라해보기" && (
        <QuizStageView
          concept={concept}
          content={content}
          phone={phone}
          persistRemote={persistRemote}
          pushLog={pushLog}
          onSkip={() => leaveStage("skip")}
          onFinish={() => leaveStage("engage")}
        />
      )}
      {stage === "크게보기" && (
        <BigPictureStageView
          concept={concept}
          content={content}
          onSkip={() => leaveStage("skip")}
          onEngage={() => leaveStage("engage")}
        />
      )}
      {stage === "설명하기" && (
        <ExplainStageView
          concept={concept}
          content={content}
          phone={phone}
          persistRemote={persistRemote}
          pushLog={pushLog}
          onDone={() => setFinished(true)}
        />
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

function ProgressBar({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
      {STAGES.map((s, i) => (
        <div
          key={s}
          title={s}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background:
              i < current
                ? "var(--color-accent-strong)"
                : i === current
                ? "var(--color-accent)"
                : "var(--color-border-tertiary)",
          }}
        />
      ))}
    </div>
  );
}

function SkipNext({
  onSkip,
  onEngage,
  nextLabel = "다음",
}: {
  onSkip: () => void;
  onEngage: () => void;
  nextLabel?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button onClick={onSkip} style={{ color: "var(--color-text-secondary)" }}>
        이미 알아 · 넘기기
      </button>
      <button
        onClick={onEngage}
        style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent" }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ── ① 느낌 ───────────────────────────────────────────────────────
function FeelStageView({ content, onSkip, onEngage }: { content: ConceptContent; onSkip: () => void; onEngage: () => void }) {
  const feel = content.screenContent?.feel;
  const situation = feel?.comicSituation ?? content.feel.scene.join(" ");
  const question = feel?.question ?? content.feel.hook;
  const previewImage = feel?.image ?? content.screenContent?.visualThinking?.image ?? content.visual?.image;
  return (
    <>
      <div style={card} className="pop-card">
        <ConceptPreviewImage image={previewImage} alt={question} />
        <p style={{ marginTop: 14, marginBottom: 10, lineHeight: 1.65 }}>
          {situation}
        </p>
        <p style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.45, color: "var(--color-text-success)" }}>
          {question}
        </p>
      </div>
      <SkipNext onSkip={onSkip} onEngage={onEngage} />
    </>
  );
}

function ConceptPreviewImage({ image, alt }: { image?: string; alt: string }) {
  return (
    <div
      style={{
        border: "2px solid var(--color-border-secondary)",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fffdf8",
        padding: 10,
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt} style={{ width: "100%", height: 220, objectFit: "contain", display: "block" }} />
      ) : (
        <div style={{ height: 180, display: "grid", placeItems: "center", fontWeight: 900 }}>
          그림으로 떠올리기
        </div>
      )}
    </div>
  );
}

// ── ② 개념 ───────────────────────────────────────────────────────
function ConceptStageView({
  concept,
  content,
  onSkip,
  onEngage,
}: {
  concept: Concept;
  content: ConceptContent;
  onSkip: () => void;
  onEngage: () => void;
}) {
  const [screenIdx, setScreenIdx] = useState(0);
  const c = content.concept;
  const prereq = content.prereq;
  const visual = content.visual;
  const wordFormation = content.wordFormation ?? buildWordFormation(concept);
  const definitionImage =
    content.definitionImage ??
    (visual?.image
      ? {
          image: visual.image,
          alt: visual.caption,
          dictionaryDefinition: c.definition,
          imageCaption: visual.caption,
        }
      : undefined);
  const oxItems: OxCheckItem[] =
    content.screenContent?.ox ??
    (prereq ?? []).map((p) => ({
      statement: p.expect,
      answer: true,
      feedback: p.ifStuck,
    }));
  const hanjaMatches: HanjaMatchItem[] =
    content.screenContent?.hanjaMatches ??
    c.hanja.map((h) => ({
      char: h.char,
      meaning: h.mean,
      relatedWords: h.note ? [h.note] : [],
    }));
  const definition = content.screenContent?.definition ?? {
    dictionary: c.definition,
    easy: c.coreList.join(" "),
  };
  const visualThinking: VisualThinkingScreen | undefined =
    content.screenContent?.visualThinking ??
    (visual || definitionImage
      ? {
          image: visual?.image ?? definitionImage?.image,
          description: visual?.caption ?? definitionImage?.imageCaption ?? c.definition,
          label: visual?.nodes?.join(" / ") ?? visual?.caption ?? "그림으로 한눈에 보기",
          avoid: c.warning,
        }
      : undefined);
  const screens: { key: string; eyebrow: string; title: string; body: React.ReactNode }[] = [
    ...(oxItems.length > 0
      ? [
          {
            key: "ox",
            eyebrow: "먼저 확인",
            title: "O/X로 먼저 체크해 보자",
            body: <OxCheckCard items={oxItems} />,
          },
        ]
      : []),
    ...(hanjaMatches.length > 0
      ? [
          {
            key: "hanja",
            eyebrow: "한자 짝맞추기",
            title: "한자 뜻을 짝지어 보자",
            body: <HanjaMatchCard matches={hanjaMatches} combined={c.combined} wordFormation={wordFormation} />,
          },
        ]
      : []),
    {
      key: "definition",
      eyebrow: "",
      title: "",
      body: <DefinitionScreenCard sentence={definition.easy || definition.dictionary} />,
    },
    ...(visualThinking
      ? [
          {
            key: "visual",
            eyebrow: "비주얼 싱킹",
            title: "그림으로 구조 보기",
            body: <VisualThinkingCard screen={visualThinking} visual={visual} definitionImage={definitionImage} />,
          },
        ]
      : []),
  ];
  const activeIdx = Math.min(screenIdx, screens.length - 1);
  const active = screens[activeIdx];
  const last = activeIdx === screens.length - 1;

  useEffect(() => setScreenIdx(0), [concept.id]);

  return (
    <>
      <MiniStepDots current={activeIdx} total={screens.length} />
      <div style={card} className="pop-card" key={active.key}>
        {active.eyebrow && (
          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-success)", marginBottom: 6 }}>
            {active.eyebrow}
          </p>
        )}
        {active.title && <h2 style={{ margin: "0 0 14px", fontSize: 22, lineHeight: 1.25 }}>{active.title}</h2>}
        {active.body}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <button
          onClick={() => (activeIdx === 0 ? onSkip() : setScreenIdx((i) => Math.max(0, i - 1)))}
          style={{ color: "var(--color-text-secondary)" }}
        >
          {activeIdx === 0 ? "이미 알아 · 넘기기" : "이전"}
        </button>
        <button
          onClick={() => (last ? onEngage() : setScreenIdx((i) => i + 1))}
          style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent" }}
        >
          {last ? "다음 단계로" : "다음"}
        </button>
      </div>
    </>
  );
}

function MiniStepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10 }} aria-label={`개념 화면 ${current + 1}/${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 999,
            background: i <= current ? "var(--color-accent-strong)" : "var(--color-border-tertiary)",
          }}
        />
      ))}
    </div>
  );
}

function OxCheckCard({ items }: { items: OxCheckItem[] }) {
  const [picked, setPicked] = useState<Record<number, boolean>>({});
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, idx) => {
        const value = picked[idx];
        const answered = value !== undefined;
        const aligned = answered && value === item.answer;
        return (
          <div
            key={item.statement}
            style={{
              padding: "14px 14px",
              border: "1px solid var(--color-border-tertiary)",
              borderRadius: 8,
              background: answered ? "var(--color-background-secondary)" : "transparent",
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
              {item.statement}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[true, false].map((choice) => (
                <button
                  key={choice ? "O" : "X"}
                  onClick={() => setPicked((prev) => ({ ...prev, [idx]: choice }))}
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    background: value === choice ? "var(--color-background-info)" : "var(--color-background-primary)",
                    borderColor: value === choice ? "var(--color-accent-strong)" : "var(--color-border-secondary)",
                  }}
                >
                  {choice ? "O" : "X"}
                </button>
              ))}
            </div>
            {answered && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: aligned ? "var(--color-text-success)" : "var(--color-text-warning)",
                  fontWeight: 700,
                }}
              >
                {item.feedback}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HanjaMatchCard({
  matches,
  combined,
  wordFormation,
}: {
  matches: HanjaMatchItem[];
  combined: string;
  wordFormation?: WordFormation;
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <p
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "var(--color-background-info)",
          color: "var(--color-text-info)",
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1.5,
        }}
      >
        낯선 개념은 익숙한 말에 연결하면 더 잘 잡혀.
      </p>
      {matches.map((m) => (
        <div
          key={`${m.char}-${m.meaning}`}
          style={{
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 12,
            alignItems: "center",
            padding: 12,
            borderRadius: 8,
            border: "1px solid var(--color-border-tertiary)",
            background: "var(--color-background-secondary)",
          }}
        >
          <div style={{ fontSize: m.char.length > 1 ? 30 : 48, fontWeight: 900, textAlign: "center", lineHeight: 1 }}>
            {m.char}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <p style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.35 }}>{m.meaning}</p>
              {m.relatedWords.length > 0 && (
                <span
                  style={{
                    color: "var(--color-text-success)",
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "var(--color-background-success)",
                  }}
                >
                  연결: {m.relatedWords.join(", ")}
                </span>
              )}
            </div>
            {m.note && (
              <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginTop: 2 }}>{m.note}</p>
            )}
          </div>
        </div>
      ))}
      {combined && (
        <p style={{ marginTop: 4, padding: "10px 12px", borderRadius: 8, background: "var(--color-background-info)", fontWeight: 800 }}>
          합치면 이렇게 보여 → {combined}
        </p>
      )}
    </div>
  );
}

function DefinitionScreenCard({ sentence }: { sentence: string }) {
  return (
    <p style={{ fontSize: 22, lineHeight: 1.55, fontWeight: 900, margin: 0 }}>
      {sentence}
    </p>
  );
}

function VisualThinkingCard({
  screen,
  visual,
  definitionImage,
}: {
  screen: VisualThinkingScreen;
  visual?: VisualSpec;
  definitionImage?: DefinitionImageCard;
}) {
  const [drawingOpen, setDrawingOpen] = useState(false);
  const image = screen.image ?? visual?.image ?? definitionImage?.image;
  const alt = visual?.caption ?? definitionImage?.alt ?? screen.label;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          style={{ width: "100%", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "#fffdf8" }}
        />
      )}
      {!image && visual?.nodes && (
        <p style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.5 }}>{visual.nodes.join(" → ")}</p>
      )}
      <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.45 }}>{screen.label}</p>
      <details>
        <summary style={{ cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 14 }}>그림 읽기</summary>
        <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>{screen.description}</p>
      </details>
      <button onClick={() => setDrawingOpen((open) => !open)} style={{ fontWeight: 800 }}>
        {drawingOpen ? "따라 그리기 접기" : "나도 따라 그려볼래"}
      </button>
      {drawingOpen && <DrawingPad />}
    </div>
  );
}

function CopyDrawingPanel({
  visual,
  definitionImage,
}: {
  visual?: VisualSpec;
  definitionImage?: DefinitionImageCard;
}) {
  const image = definitionImage?.image ?? visual?.image;
  const caption = definitionImage?.imageCaption ?? visual?.caption;
  const nodes = visual?.nodes ?? [];

  return (
    <div style={{ marginTop: 14, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", marginBottom: 8 }}>
        따라 그리기
      </p>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={caption ?? "개념 시각화 예시"}
          style={{ width: "100%", borderRadius: 8, marginBottom: 8 }}
        />
      )}
      {!image && nodes.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 8,
          }}
        >
          {nodes.map((node) => (
            <span
              key={node}
              style={{
                fontSize: 13,
                padding: "4px 8px",
                border: "1px solid var(--color-border-tertiary)",
                borderRadius: 999,
                background: "var(--color-background-secondary)",
              }}
            >
              {node}
            </span>
          ))}
        </div>
      )}
      {caption && (
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>
          {caption}
        </p>
      )}
      <DrawingPad />
    </div>
  );
}

function StrategyBlockView({ strategy }: { strategy: StrategyBlock }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        marginBottom: 14,
        padding: "12px 14px",
        borderRadius: 8,
        background: "var(--color-background-secondary)",
        border: "1px solid var(--color-border-tertiary)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>
          이해 2축
        </p>
        {strategy.route && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 999,
              background: "var(--color-background-primary)",
              border: "1px solid var(--color-border-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            {strategy.route}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
        <div>
          <p style={{ color: "var(--color-text-tertiary)", marginBottom: 2 }}>구조 파악</p>
          <p style={{ fontWeight: 700 }}>{strategy.structure}</p>
        </div>
        <div>
          <p style={{ color: "var(--color-text-tertiary)", marginBottom: 2 }}>기존 연결</p>
          <p style={{ fontWeight: 700 }}>{strategy.connection}</p>
        </div>
      </div>
      {strategy.misconception && (
        <p style={{ fontSize: 13, color: "var(--color-text-warning)", lineHeight: 1.5 }}>
          {strategy.misconception}
        </p>
      )}
    </div>
  );
}

function WordFormationView({ wordFormation }: { wordFormation: WordFormation }) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 8,
        background: "var(--color-background-secondary)",
      }}
    >
      {wordFormation.formula && (
        <p style={{ fontWeight: 800, marginBottom: 8, letterSpacing: 0 }}>
          {wordFormation.formula}
        </p>
      )}
      <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 8 }}>
        = 뜻 합치기 · ⌒ 붙여 읽기 · ㅣ 끊어 읽기 · → 개념 문장
      </p>
      <div style={{ display: "grid", gap: 6 }}>
        {wordFormation.parts.map((part) => (
          <div key={part.text} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8 }}>
            <b style={{ fontSize: 18 }}>{part.text}</b>
            <span style={{ fontSize: 14, lineHeight: 1.5 }}>
              {part.meaning}
              {part.relatedWords && part.relatedWords.length > 0 && (
                <span style={{ color: "var(--color-text-success)" }}>
                  {" "}
                  → {part.relatedWords.join(", ")}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefinitionImageCardView({ card }: { card: DefinitionImageCard }) {
  return (
    <div
      style={{
        marginTop: 12,
        borderTop: "1px solid var(--color-border)",
        paddingTop: 12,
      }}
    >
      {card.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image}
          alt={card.alt ?? card.dictionaryDefinition}
          style={{ width: "100%", borderRadius: 8, marginBottom: 8 }}
        />
      )}
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", marginBottom: 4 }}>
        정의·이미지 카드
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>{card.dictionaryDefinition}</p>
      {card.imageCaption && (
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          {card.imageCaption}
        </p>
      )}
      {card.example && (
        <p style={{ marginTop: 6, fontSize: 13, color: "var(--color-text-success)", lineHeight: 1.5 }}>
          예: {card.example}
        </p>
      )}
    </div>
  );
}

// ── ③ 따라해보기 (객관식) ────────────────────────────────────────
function QuizStageView({
  concept,
  content,
  phone,
  persistRemote,
  pushLog,
  onSkip,
  onFinish,
}: {
  concept: Concept;
  content: ConceptContent;
  phone: string;
  persistRemote: boolean;
  pushLog: (a: Attempt) => void;
  onSkip: () => void;
  onFinish: () => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const quiz = content.quiz;
  const item = quiz[qIdx];
  const last = qIdx === quiz.length - 1;

  async function choose(optIdx: number) {
    if (chosen !== null) return;
    setChosen(optIdx);
    const opt = item.options[optIdx];
    const attempt: Attempt = {
      student_id: phone,
      concept_id: concept.id,
      stage: "objective",
      result: opt.is_correct ? "correct" : "incorrect",
      chosen_option: optIdx,
      quiz_item_id: item.id,
      tags: opt.tag ? [opt.tag] : [],
      created_at: Date.now(),
    };
    pushLog(attempt);
    if (persistRemote) {
      await recordAttempt(phone, attempt);
      if (attempt.tags.length) await bumpDiagnostics(phone, attempt.tags);
    }
  }

  function next() {
    if (last) { onFinish(); return; }
    setQIdx((i) => i + 1);
    setChosen(null);
  }

  const opt = chosen !== null ? item.options[chosen] : null;

  return (
    <>
      <div style={card}>
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 6 }}>
          문제 {qIdx + 1} / {quiz.length} · {item.type}
        </p>
        <p style={{ fontWeight: 600, marginBottom: 14, lineHeight: 1.6 }}>{item.prompt}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {item.options.map((o, i) => {
            const isChosen = chosen === i;
            const revealed = chosen !== null;
            let bg = "var(--color-background-primary)";
            let bd = "var(--color-border-secondary)";
            if (revealed && isChosen && o.is_correct) { bg = "var(--color-background-success)"; bd = "var(--color-accent-strong)"; }
            else if (revealed && isChosen && !o.is_correct) { bg = "var(--color-background-danger)"; bd = "var(--color-text-danger)"; }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={revealed}
                style={{ textAlign: "left", background: bg, borderColor: bd, lineHeight: 1.5 }}
              >
                {o.text}
              </button>
            );
          })}
        </div>

        {opt && (
          <div style={{ marginTop: 14, fontSize: 14, padding: "10px 12px", borderRadius: 8, background: "var(--color-background-secondary)" }}>
            {opt.is_correct ? (
              <span style={{ color: "var(--color-text-success)", fontWeight: 700 }}>좋아. 다음으로 넘어가자.</span>
            ) : (
              <span>
                <b style={{ color: "var(--color-text-danger)" }}>아직 헷갈릴 수 있어.</b>
                <span style={{ color: "var(--color-text-secondary)" }}> 다음 화면에서 다시 잡아볼게.</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <button onClick={onSkip} style={{ color: "var(--color-text-secondary)" }}>건너뛰기</button>
        <button
          onClick={next}
          disabled={chosen === null}
          style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent", opacity: chosen === null ? 0.5 : 1 }}
        >
          {last ? "다음 단계" : "다음 문제"}
        </button>
      </div>
    </>
  );
}

// ── ④ 크게보기 ───────────────────────────────────────────────────
function BigPictureStageView({
  concept,
  content,
  onSkip,
  onEngage,
}: {
  concept: Concept;
  content: ConceptContent;
  onSkip: () => void;
  onEngage: () => void;
}) {
  const b = content.bigPicture;
  const setCompare = content.setCompare ?? buildSetCompare(concept);
  const rows =
    setCompare?.items.map((item) => ({
      label: item.name,
      oneLiner: item.keyPoint ?? item.role ?? item.contrast ?? "",
    })) ?? b.compare;
  const image = content.visual?.image ?? content.definitionImage?.image ?? content.screenContent?.visualThinking?.image;
  return (
    <>
      <div style={card}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${concept.name} 예시 그림`}
            style={{ width: "100%", height: 180, objectFit: "contain", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "#fffdf8", marginBottom: 14 }}
          />
        )}
        <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>순서</h3>
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          {b.flow.slice(0, 2).map((f) => (
            <p key={f.when} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--color-background-secondary)", lineHeight: 1.45, margin: 0 }}>
              <b>{f.when}</b> → {f.then}
            </p>
          ))}
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>닮은 말</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {rows.slice(0, 3).map((r) => (
            <p key={r.label} style={{ display: "grid", gridTemplateColumns: "82px 1fr", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", margin: 0 }}>
              <b>{r.label}</b>
              <span style={{ color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{r.oneLiner}</span>
            </p>
          ))}
        </div>
      </div>
      <SkipNext onSkip={onSkip} onEngage={onEngage} nextLabel="설명하기로" />
    </>
  );
}

function SetCompareView({ setCompare }: { setCompare: SetCompare }) {
  return (
    <div style={{ marginTop: 14, borderTop: "1px solid var(--color-border-tertiary)", paddingTop: 12 }}>
      <h3 style={{ fontSize: 16, margin: "0 0 8px" }}>같은 묶음 · {setCompare.setName}</h3>
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
                <td style={{ padding: "8px 6px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                  {item.role ?? item.keyPoint ?? ""}
                  {item.contrast && (
                    <span style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: 13 }}>
                      {item.contrast}
                    </span>
                  )}
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
    </div>
  );
}

// ── ⑤ 설명하기 (필수) ────────────────────────────────────────────
function splitHintQuestion(hint: string) {
  const match = hint.match(/^([^?？]+[?？])\s*(.*)$/);
  return match ? { head: match[1], detail: match[2] } : { head: "질문", detail: hint };
}

function getTempRise(obj: Attempt[], subj?: Attempt) {
  const correctCount = obj.filter((a) => a.result === "correct").length;
  const explainPoint = subj?.result === "explained" ? 3 : subj ? 1 : 0;
  const noHintPoint = subj && !subj.scaffold_used ? 1 : 0;
  return Math.max(1, correctCount * 2 + explainPoint + noHintPoint);
}

function ExplainStageView({
  concept,
  content,
  phone,
  persistRemote,
  pushLog,
  onDone,
}: {
  concept: Concept;
  content: ConceptContent;
  phone: string;
  persistRemote: boolean;
  pushLog: (a: Attempt) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [scaffoldOpen, setScaffoldOpen] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [hesitation, setHesitation] = useState(0);
  const [nudge, setNudge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ex = content.explain;
  const hintQuestions =
    content.screenContent?.explainHints ??
    ex.slots.map((s, idx) => {
      const starter = idx === 0 ? "무엇이?" : idx === 1 ? "어떻게?" : "왜?";
      return `${starter} ${s.hint}`;
    });

  // 멈칫 감지: 입력 시작 후 7초 무입력이면 비계 제안(측정 오염 막으려 '늦게' 연다).
  const onChange = (v: string) => {
    setText(v);
    setNudge(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (v.trim().length > 0) {
      idleTimer.current = setTimeout(() => {
        setNudge(true);
        setHesitation((h) => h + 1);
      }, 7000);
    }
  };
  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current); }, []);

  function openScaffold() {
    setScaffoldOpen(true);
    setHintCount((count) => (count > 0 ? count : 1));
    setNudge(false);
    setHesitation((h) => h + 1);
  }

  async function submit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const tagInput = {
      answerText: text,
      hesitationCount: hesitation,
      concept,
      coreKeywords: ex.coreKeywords,
      conceptId: concept.id,
    };
    const tagRes = persistRemote ? await autoTagHybrid(tagInput) : { ...autoTag(tagInput), source: "rule" as const };
    const attempt: Attempt = {
      student_id: phone,
      concept_id: concept.id,
      stage: "subjective",
      result: tagRes.result,
      answer_text: text,
      tags: tagRes.tags,
      scaffold_used: scaffoldOpen,
      hesitation_count: hesitation,
      created_at: Date.now(),
    };
    pushLog(attempt);
    if (persistRemote) {
      await recordAttempt(phone, attempt);
      if (tagRes.tags.length) await bumpDiagnostics(phone, tagRes.tags);
    }
    onDone();
  }

  return (
    <>
      <div style={card}>
        <p style={{ fontSize: 18, fontWeight: 900, marginBottom: 10, lineHeight: 1.45 }}>{ex.prompt}</p>
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="한 문장으로 써 봐."
          style={{ width: "100%", resize: "vertical", lineHeight: 1.6, fontSize: 16 }}
        />

        {nudge && !scaffoldOpen && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "var(--color-background-info)", fontSize: 14 }}>
            막혔어? <button onClick={openScaffold} style={{ padding: "4px 10px" }}>힌트 열기</button>
          </div>
        )}
        {!nudge && !scaffoldOpen && (
          <button onClick={openScaffold} style={{ marginTop: 10, fontSize: 13, color: "var(--color-text-secondary)" }}>
            막혔어 · 힌트 보기
          </button>
        )}

        {scaffoldOpen && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              {hintQuestions.slice(0, hintCount).map((hint) => {
                const q = splitHintQuestion(hint);
                return (
                  <div
                    key={hint}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "var(--color-background-primary)",
                      border: "1px solid var(--color-border-tertiary)",
                    }}
                  >
                    <p style={{ color: "var(--color-accent-strong)", fontWeight: 900, fontSize: 20, lineHeight: 1.2 }}>
                      {q.head}
                    </p>
                    {q.detail && (
                      <p style={{ marginTop: 4, color: "var(--color-text-secondary)", fontWeight: 700, lineHeight: 1.45 }}>
                        {q.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {hintCount < hintQuestions.length && (
              <button
                onClick={() => setHintCount((count) => Math.min(hintQuestions.length, count + 1))}
                style={{ marginTop: 10, fontSize: 13, fontWeight: 800 }}
              >
                다음 질문
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={submit}
          disabled={!text.trim() || submitting}
          style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent", opacity: !text.trim() ? 0.5 : 1 }}
        >
          {submitting ? "기록 중…" : "제출하고 끝내자"}
        </button>
      </div>
    </>
  );
}

// ── 자기평가 (메타인지 + 정서) : 감정 날씨 · 설명 신호등 · 막힌 지점 ──
const WEATHER = [
  { icon: "☁️", label: "안개" },
  { icon: "🌤️", label: "조금 보임" },
  { icon: "☀️", label: "맑음" },
];
const LIGHTS = [
  { icon: "🔴", label: "아직" },
  { icon: "🟡", label: "대충" },
  { icon: "🟢", label: "설명 가능" },
];
const STUCK = ["없었어", "한자", "그림", "문제", "설명"];

function Pick({
  options,
  value,
  onPick,
}: {
  options: { icon: string; label: string }[];
  value: number | null;
  onPick: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((o, i) => (
        <button
          key={o.label}
          onClick={() => onPick(i)}
          style={{
            flex: 1,
            padding: "8px 4px",
            borderRadius: 10,
            border: i === value ? "2px solid var(--color-accent-strong)" : "1px solid var(--color-border-tertiary)",
            background: i === value ? "var(--color-background-info)" : "var(--color-background-secondary)",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 22 }}>{o.icon}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{o.label}</div>
        </button>
      ))}
    </div>
  );
}

// 학습 전 사전 점검: 느낌(날씨) + 예측(신호등) + 빠른 재인 1문항.
// 재인 정답 + 자신감🟢 → "이미 아는 단어"로 보고 복습만 하고 넘길 수 있음(모르는 것만 풀코스).
function PreflightScreen({
  concept,
  content,
  onStart,
  onSkipKnown,
}: {
  concept: Concept;
  content: ConceptContent;
  onStart: (p: { weather: number; light: number }) => void;
  onSkipKnown: () => void;
}) {
  const [weather, setWeather] = useState<number | null>(null);
  const [light, setLight] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  const check = content.quiz.find((q) => q.type === "정의형") ?? content.quiz[0];
  const answered = chosen !== null;
  const correct = answered && !!check.options[chosen!]?.is_correct;
  const ready = weather !== null && light !== null && answered;
  const canSkip = correct && light === 2; // 재인 정답 + "설명 가능" 예측 → 이미 앎

  return (
    <>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>{concept.name}</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
        시작 전 30초! 나중에 실제 결과랑 비교해 볼 거야.
      </p>

      <div style={card}>
        <p style={{ fontSize: 14, marginBottom: 6 }}>지금 이 단어, 느낌이 어때?</p>
        <Pick options={WEATHER} value={weather} onPick={setWeather} />

        <p style={{ fontSize: 14, margin: "14px 0 6px" }}>배우기 전 예상 — 이거 남한테 설명할 수 있을 것 같아?</p>
        <Pick options={LIGHTS} value={light} onPick={setLight} />
      </div>

      <div style={card}>
        <p style={{ fontSize: 14, marginBottom: 8 }}>빠른 확인 — {check.prompt}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {check.options.map((o, i) => (
            <button
              key={i}
              onClick={() => setChosen(i)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: i === chosen ? "2px solid var(--color-accent-strong)" : "1px solid var(--color-border-tertiary)",
                background: i === chosen ? "var(--color-background-info)" : "var(--color-background-secondary)",
                cursor: "pointer",
              }}
            >
              {o.text}
            </button>
          ))}
        </div>
      </div>

      {canSkip ? (
        <div style={{ ...card, background: "var(--color-background-info)" }}>
          <p style={{ fontSize: 14, marginBottom: 10 }}>
            이미 아는 것 같아! 복습만 하고 넘길까, 그래도 다 볼까?
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onSkipKnown} style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent" }}>
              복습만 · 넘기기
            </button>
            <button onClick={() => onStart({ weather: weather!, light: light! })}>그래도 다 볼래</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => ready && onStart({ weather: weather!, light: light! })}
            disabled={!ready}
            style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent", opacity: ready ? 1 : 0.5 }}
          >
            학습 시작
          </button>
        </div>
      )}
    </>
  );
}

// 학습 후: 끝 날씨 + '예측 vs 실제' 비교(메타인지 보정) + 막힌 지점
function PostCheck({ predict, actualLight }: { predict: { weather: number; light: number }; actualLight: number }) {
  const [after, setAfter] = useState<number | null>(null);
  const [stuck, setStuck] = useState<number | null>(null);

  const gap = predict.light - actualLight; // +면 과신, -면 과소평가, 0이면 정확
  const calib =
    gap === 0
      ? { msg: "예측이 딱 맞았어. 자기 상태를 잘 보고 있네.", color: "var(--color-text-success)" }
      : gap > 0
      ? { msg: "안다고 느꼈는데 실제론 좀 더 까다로웠지? 좋아, 착각을 하나 잡아낸 거야.", color: "var(--color-text-warning)" }
      : { msg: "생각보다 잘했어. 자신감 조금 더 가져도 돼.", color: "var(--color-text-info)" };

  return (
    <div style={{ ...card, background: "var(--color-background-secondary)" }}>
      <h3 style={{ marginTop: 0 }}>예측 vs 실제 — 나를 얼마나 알까?</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, marginBottom: 4 }}>
        <span>내 예측 {LIGHTS[predict.light].icon}</span>
        <span style={{ color: "var(--color-text-tertiary)" }}>vs</span>
        <span>실제 {LIGHTS[actualLight].icon}</span>
      </div>
      <p style={{ fontSize: 14, color: calib.color, marginBottom: 4 }}>{calib.msg}</p>
      <p style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
        (예측과 실제가 가까워질수록 메타인지가 자라.)
      </p>

      <p style={{ fontSize: 14, margin: "14px 0 6px" }}>시작할 땐 {WEATHER[predict.weather].icon}, 다 한 지금은?</p>
      <Pick options={WEATHER} value={after} onPick={setAfter} />
      {after !== null && (
        <p style={{ fontSize: 14, marginTop: 8, color: after > predict.weather ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
          {WEATHER[predict.weather].icon} → {WEATHER[after].icon}{" "}
          {after > predict.weather ? "머릿속이 개었어!" : after === predict.weather ? "아직 이 자리야. 한 번 더 보자." : ""}
        </p>
      )}

      <p style={{ fontSize: 14, margin: "14px 0 6px" }}>어느 부분이 제일 어려웠어?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {STUCK.map((s, i) => (
          <button
            key={s}
            onClick={() => setStuck(i)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 13,
              border: i === stuck ? "2px solid var(--color-accent-strong)" : "1px solid var(--color-border-tertiary)",
              background: i === stuck ? "var(--color-background-info)" : "var(--color-background-secondary)",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 결과 요약 ─────────────────────────────────────────────────────
function ResultSummary({
  concept,
  phone,
  predict,
  skipped,
  log,
  onRestart,
  onHome,
}: {
  concept: Concept;
  phone: string;
  predict: { weather: number; light: number } | null;
  skipped: boolean;
  log: Attempt[];
  onRestart: () => void;
  onHome: () => void;
}) {
  const obj = log.filter((a) => a.stage === "objective");
  const subj = log.find((a) => a.stage === "subjective");

  // 실제 이해도 → 신호등(0🔴/1🟡/2🟢): 설명 성공+무오류=🟢, 성공이나 오류/비계=🟡, 실패/미제출=🔴
  const actualLight = !subj || subj.result === "failed" ? 0 : subj.tags.length === 0 && !subj.scaffold_used ? 2 : 1;

  // 간격 반복 예약: 정상 완주면 이해도로 상자 이동. (스킵은 이미 markKnown 처리됨)
  const [nextReview, setNextReview] = useState<string | null>(null);
  useEffect(() => {
    if (!phone) return;
    if (!skipped) applyResult(phone, concept.id, actualLight);
    const rec = getSrs(phone, concept.id);
    if (rec) setNextReview(nextReviewLabel(rec));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (skipped) {
    return (
      <>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>{concept.name} · 이미 아는 단어! ✅</h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>
          사전 확인을 통과했어. 풀코스는 건너뛰고 복습 큐에 넣어둘게.
        </p>
        <div style={{ ...card, background: "var(--color-background-info)" }}>
          <p style={{ lineHeight: 1.6 }}>
            다음 복습: <b>{nextReview ?? "예약됨"}</b>
            <br />
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              모르는 단어에 시간을 더 쓰는 게 효율적이야.
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onRestart}>그래도 학습하기</button>
          <button onClick={onHome} style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent" }}>
            홈으로
          </button>
        </div>
      </>
    );
  }

  const tempRise = getTempRise(obj, subj);
  const correctCount = obj.filter((a) => a.result === "correct").length;
  const allClear = obj.length > 0 && correctCount === obj.length && subj?.result === "explained";

  return (
    <>
      <div style={{ ...card, background: "var(--color-background-success)", marginBottom: 16 }}>
        <p style={{ color: "var(--color-text-success)", fontSize: 13, fontWeight: 900, marginBottom: 4 }}>
          오늘 오른 개념 온도
        </p>
        <h1 style={{ fontSize: 34, lineHeight: 1.15, margin: "0 0 10px" }}>
          {concept.name} +{tempRise}℃
        </h1>
        <div style={{ height: 10, borderRadius: 999, background: "rgba(79, 159, 46, 0.18)", overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min(100, tempRise * 12)}%`,
              height: "100%",
              borderRadius: 999,
              background: "var(--color-accent-strong)",
            }}
          />
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>오늘 확인</h3>
        <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.5 }}>
          문제는 {obj.length ? `${correctCount}/${obj.length}개` : "건너뛰고"} 잡았어.
        </p>
        <p style={{ marginTop: 6, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
          {allClear ? "좋아. 지금은 다음 개념으로 넘어가도 돼." : "괜찮아. 그림을 한 번 더 보고, 한 문장으로 다시 말하면 더 단단해져."}
        </p>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>내 설명</h3>
        {subj ? (
          <p style={{ fontSize: 15, whiteSpace: "pre-wrap", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            “{subj.answer_text}”
          </p>
        ) : (
          <p style={{ color: "var(--color-text-tertiary)" }}>아직 설명 기록은 없어.</p>
        )}
      </div>

      <div style={{ ...card, background: "var(--color-background-info)" }}>
        <h3 style={{ marginTop: 0 }}>다음</h3>
        <p style={{ lineHeight: 1.6 }}>
          {allClear ? "이 개념은 불이 켜졌어. 다음 개념으로 가자." : "이 개념은 그림 보고 한 문장만 다시 말해 보면 돼."}
        </p>
        {nextReview && (
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--color-text-secondary)" }}>
            <i className="ti ti-refresh" aria-hidden="true" style={{ marginRight: 4 }}></i>
            다음 복습: <b>{nextReview}</b> {actualLight >= 2 ? "(잘 알아서 간격을 늘렸어)" : actualLight === 0 ? "(곧 다시 볼게)" : ""}
          </p>
        )}
      </div>

      {predict && <PostCheck predict={predict} actualLight={actualLight} />}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onRestart}>다시 하기</button>
        <button onClick={onHome} style={{ background: "var(--color-accent-strong)", color: "#fff", borderColor: "transparent" }}>
          홈으로
        </button>
      </div>
    </>
  );
}
