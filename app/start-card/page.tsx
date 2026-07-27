"use client";

/**
 * 글로쌤 학습 출발점 카드 — 진단 화면.
 * 8문항, 보기 순서는 문항마다 섞여 있음(버튼 매핑은 화면에 노출 안 함).
 * 자동 채점 → 1위가 뚜렷하면 단일형, 1·2위 차이 1 이하면 복합형 결과 카드.
 * 검사가 아니라 "출발점 찾기"이므로 점수·등급·우열은 표시하지 않는다.
 */

import { useMemo, useState } from "react";
import Mascot from "../components/Mascot";

type ButtonKey = "life" | "concept" | "doing" | "big";

interface ButtonMeta {
  key: ButtonKey;
  label: string;
  bg: string; // 결과 카드 배경 토큰
}

// 4개 버튼 — 순서는 채점·룩업의 기준 우선순위로도 쓰인다.
const BUTTONS: ButtonMeta[] = [
  { key: "life", label: "생활 연결", bg: "var(--color-background-warning)" },
  { key: "concept", label: "개념 정리", bg: "var(--color-background-info)" },
  { key: "doing", label: "해보기", bg: "var(--color-background-success)" },
  { key: "big", label: "큰그림", bg: "var(--color-background-secondary)" },
];

const BUTTON_LABEL: Record<ButtonKey, string> = Object.fromEntries(
  BUTTONS.map((b) => [b.key, b.label]),
) as Record<ButtonKey, string>;

interface Option {
  text: string;
  key: ButtonKey;
}
interface Question {
  prompt: string;
  options: Option[]; // 이미 셔플된 순서로 저장
}

const QUESTIONS: Question[] = [
  {
    prompt: "새 단원 첫 페이지를 펼쳤어. 무엇이 먼저 궁금해?",
    options: [
      { text: "중요한 개념어의 정확한 뜻을 먼저 알고 싶다.", key: "concept" },
      { text: "전체 흐름이 어떻게 이어지는지 먼저 보고 싶다.", key: "big" },
      { text: "이 내용이 내 생활과 어떤 관련이 있는지 궁금하다.", key: "life" },
      { text: "예시 문제나 활동을 하나 해보면 감이 올 것 같다.", key: "doing" },
    ],
  },
  {
    prompt: "선생님이 ‘기후’를 설명해. 어떤 설명이 가장 도움이 돼?",
    options: [
      { text: "“세계 여러 도시의 한 달 날씨를 직접 찾아 비교해 보자.”", key: "doing" },
      {
        text: "“기후는 한 지역에서 여러 해 동안 나타나는 평균적인 날씨야.”",
        key: "concept",
      },
      {
        text: "“위도 → 기온 차이 → 사람들의 옷·집·생활 차이로 이어지는 흐름이야.”",
        key: "big",
      },
      {
        text: "“네가 여름엔 반팔, 겨울엔 패딩 입는 것도 기후랑 연결돼.”",
        key: "life",
      },
    ],
  },
  {
    prompt: "과학 시간에 ‘변인’이라는 말이 나왔어. 가장 필요한 도움은?",
    options: [
      { text: "탐구 문제부터 결론까지 전체 실험 흐름 속에서 보고 싶다.", key: "big" },
      {
        text: "조작 변인·종속 변인·통제 변인의 뜻을 정확히 정리하고 싶다.",
        key: "concept",
      },
      { text: "실험을 생활 속 상황으로 바꿔서 설명해 주면 좋겠다.", key: "life" },
      { text: "직접 실험 예시를 보면서 무엇이 변인인지 찾아보고 싶다.", key: "doing" },
    ],
  },
  {
    prompt: "교과서 문장이 너무 길어서 이해가 안 돼. 어떻게 하면 좋을까?",
    options: [
      { text: "문장에 직접 밑줄을 긋고 표시해 보고 싶다.", key: "doing" },
      { text: "내 경험과 비슷한 예시를 먼저 듣고 싶다.", key: "life" },
      { text: "핵심어 뜻을 먼저 정리하고 싶다.", key: "concept" },
      { text: "문장을 원인 → 결과, 앞 → 뒤 흐름으로 나눠 보고 싶다.", key: "big" },
    ],
  },
  {
    prompt: "공부한 내용을 복습할 때 가장 편한 방법은?",
    options: [
      { text: "흐름도나 노트 구조를 보며 전체를 다시 본다.", key: "big" },
      { text: "내 생활과 연결해서 다시 떠올린다.", key: "life" },
      { text: "문제를 풀거나 다른 사람에게 설명해 본다.", key: "doing" },
      { text: "개념어 뜻과 핵심 문장을 다시 정리한다.", key: "concept" },
    ],
  },
  {
    prompt: "사회 단원에 표·그래프가 많이 나와. 가장 먼저 하고 싶은 건?",
    options: [
      { text: "표가 말하는 큰 변화·흐름을 먼저 읽고 싶다.", key: "big" },
      { text: "표에 나온 용어의 뜻부터 정확히 확인하고 싶다.", key: "concept" },
      { text: "표의 숫자가 내 생활에서 어떤 의미인지 알고 싶다.", key: "life" },
      { text: "표에서 가장 큰 값·작은 값에 직접 표시해 보고 싶다.", key: "doing" },
    ],
  },
  {
    prompt: "과학 새 단원에 처음 보는 용어가 5개 나왔어. 어떻게 시작할까?",
    options: [
      { text: "용어들을 직접 카드로 만들어 분류해 보고 싶다.", key: "doing" },
      { text: "용어 하나하나의 정확한 뜻을 먼저 정리하고 싶다.", key: "concept" },
      { text: "이 용어들이 실제로 어디에 쓰이는지 예를 듣고 싶다.", key: "life" },
      { text: "용어들이 서로 어떻게 연결되는지 관계부터 보고 싶다.", key: "big" },
    ],
  },
  {
    prompt: "서술형 문제를 써야 해. 어떤 준비가 가장 든든해?",
    options: [
      { text: "핵심 개념어의 뜻을 정확히 알고 있으면 든든하다.", key: "concept" },
      { text: "답안 전체 흐름(처음–중간–끝)을 잡아 두면 든든하다.", key: "big" },
      { text: "비슷한 예시를 떠올려 두면 든든하다.", key: "life" },
      { text: "미리 한 번 써보거나 말로 설명해 두면 든든하다.", key: "doing" },
    ],
  },
];

