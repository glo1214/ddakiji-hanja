// 리포트 사고유형 분석 — 학생의 문제 풀이 기록(객관식 선택 원문·서술 답안·오류 태그)을
// 4축(구체적 기억·지식의 범주화·논리적 연결·연상)으로 질적 분석하고,
// 향후 학습 중점(개선점)과 지난 리포트 대비 변화까지 JSON으로 돌려준다.
// 키가 없거나 실패하면 4xx/5xx → 리포트 화면이 안내 문구로 처리한다.
//
// 보안: OPENAI_API_KEY 는 서버 전용(절대 NEXT_PUBLIC_ 아님). 이 라우트는
// 서버(Node)에서만 실행되어 키가 클라이언트 번들에 노출되지 않는다.

import OpenAI from "openai";

export const runtime = "nodejs";

const AXES = ["구체적 기억", "지식의 범주화", "논리적 연결", "연상"] as const;

const SYSTEM = `너는 중등 개념어 학습 앱의 학습 분석가다. 학생이 푼 문제 기록(객관식에서 고른 보기 원문,
직접 쓴 서술 답안, 오류 태그 ①범주·②용어·③구조·④핵심·⑤혼동·⑥표현)을 읽고,
아래 사고유형 4축으로 질적 분석을 한다.

사고유형 4축 (각 0~100점):
- 구체적 기억: 정의·용어·핵심 요소를 정확히 기억해 꺼내는가. (정의형 문항 정오, ②용어·④핵심 태그가 단서)
- 지식의 범주화: 개념을 올바른 갈래(범주)에 넣고 상위어·짝개념과 구분하는가. (변별형 문항, ①범주·⑤혼동 태그가 단서)
- 논리적 연결: 원인→결과, 조건→귀결을 이어서 설명하는가. (적용형 문항, ③구조 태그, 서술 답안의 인과 연결이 단서)
- 연상: 개념을 실생활 상황·예시와 연결해 떠올리는가. (적용형 문항의 상황 판단, 서술 답안의 예시 사용이 단서)

규칙:
- 반드시 기록에 실제로 있는 답안·보기를 근거로 들어라. 없는 내용을 지어내지 마라.
- 학생 본인이 읽는 리포트다. 중학생에게 말하듯 쉽고 다정하게, 가볍게. 근거는 구체적으로.
- 기록이 적은 축은 점수를 단정하지 말고 comment에 "아직 기록이 적어서 참고만"이라는 취지를 담아라.
- focus(학습 중점)는 "무엇을 어떻게 하라"가 보이는 실행 가능한 행동으로 쓴다.
- [이전 리포트]가 주어지면 그때의 약점 축이 이번 기록에서 나아졌는지 progress에 짚어라. 없으면 progress는 null.
- 오직 JSON만 출력한다. 설명·마크다운·코드펜스 금지.

출력 형식(JSON):
{"axes": {"구체적 기억": {"score": 0~100 정수, "comment": "근거 한두 문장"},
          "지식의 범주화": {"score": ..., "comment": "..."},
          "논리적 연결": {"score": ..., "comment": "..."},
          "연상": {"score": ..., "comment": "..."}},
 "pattern": "전체 사고 패턴 분석 3~5문장",
 "strengths": ["강점 1~3개"],
 "weaknesses": ["약점 1~3개"],
 "focus": ["향후 학습 중점 2~4개"],
 "progress": "이전 리포트 대비 변화 코멘트" 또는 null}`;

interface RawRecord {
  date?: unknown;
  concept?: unknown;
  kind?: unknown;
  prompt?: unknown;
  answer?: unknown;
  correct?: unknown;
  tags?: unknown;
}

interface RawTrend {
  date?: unknown;
  total?: unknown;
  correct?: unknown;
  rate?: unknown;
}

function s(v: unknown): string {
  return typeof v === "string" ? v : String(v ?? "");
}

