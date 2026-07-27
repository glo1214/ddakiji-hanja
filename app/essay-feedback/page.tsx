"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import styles from "./page.module.css";

type Subject = "사회" | "국어" | "과학" | "기타";
type ImageKey = "prompt" | "answer" | "evidence";
type CriteriaStatus = "ok" | "caution" | "missing";
type PatternTag =
  | "prompt_misread"
  | "keyword_only"
  | "missing_conclusion"
  | "subjective_judgment"
  | "weak_textbook_expression"
  | "example_listing"
  | "weak_causality"
  | "condition_missing";

interface EssayInput {
  subject: Subject;
  promptText: string;
  studentAnswer: string;
  textbookEvidence: string;
  teacherMark: string;
}

interface CriteriaResult {
  key: string;
  title: string;
  status: CriteriaStatus;
  reason: string;
}

interface AnalysisResult {
  risk: "낮음" | "보통" | "높음";
  promptDemand: string;
  strength: string;
  criteria: CriteriaResult[];
  patternTags: PatternTag[];
  deductionReasons: string[];
  missingThinkingStep: string;
  rewrittenAnswer: string;
  nextQuestions: string[];
}

const SUBJECTS: Subject[] = ["사회", "국어", "과학", "기타"];

const SAMPLE_INPUT: EssayInput = {
  subject: "사회",
  promptText: "문화의 세계화로 인한 긍정적 영향을 서술하시오.",
  studentAnswer: "다양한 문화를 경험하고 다른 나라 사람의 삶을 알 수 있다.",
  textbookEvidence:
    "세계 각국의 다양한 음식, 스포츠, 음악, 영화 등을 일상에서 쉽게 즐길 수 있게 되었고, 그에 따라 우리의 삶도 더욱 풍요로워지고 있다.",
  teacherMark: "부분 점수 가능. 긍정적 결과 표현이 약함.",
};

const PATTERN_META: Record<PatternTag, { title: string; desc: string }> = {
  prompt_misread: {
    title: "발문 오독형",
    desc: "문제에서 요구한 방향과 답의 방향이 어긋납니다.",
  },
  keyword_only: {
    title: "키워드만 떠올림형",
    desc: "핵심 소재는 썼지만 뜻이나 결과 설명이 부족합니다.",
  },
  missing_conclusion: {
    title: "결론 생략형",
    desc: "답 뒤에 '그래서 왜?'를 붙였을 때 결과가 충분히 드러나지 않습니다.",
  },
  subjective_judgment: {
    title: "주관 판단형",
    desc: "개인 느낌이나 상식에 가까워 교과 근거가 약합니다.",
  },
  weak_textbook_expression: {
    title: "교과서 표현 약화형",
    desc: "교과서의 채점 가능한 표현이 학생 답에서 흐려졌습니다.",
  },
  example_listing: {
    title: "예시 나열형",
    desc: "사례는 보이지만 공통 의미나 개념 설명이 부족합니다.",
  },
  weak_causality: {
    title: "인과 부족형",
    desc: "원인과 결과를 이어주는 말이 약합니다.",
  },
  condition_missing: {
    title: "조건 누락형",
    desc: "문제의 개수, 지정어, 사례 조건을 빠뜨렸을 가능성이 있습니다.",
  },
};

const UPLOAD_META: Record<ImageKey, { title: string; hint: string; icon: string }> = {
  prompt: { title: "문제", hint: "발문·조건", icon: "ti-clipboard-text" },
  answer: { title: "답안", hint: "학생 글씨", icon: "ti-pencil" },
  evidence: { title: "근거", hint: "교과서·수업", icon: "ti-book-2" },
};

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function countClauses(text: string) {
  return text
    .split(/,|\.|·|그리고|또한|첫째|둘째|1\)|2\)|①|②/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function detectDemand(promptText: string) {
  const demands: string[] = [];
  if (promptText.includes("긍정")) demands.push("긍정적 영향");
  if (promptText.includes("부정")) demands.push("부정적 영향");
  if (promptText.includes("원인")) demands.push("원인");
  if (promptText.includes("결과")) demands.push("결과");
  if (promptText.includes("영향") && !demands.some((d) => d.includes("영향"))) demands.push("영향");
  if (promptText.includes("특징")) demands.push("특징");
  if (promptText.includes("사례")) demands.push("사례");
  if (promptText.includes("해결")) demands.push("해결 방안");
  if (promptText.includes("비교")) demands.push("비교");
  if (promptText.includes("의의") || promptText.includes("의미")) demands.push("의미·의의");
  if (promptText.includes("근거")) demands.push("근거");
  return demands.length ? demands.join(" + ") : "발문 요구 확인 필요";
}