interface ResultCard {
  title: string;
  quote: string;
  howto: string[];
  mission: string;
  bg: string;
}

const SINGLE: Record<ButtonKey, ResultCard> = {
  life: {
    title: "생활 연결 버튼",
    quote: "나는 공부할 때 내 생활과 연결되면 더 잘 이해해요.",
    howto: ["예시 먼저 보기", "내 경험과 연결하기", "이 개념이 왜 필요한지 생각하기"],
    mission: "예시를 본 뒤 교과서 개념어로 한 문장 정리하기",
    bg: "var(--color-background-warning)",
  },
  concept: {
    title: "개념 정리 버튼",
    quote: "나는 뜻과 기준이 분명하면 더 편안하게 공부해요.",
    howto: ["핵심어 뜻 먼저 보기", "정의와 예시 구분하기", "비슷한 개념 비교하기"],
    mission: "뜻을 정리한 뒤 직접 예시 하나 만들기",
    bg: "var(--color-background-info)",
  },
  doing: {
    title: "해보기 버튼",
    quote: "나는 직접 해보면 공부가 더 잘 들어와요.",
    howto: ["밑줄 긋기", "카드 분류하기", "문제 풀어보기", "말로 설명하기"],
    mission: "활동 후 핵심을 한 문장으로 정리하기",
    bg: "var(--color-background-success)",
  },
  big: {
    title: "큰그림 버튼",
    quote: "나는 전체 흐름이 보이면 이해가 쉬워져요.",
    howto: ["단원 제목 보기", "흐름도 그리기", "원인과 결과 연결하기", "한 장 요약하기"],
    mission: "흐름을 본 뒤 핵심어 뜻을 정확히 정리하기",
    bg: "var(--color-background-secondary)",
  },
};