function buildUserPrompt(records: RawRecord[], trend: RawTrend[], previous: unknown): string {
  const recordLines = records
    .map((r, i) => {
      const tags = Array.isArray(r.tags) ? r.tags.map(s).join(",") : "";
      return `${i + 1}. [${s(r.date)}·${s(r.concept)}·${s(r.kind)}] Q: ${s(r.prompt)} / 학생 답: "${s(r.answer)}" → ${r.correct ? "정답" : "오답"}${tags ? ` (태그: ${tags})` : ""}`;
    })
    .join("\n");

  const trendLines = trend
    .map((t) => `${s(t.date)}: ${s(t.correct)}/${s(t.total)}문제 정답 (${s(t.rate)}%)`)
    .join("\n");

  let prevBlock = "";
  if (previous && typeof previous === "object") {
    const p = previous as { created_at?: unknown; axes?: unknown; weaknesses?: unknown };
    const axes =
      p.axes && typeof p.axes === "object"
        ? Object.entries(p.axes as Record<string, unknown>)
            .map(([k, v]) => `${k} ${s(v)}점`)
            .join(", ")
        : "";
    const weaknesses = Array.isArray(p.weaknesses) ? p.weaknesses.map(s).join(" / ") : "";
    prevBlock = `\n\n[이전 리포트]\n- 축 점수: ${axes || "없음"}\n- 그때의 약점: ${weaknesses || "없음"}`;
  }

  return `[문제 풀이 기록] (${records.length}건, 시간순)\n${recordLines}\n\n[일별 정답률 추이]\n${trendLines || "없음"}${prevBlock}\n\n위 기록을 4축으로 분석해 JSON으로만 출력하라.`;
}

interface AxisResult {
  score: number;
  comment: string;
}

interface ReportResult {
  axes: Record<string, AxisResult>;
  pattern: string;
  strengths: string[];
  weaknesses: string[];
  focus: string[];
  progress: string | null;
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function parseAndValidate(text: string): ReportResult | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(match[0]);
  } catch {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const rawAxes = (o.axes ?? {}) as Record<string, { score?: unknown; comment?: unknown }>;
  const axes: Record<string, AxisResult> = {};
  for (const axis of AXES) {
    const a = rawAxes[axis];
    if (!a || typeof a.score !== "number") return null; // 4축이 모두 있어야 유효
    axes[axis] = {
      score: Math.max(0, Math.min(100, Math.round(a.score))),
      comment: typeof a.comment === "string" ? a.comment : "",
    };
  }
  return {
    axes,
    pattern: typeof o.pattern === "string" ? o.pattern : "",
    strengths: strArr(o.strengths),
    weaknesses: strArr(o.weaknesses),
    focus: strArr(o.focus),
    progress: typeof o.progress === "string" && o.progress.trim() ? o.progress : null,
  };
}

export async function POST(req: Request) {
  let body: { records?: unknown; trend?: unknown; previous?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const records = Array.isArray(body.records) ? (body.records as RawRecord[]).slice(-120) : [];
  const trend = Array.isArray(body.trend) ? (body.trend as RawTrend[]).slice(-30) : [];
  if (!records.length) {
    return Response.json({ error: "no_records" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "no_api_key" }, { status: 503 });
  }

  const client = new OpenAI({ apiKey });
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      // gpt-5 계열은 reasoning 토큰도 이 한도에 포함되므로 여유 있게 잡는다
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(records, trend, body.previous) },
      ],
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const parsed = parseAndValidate(text);
    if (!parsed) {
      return Response.json({ error: "unparseable" }, { status: 502 });
    }
    // progress는 '지난 리포트 대비' 전용 — 이전 리포트가 없으면 모델이 채워도 버린다
    if (!body.previous) parsed.progress = null;
    return Response.json(parsed);
  } catch (e) {
    console.error("[report] LLM 호출 실패:", e);
    return Response.json({ error: "llm_failed" }, { status: 502 });
  }
}