function detectRequiredCount(promptText: string) {
  if (/두\s*가지|2\s*가지|둘/.test(promptText)) return 2;
  if (/세\s*가지|3\s*가지|셋/.test(promptText)) return 3;
  return 1;
}

function statusLabel(status: CriteriaStatus) {
  if (status === "ok") return "충족";
  if (status === "caution") return "주의";
  return "부족";
}

function statusIcon(status: CriteriaStatus) {
  if (status === "ok") return "ti-circle-check";
  if (status === "caution") return "ti-alert-triangle";
  return "ti-circle-x";
}

function makeCriterion(
  key: string,
  title: string,
  status: CriteriaStatus,
  reason: string,
): CriteriaResult {
  return { key, title, status, reason };
}

function analyzeEssay(input: EssayInput): AnalysisResult {
  const prompt = input.promptText.trim();
  const answer = input.studentAnswer.trim();
  const evidence = input.textbookEvidence.trim();
  const promptDemand = detectDemand(prompt);
  const requiredCount = detectRequiredCount(prompt);

  const requiresPositive = prompt.includes("긍정");
  const requiresNegative = prompt.includes("부정");
  const requiresCausality =
    prompt.includes("영향") || prompt.includes("원인") || prompt.includes("결과");

  const strongPositive = ["풍요", "즐길", "즐기", "이해", "넓", "존중", "교류", "발전", "기회"];
  const strongNegative = ["사라", "약화", "갈등", "문제", "획일", "불평등", "차별", "훼손"];
  const weakMaterials = ["다양", "문화", "경험", "알 수", "삶", "사람"];
  const subjectiveWords = ["나는", "내 생각", "좋다", "나쁘다", "재미", "싫다", "멋지다"];
  const connectors = ["때문", "따라", "그래서", "그 결과", "이를 통해", "수 있어", "므로", "따라서"];

  const hasStrongPositive = hasAny(answer, strongPositive);
  const hasStrongNegative = hasAny(answer, strongNegative);
  const hasWeakMaterial = hasAny(answer, weakMaterials);
  const hasSubjective = hasAny(answer, subjectiveWords);
  const hasConnector = hasAny(answer, connectors);
  const hasSentenceEnding = /다$|다\.|요$|요\.|임$|함$|된다|있다|한다/.test(answer);
  const answerClauseCount = countClauses(answer);

  const evidenceNeedsEnjoy = evidence.includes("즐길") || evidence.includes("즐기");
  const evidenceNeedsRich = evidence.includes("풍요");
  const missesEnjoy = evidenceNeedsEnjoy && !answer.includes("즐");
  const missesRich = evidenceNeedsRich && !answer.includes("풍요");

  const criteria: CriteriaResult[] = [
    makeCriterion(
      "prompt_fit",
      "발문 적합성",
      requiresPositive && !hasStrongPositive
        ? "caution"
        : requiresNegative && !hasStrongNegative
          ? "caution"
          : "ok",
      requiresPositive && !hasStrongPositive
        ? "긍정적 영향을 묻지만 답안에는 긍정적 결과가 충분히 드러나지 않습니다."
        : requiresNegative && !hasStrongNegative
          ? "부정적 영향을 묻지만 답안에는 문제 상황이나 부정적 결과가 약합니다."
          : "문제에서 요구한 방향과 대체로 맞습니다.",
    ),
    makeCriterion(
      "keyword",
      "핵심어 충족",
      missesEnjoy || missesRich ? "caution" : hasWeakMaterial || answer.length > 0 ? "ok" : "missing",
      missesEnjoy || missesRich
        ? "교과서 근거의 핵심 표현이 답안에서 약해졌습니다."
        : hasWeakMaterial
          ? "핵심 소재는 잡았습니다."
          : "교과서 핵심어와 연결되는 표현이 부족합니다.",
    ),
    makeCriterion(
      "logic",
      "논리 연결",
      requiresCausality && !hasConnector && (requiresPositive || requiresNegative)
        ? "missing"
        : requiresCausality && !hasConnector
          ? "caution"
          : "ok",
      requiresCausality && !hasConnector
        ? "영향을 묻는 문항인데 원인과 결과를 이어주는 표현이 약합니다."
        : "답안 안에서 원인·결과 연결이 보입니다.",
    ),
    makeCriterion(
      "objectivity",
      "객관성",
      hasSubjective ? "caution" : "ok",
      hasSubjective
        ? "개인 느낌에 가까운 표현은 교과 근거로 바꾸는 것이 안전합니다."
        : "개인 감상보다 내용 설명 중심으로 쓰였습니다.",
    ),
    makeCriterion(
      "specificity",
      "구체성",
      answer.length < 12 ? "missing" : requiresPositive && !hasStrongPositive ? "caution" : "ok",
      answer.length < 12
        ? "답안이 너무 짧아 채점 가능한 정보가 부족합니다."
        : requiresPositive && !hasStrongPositive
          ? "소재는 있지만 무엇이 어떻게 좋아지는지 더 구체화해야 합니다."
          : "대상과 변화가 비교적 구체적으로 드러납니다.",
    ),
    makeCriterion(
      "conditions",
      "조건 충족",
      requiredCount > 1 && answerClauseCount < requiredCount ? "missing" : "ok",
      requiredCount > 1 && answerClauseCount < requiredCount
        ? `문제에서 ${requiredCount}가지를 요구했을 가능성이 있지만 답안은 ${answerClauseCount}개로 보입니다.`
        : "개수나 형식 조건에서 큰 누락은 보이지 않습니다.",
    ),
    makeCriterion(
      "completion",
      "답안 완결성",
      !answer ? "missing" : hasSentenceEnding ? "ok" : "caution",
      !answer
        ? "학생 답안이 입력되지 않았습니다."
        : hasSentenceEnding
          ? "문장 형태로 마무리되었습니다."
          : "문장이 채점 가능한 형태로 끝나는지 확인이 필요합니다.",
    ),
  ];

  const patternTags: PatternTag[] = [];
  if ((requiresPositive && !hasStrongPositive) || (requiresNegative && !hasStrongNegative)) {
    if (hasWeakMaterial) patternTags.push("missing_conclusion");
    else patternTags.push("prompt_misread");
  }
  if (answer.length > 0 && answer.length < 16) patternTags.push("keyword_only");
  if (hasSubjective) patternTags.push("subjective_judgment");
  if (missesEnjoy || missesRich) patternTags.push("weak_textbook_expression");
  if (/음식|스포츠|음악|영화|예를 들어|등/.test(answer) && !hasConnector) {
    patternTags.push("example_listing");
  }
  if (requiresCausality && !hasConnector) patternTags.push("weak_causality");
  if (requiredCount > 1 && answerClauseCount < requiredCount) patternTags.push("condition_missing");

  const uniqueTags = [...new Set(patternTags)];
  const deductionReasons: string[] = [];
  const promptFit = criteria.find((c) => c.key === "prompt_fit");
  const keyword = criteria.find((c) => c.key === "keyword");
  const logic = criteria.find((c) => c.key === "logic");

  if (promptFit && promptFit.status !== "ok") deductionReasons.push(promptFit.reason);
  if (keyword && keyword.status !== "ok") deductionReasons.push(keyword.reason);
  if (logic && logic.status !== "ok") deductionReasons.push(logic.reason);
  if (deductionReasons.length === 0) {
    deductionReasons.push("현재 입력만 보면 큰 감점 신호는 약합니다. 교과서 표현과 조건을 한 번 더 확인하면 좋습니다.");
  }

  const cautionCount = criteria.filter((c) => c.status === "caution").length;
  const missingCount = criteria.filter((c) => c.status === "missing").length;
  const risk: AnalysisResult["risk"] =
    missingCount >= 2 || cautionCount >= 3 ? "높음" : missingCount >= 1 || cautionCount >= 1 ? "보통" : "낮음";

  const rewrittenAnswer =
    prompt.includes("문화") && (prompt.includes("세계화") || evidence.includes("풍요"))
      ? "세계 여러 나라의 음식, 음악, 영화 등 다양한 문화를 쉽게 즐길 수 있어 우리의 일상이 더욱 풍요로워진다."
      : requiresPositive
        ? "교과서 핵심어를 사용해, 어떤 변화가 생기고 그 결과 왜 긍정적인지까지 한 문장으로 쓴다."
        : requiresNegative
          ? "교과서 핵심어를 사용해, 어떤 문제가 생기고 그 결과 왜 부정적인지까지 한 문장으로 쓴다."
          : "문제에서 요구한 핵심어를 먼저 쓰고, 그 뜻과 결과를 한 문장으로 연결한다.";

  return {
    risk,
    promptDemand,
    strength: hasWeakMaterial
      ? "문제와 관련된 핵심 소재는 잡았습니다. 이제 그 소재가 왜 답이 되는지 결과까지 연결하면 됩니다."
      : "답안을 문제 요구와 연결하려는 시도가 보입니다. 핵심어와 교과서 근거를 더 분명히 넣어야 합니다.",
    criteria,
    patternTags: uniqueTags,
    deductionReasons,
    missingThinkingStep: requiresPositive
      ? "이 내용이 왜 긍정적인 영향인가?"
      : requiresNegative
        ? "이 내용이 왜 부정적인 영향인가?"
        : "내 답이 문제에서 묻는 말에 직접 대답하고 있는가?",
    rewrittenAnswer,
    nextQuestions: [
      "문제에서 긍정·부정·원인·결과 중 무엇을 묻는가?",
      "내 답 뒤에 '그래서 왜?'를 붙이면 바로 대답할 수 있는가?",
      "교과서의 채점 가능한 표현이 내 답안에 남아 있는가?",
    ],
  };
}