// 두 버튼이 비슷하게 켜진 학생용. 키는 BUTTONS 우선순위 순으로 정렬해 "a+b"로 룩업.
const COMPOSITE: Record<string, ResultCard> = {
  "life+concept": {
    title: "생활 + 개념 — 와닿게 뜻 잡는 형",
    quote: "나는 내 생활과 연결해 뜻을 잡으면 편해요.",
    howto: ["생활 예시로 시작", "핵심어 뜻 정리", "정의와 예시 구분"],
    mission: "정리한 뜻을 내 생활 예시로 한 번 더 설명하기",
    bg: "var(--color-background-warning)",
  },
  "life+doing": {
    title: "생활 + 해보기 — 느끼고 해보는 형",
    quote: "나는 내 생활과 연결해 직접 해볼 때 가장 잘 들어와요.",
    howto: ["생활 예시", "짧은 활동", "말로 설명"],
    mission: "활동 후 교과서 개념어로 한 문장 정리하기",
    bg: "var(--color-background-success)",
  },
  "life+big": {
    title: "생활 + 큰그림 — 맥락으로 보는 형",
    quote: "나는 왜 배우는지와 전체 흐름이 보이면 편해요.",
    howto: ["생활 맥락", "단원 지도", "핵심어 뜻 정리"],
    mission: "흐름 속 핵심 개념어의 정확한 뜻 확인하기",
    bg: "var(--color-background-warning)",
  },
  "concept+doing": {
    title: "개념 + 해보기 — 정리하고 적용하는 형",
    quote: "나는 뜻을 잡은 뒤 직접 써볼 때 확실해져요.",
    howto: ["개념어 뜻 정리", "예시 문제 적용", "자기 말로 설명"],
    mission: "푼 문제를 흐름으로 한 번 더 묶어 보기",
    bg: "var(--color-background-info)",
  },
  "concept+big": {
    title: "개념 + 큰그림 — 뜻을 잡고 흐름으로 묶는 형",
    quote: "나는 뜻이 분명하고 전체 그림이 보이면 가장 잘 이해해요.",
    howto: ["핵심어 뜻 정리", "흐름도로 연결", "한 장 요약"],
    mission: "흐름 요약 끝에 핵심어 뜻을 한 줄로 덧붙이기",
    bg: "var(--color-background-info)",
  },
  "doing+big": {
    title: "해보기 + 큰그림 — 해보며 흐름 잡는 형",
    quote: "나는 직접 해보면서 전체 흐름이 보이면 잘 이해해요.",
    howto: ["짧은 활동", "흐름도 그리기", "원인-결과 연결"],
    mission: "활동·흐름 뒤 핵심어 뜻을 한 줄로 정리하기",
    bg: "var(--color-background-success)",
  },
};

const ORDER = BUTTONS.map((b) => b.key);

function pairKey(a: ButtonKey, b: ButtonKey): string {
  const [x, y] = [a, b].sort((p, q) => ORDER.indexOf(p) - ORDER.indexOf(q));
  return `${x}+${y}`;
}

interface Outcome {
  card: ResultCard;
  lit: ButtonKey[]; // 결과에 반영된 "켜진 버튼"
}

function scoreToOutcome(answers: ButtonKey[]): Outcome {
  const counts: Record<ButtonKey, number> = { life: 0, concept: 0, doing: 0, big: 0 };
  answers.forEach((k) => (counts[k] += 1));
  // 동점 시 BUTTONS 우선순위로 안정 정렬
  const ranked = ORDER.slice().sort((a, b) => counts[b] - counts[a]);
  const [first, second] = ranked;
  if (counts[first] - counts[second] <= 1) {
    return { card: COMPOSITE[pairKey(first, second)], lit: [first, second] };
  }
  return { card: SINGLE[first], lit: [first] };
}

