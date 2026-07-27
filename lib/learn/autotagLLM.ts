// 설명하기 자동 태깅 — 하이브리드 진입점.
// /api/autotag (LLM 최종 판정)를 호출하고, 키 미설정·네트워크·파싱 실패 시
// 규칙층(autoTag)으로 폴백한다. UI는 이 함수만 부르면 된다.

import { autoTag, type AutoTagInput, type AutoTagResult } from "./autotag";

export interface HybridTagResult extends AutoTagResult {
  source: "llm" | "rule";
}

export async function autoTagHybrid(input: AutoTagInput & { conceptId: string }): Promise<HybridTagResult> {
  const rule = (): HybridTagResult => ({ ...autoTag(input), source: "rule" });

  try {
    const res = await fetch("/api/autotag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answerText: input.answerText,
        hesitationCount: input.hesitationCount,
        conceptId: input.conceptId,
      }),
    });
    if (!res.ok) return rule(); // 503(키없음)·502(LLM실패) 등 → 규칙 폴백
    const data = (await res.json()) as { tags?: string[]; reasons?: string[]; result?: string };
    if (!data.result) return rule();
    return {
      tags: (data.tags ?? []) as AutoTagResult["tags"],
      reasons: data.reasons ?? [],
      result: data.result === "explained" ? "explained" : "failed",
      coreMatched: autoTag(input).coreMatched, // 화면 표시용 보조값은 규칙층에서
      source: "llm",
    };
  } catch {
    return rule();
  }
}