export default function EssayFeedbackPage() {
  const router = useRouter();
  const { student, loading, logout } = useAuth();
  const createdUrls = useRef<string[]>([]);
  const [input, setInput] = useState<EssayInput>(SAMPLE_INPUT);
  const [images, setImages] = useState<Record<ImageKey, string | null>>({
    prompt: null,
    answer: null,
    evidence: null,
  });
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => analyzeEssay(SAMPLE_INPUT));

  useEffect(() => {
    if (!loading && !student) router.replace("/login");
  }, [loading, student, router]);

  useEffect(() => {
    return () => {
      createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function updateInput<K extends keyof EssayInput>(key: K, value: EssayInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleImage(key: ImageKey, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    createdUrls.current.push(url);
    setImages((prev) => ({ ...prev, [key]: url }));
    event.currentTarget.value = "";
  }

  function clearImage(key: ImageKey) {
    setImages((prev) => ({ ...prev, [key]: null }));
  }

  function resetSample() {
    setInput(SAMPLE_INPUT);
    setAnalysis(analyzeEssay(SAMPLE_INPUT));
  }

  function runAnalysis() {
    setAnalysis(analyzeEssay(input));
  }

  if (loading || !student) {
    return (
      <main className={styles.emptyResult}>
        <p>불러오는 중…</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <button
            className={styles.iconButton}
            onClick={() => router.push("/")}
            aria-label="홈으로"
            title="홈으로"
          >
            <i className="ti ti-arrow-left" aria-hidden="true"></i>
          </button>
          <span>
            딱이지<span className={styles.brandDot}>.</span>
          </span>
        </div>
        <div className={styles.topActions}>
          <span>
            <i className="ti ti-user" aria-hidden="true"></i> {student.name}
          </span>
          <button onClick={logout} style={{ padding: "7px 10px", fontSize: 13 }}>
            로그아웃
          </button>
        </div>
      </div>

      <header className={styles.hero}>
        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>서술형 오답 코치</span>
          <h1 className={styles.title}>감점 이유를 사고 단계로 풀어보기</h1>
          <p className={styles.subtitle}>
            문제 요구, 교과서 근거, 학생 답안을 나란히 놓고 감점 가능성과 다음 답안 전략을 정리합니다.
          </p>
        </div>
        <div className={styles.subjectControl} aria-label="과목 선택">
          {SUBJECTS.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => updateInput("subject", subject)}
              className={`${styles.subjectButton} ${
                input.subject === subject ? styles.subjectButtonActive : ""
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.workspace}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <i className="ti ti-camera" aria-hidden="true"></i>
              입력
            </h2>
            <span className={styles.smallText}>사진은 미리보기, 분석은 확인 텍스트 기준</span>
          </div>

          <div className={styles.uploadGrid}>
            {(Object.keys(UPLOAD_META) as ImageKey[]).map((key) => {
              const item = UPLOAD_META[key];
              return (
                <div className={styles.uploadSlot} key={key}>
                  {images[key] ? (
                    <>
                      <img className={styles.preview} src={images[key] ?? ""} alt={`${item.title} 미리보기`} />
                      <button
                        type="button"
                        className={styles.clearPreview}
                        onClick={() => clearImage(key)}
                        aria-label={`${item.title} 이미지 지우기`}
                        title="이미지 지우기"
                      >
                        <i className="ti ti-x" aria-hidden="true"></i>
                      </button>
                    </>
                  ) : (
                    <label className={styles.uploadLabel}>
                      <span className={styles.uploadIcon}>
                        <i className={`ti ${item.icon}`} aria-hidden="true"></i>
                      </span>
                      <span>
                        <p className={styles.uploadTitle}>{item.title}</p>
                        <p className={styles.uploadHint}>{item.hint}</p>
                      </span>
                      <input
                        className={styles.fileInput}
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImage(key, event)}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.fieldStack}>
            <label className={styles.field}>
              <span className={styles.label}>문제 발문</span>
              <textarea
                className={styles.textarea}
                value={input.promptText}
                onChange={(event) => updateInput("promptText", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>학생 답안</span>
              <textarea
                className={styles.textarea}
                value={input.studentAnswer}
                onChange={(event) => updateInput("studentAnswer", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>교과서·수업 근거</span>
              <textarea
                className={styles.textarea}
                value={input.textbookEvidence}
                onChange={(event) => updateInput("textbookEvidence", event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>선생님 표시</span>
              <textarea
                className={`${styles.textarea} ${styles.shortTextarea}`}
                value={input.teacherMark}
                onChange={(event) => updateInput("teacherMark", event.target.value)}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={resetSample}>
              <i className="ti ti-rotate" aria-hidden="true" style={{ marginRight: 4 }}></i>
              샘플
            </button>
            <button type="button" className={styles.primaryButton} onClick={runAnalysis}>
              <i className="ti ti-sparkles" aria-hidden="true" style={{ marginRight: 4 }}></i>
              분석하기
            </button>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <i className="ti ti-report-analytics" aria-hidden="true"></i>
              분석 결과
            </h2>
            <span className={styles.smallText}>확정 채점이 아닌 피드백</span>
          </div>

          {analysis ? (
            <>
              <div className={styles.resultHero}>
                <div className={styles.riskBox}>
                  <span className={styles.riskLabel}>감점 가능성</span>
                  <span className={styles.riskValue}>{analysis.risk}</span>
                </div>
                <div className={styles.summaryBox}>
                  <p className={styles.summaryKicker}>문제 요구 · {analysis.promptDemand}</p>
                  <p className={styles.summaryText}>{analysis.strength}</p>
                </div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <i className="ti ti-list-check" aria-hidden="true"></i>
                  평가 기준
                </h3>
                <div className={styles.criteriaList}>
                  {analysis.criteria.map((criterion) => (
                    <div className={styles.criterion} key={criterion.key}>
                      <div className={styles.criterionTop}>
                        <p className={styles.criterionTitle}>{criterion.title}</p>
                        <span className={`${styles.status} ${styles[criterion.status]}`}>
                          <i className={`ti ${statusIcon(criterion.status)}`} aria-hidden="true"></i>
                          {statusLabel(criterion.status)}
                        </span>
                      </div>
                      <p className={styles.criterionReason}>{criterion.reason}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <i className="ti ti-tags" aria-hidden="true"></i>
                  사고 패턴
                </h3>
                <div className={styles.tagList}>
                  {analysis.patternTags.length ? (
                    analysis.patternTags.map((tag) => (
                      <span className={styles.tag} key={tag} title={PATTERN_META[tag].desc}>
                        <i className="ti ti-point-filled" aria-hidden="true"></i>
                        {PATTERN_META[tag].title}
                      </span>
                    ))
                  ) : (
                    <span className={styles.smallText}>반복 오류 태그가 뚜렷하지 않습니다.</span>
                  )}
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <i className="ti ti-alert-circle" aria-hidden="true"></i>
                  감점 가능 요인
                </h3>
                <ul className={styles.reasonList}>
                  {analysis.deductionReasons.map((reason) => (
                    <li className={styles.reasonItem} key={reason}>
                      <i className={`ti ti-arrow-narrow-right ${styles.reasonIcon}`} aria-hidden="true"></i>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <i className="ti ti-brain" aria-hidden="true"></i>
                  빠진 사고 단계
                </h3>
                <div className={styles.thinkingBox}>{analysis.missingThinkingStep}</div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <i className="ti ti-writing" aria-hidden="true"></i>
                  다시 쓴 답안
                </h3>
                <div className={styles.rewriteBox}>{analysis.rewrittenAnswer}</div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <i className="ti ti-help-circle" aria-hidden="true"></i>
                  다음 답안 체크
                </h3>
                <ul className={styles.checkList}>
                  {analysis.nextQuestions.map((question) => (
                    <li className={styles.checkItem} key={question}>
                      <i className="ti ti-check" aria-hidden="true"></i>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <div className={styles.emptyResult}>분석 결과가 이곳에 표시됩니다.</div>
          )}
        </section>
      </div>
    </main>
  );
}