export default function StartCardPage() {
  // step: -1 = 인트로, 0..7 = 문항, 8 = 결과
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<ButtonKey[]>([]);

  const outcome = useMemo(
    () => (answers.length === QUESTIONS.length ? scoreToOutcome(answers) : null),
    [answers],
  );

  function choose(key: ButtonKey) {
    const next = [...answers, key];
    setAnswers(next);
    setStep((s) => s + 1);
  }

  function restart() {
    setAnswers([]);
    setStep(-1);
  }

  return (
    <main style={{ padding: "0 1rem 3rem" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {step === -1 && <Intro onStart={() => setStep(0)} />}
        {step >= 0 && step < QUESTIONS.length && (
          <QuestionView
            index={step}
            total={QUESTIONS.length}
            question={QUESTIONS[step]}
            onChoose={choose}
          />
        )}
        {step === QUESTIONS.length && outcome && (
          <ResultView outcome={outcome} onRestart={restart} />
        )}
      </div>
    </main>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section style={{ textAlign: "center", paddingTop: 48 }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        <Mascot type="question" mood="happy" size={92} />
        <Mascot type="exclaim" mood="happy" size={92} />
      </div>
      <h1 style={{ fontSize: 26, margin: "0 0 8px" }}>학습 출발점 카드</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 4 }}>
        너는 어떤 버튼이 먼저 켜질까?
      </p>
      <p style={{ color: "var(--color-text-tertiary)", fontSize: 14, marginBottom: 28 }}>
        정답은 없어요. 공부를 시작할 때 가장 도움이 되는 쪽을 고르면 돼요.
      </p>
      <button
        onClick={onStart}
        style={{
          background: "var(--color-accent)",
          borderColor: "var(--color-accent-strong)",
          fontWeight: 700,
          padding: "14px 28px",
        }}
      >
        시작하기
        <i className="ti ti-arrow-right" aria-hidden="true" style={{ marginLeft: 6 }}></i>
      </button>
    </section>
  );
}

function QuestionView({
  index,
  total,
  question,
  onChoose,
}: {
  index: number;
  total: number;
  question: Question;
  onChoose: (key: ButtonKey) => void;
}) {
  const pct = Math.round((index / total) * 100);
  return (
    <section style={{ paddingTop: 24 }}>
      {/* 진행 바 — 점수가 아니라 진행도만 표시 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div
          style={{
            flex: 1,
            height: 8,
            background: "var(--color-background-secondary)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--color-accent)",
              transition: "width 0.25s",
            }}
          />
        </div>
        <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
          {index + 1} / {total}
        </span>
      </div>

      <h2 style={{ fontSize: 19, lineHeight: 1.45, marginBottom: 20 }}>{question.prompt}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onChoose(opt.key)}
            style={{
              textAlign: "left",
              padding: "14px 16px",
              lineHeight: 1.45,
              borderRadius: "var(--border-radius-lg)",
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </section>
  );
}

function ResultView({ outcome, onRestart }: { outcome: Outcome; onRestart: () => void }) {
  const { card, lit } = outcome;
  return (
    <section style={{ paddingTop: 28 }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <Mascot type="exclaim" mood="happy" size={84} />
      </div>

      {/* 켜진 버튼 칩 — 숫자·등급 없이 어떤 버튼이 켜졌는지만 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
        {lit.map((k) => (
          <span
            key={k}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              background: "var(--color-accent)",
              color: "var(--color-text-primary)",
            }}
          >
            {BUTTON_LABEL[k]}
          </span>
        ))}
      </div>

      <article
        style={{
          background: card.bg,
          border: "1px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "22px 20px",
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>{card.title}</h2>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>“{card.quote}”</p>

        <h3 style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 8 }}>
          나에게 맞는 공부 시작법
        </h3>
        <ul style={{ margin: "0 0 18px", paddingLeft: 18, lineHeight: 1.7 }}>
          {card.howto.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <div
          style={{
            background: "var(--color-background-primary)",
            border: "1px dashed var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding: "12px 14px",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--color-text-success)", fontWeight: 700 }}>
            <i className="ti ti-flag" aria-hidden="true" style={{ marginRight: 4 }}></i>
            성장 미션
          </span>
          <p style={{ marginTop: 4 }}>{card.mission}</p>
        </div>
      </article>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-tertiary)",
          textAlign: "center",
          margin: "16px 0",
          lineHeight: 1.6,
        }}
      >
        이건 너를 한 가지로 정하는 게 아니라, 오늘 공부를 시작하는 문이야.
        <br />
        공부하면서 다른 버튼도 얼마든지 켜질 수 있어.
      </p>

      <div style={{ textAlign: "center" }}>
        <button onClick={onRestart} style={{ fontSize: 14 }}>
          <i className="ti ti-refresh" aria-hidden="true" style={{ marginRight: 4 }}></i>
          다시 해보기
        </button>
      </div>
    </section>
  );
}
