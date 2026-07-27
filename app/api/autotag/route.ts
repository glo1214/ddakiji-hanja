// 설명하기(주관식) 자동 태깅 — LLM 최종 판정 (README §5 하이브리드).
// 규칙층(lib/learn/autotag)을 먼저 돌려 '힌트'로 동봉하고, LLM이 6개 태그를
// 복수로 + 근거 한 줄과 함께 최종 판정한다. 키가 없거나 실패하면 호출부가
// 규칙층으로 폴백한다(lib/learn/autotagLLM).
//
// 보안: OPENAI_API_KEY 는 서버 전용(절대 NEXT_PUBLIC_ 아님). 이 라우트는
// 서버(Node)에서만 실행되어 키가 클라이언트 번들에 노출되지 않는다.

import OpenAI from "openai";
import { getConcept } from "@/lib/learn/concepts";
import { autoTag } from "@/lib/learn/autotag";
import { ALL_ERROR_TAGS } from "@/lib/learn/types";

export const runtime = "nodejs";

const TAG_DEFINITIONS = `오류 태그(6분류) — 해당하는 것을 복수로 고른다:
- ①범주: 정확한 갈래(범주) 대신 상위어로 답함 (예: 정답은 '성질'인데 '힘/운동/에너지'라고 함)
- ②용어: 핵심 용어(닫는명사)를 못 꺼내고 '것/거'로 얼버무림 (멈칫·수정 동반)
- ③구조: 요소는 있으나 순서·인과·연결(그래서·때문에)이 깨짐
- ④핵심: 꼭 들어가야 할 핵심요소가 빠짐
- ⑤혼동: 짝개념과 섞거나 잘못 연결 (성질을 힘/가속도로 단정 등)
- ⑥표현: 구어체·부정확한 표현 (뜻은 대략 맞으나 정의문 형식이 아님)`;

const SYSTEM = `너는 중등 개념어 학습 앱의 채점 보조다. 학생이 직접 쓴 '설명하기' 답안을 읽고,
아래 6개 오류 태그 중 해당하는 것을 복수로 고르고 각 태그의 근거를 한 줄로 댄다.
규칙 기반 사전분석을 '힌트'로 주지만, 최종 판정은 네가 한다(힌트가 틀릴 수 있다).
오직 JSON만 출력한다. 설명·마크다운·코드펜스 금지.

${TAG_DEFINITIONS}

출력 형식(JSON):
{"tags": ["①범주", ...], "reasons": ["근거 한 줄", ...], "result": "explained" | "failed"}
- tags: 위 6개 중에서만. 없으면 빈 배열.
- result: 정확주어·핵심요소가 충분하고 범주(①)·혼동(⑤) 오류가 없으면 "explained", 그 외 "failed".`;

function buildUserPrompt(
  concept: NonNullable<ReturnType<typeof getConcept>>,
  answerText: string,
  hints: ReturnType<typeof autoTag>
) {
  return `[개념 정답 메타]
- 개념: ${concept.name} (${concept.subject})
- 정확주어(①기준): ${concept.correct_subject}
- 흔한상위어(① 감지): ${concept.over_general.join(", ")}
- 닫는명사(② 감지): ${concept.closing_noun}
- 핵심요소(④ 체크리스트): ${concept.core_elements.join(", ")}
- 짝개념(⑤ 감지): ${concept.confusable.join(", ")}

[규칙 기반 힌트] (참고용, 최종 판정 아님)
- 후보 태그: ${hints.tags.join(", ") || "없음"}
- 근거: ${hints.reasons.join(" / ") || "없음"}
- 핵심요소 충족: ${hints.coreMatched}개

[학생 답안]
"${answerText}"

위 답안을 판정해 JSON으로만 출력하라.`;
}

interface TagResult {
  tags: string[];
  reasons: string[];
  result: "explained" | "failed";
}

function parseAndValidate(text: string): TagResult | null {
  // 코드펜스/잡텍스트가 섞여도 첫 JSON 오브젝트만 추출
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(match[0]);
  } catch {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const tags = Array.isArray(o.tags)
    ? (o.tags as unknown[]).filter((t): t is string => typeof t === "string" && ALL_ERROR_TAGS.includes(t as never))
    : [];
  const reasons = Array.isArray(o.reasons)
    ? (o.reasons as unknown[]).filter((r): r is string => typeof r === "string")
    : [];
  const result = o.result === "explained" ? "explained" : "failed";
  return { tags, reasons, result };
}

export async function POST(req: Request) {
  let body: { answerText?: string; hesitationCount?: number; conceptId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const { answerText, hesitationCount = 0, conceptId } = body;
  const concept = conceptId ? getConcept(conceptId) : undefined;
  if (!answerText || !concept) {
    return Response.json({ error: "missing answerText or concept" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // 키 미설정 → 호출부가 규칙층으로 폴백하도록 신호
    return Response.json({ error: "no_api_key" }, { status: 503 });
  }

  const hints = autoTag({ answerText, hesitationCount, concept });
  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      // gpt-5 계열은 reasoning 토큰도 이 한도에 포함되므로 여유 있게 잡는다
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(concept, answerText, hints) },
      ],
    });
    const text = completion.choices[0]?.message?.content ?? "";
    const parsed = parseAndValidate(text);
    if (!parsed) {
      return Response.json({ error: "unparseable", hints }, { status: 502 });
    }
    return Response.json({ ...parsed, source: "llm" });
  } catch (e) {
    console.error("[autotag] LLM 호출 실패:", e);
    return Response.json({ error: "llm_failed" }, { status: 502 });
  }
}
