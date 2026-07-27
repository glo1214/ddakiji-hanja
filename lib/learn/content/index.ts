// 개념별 학습 콘텐츠 레지스트리 (단일 진입점).
// 새 개념을 만들면 (1) content/<id>.ts 작성 → (2) 여기에 import·등록만 하면 앱에 붙는다.

import inertia from "./sci_03"; // 관성
import biyeol from "./sci_37"; // 비열
import eunggo from "./sci_22"; // 응고
import huisoseong from "./soc_35"; // 희소성
import { GENERATED_CONTENT_BY_CONCEPT } from "./generated";
import { DEMO_CONTENT_BY_CONCEPT } from "./demo";
import type { ConceptContent } from "./sci_03";

export type { ConceptContent } from "./sci_03";

export const CONTENT_BY_CONCEPT: Record<string, ConceptContent> = {
  ...GENERATED_CONTENT_BY_CONCEPT,
  sci_03: inertia,
  sci_37: biyeol,
  sci22_30: biyeol,
  sci_22: eunggo,
  sci22_36: eunggo,
  soc_35: huisoseong,
  ...DEMO_CONTENT_BY_CONCEPT,
};

// ── 데모 5개 비주얼싱킹 이미지(AI 생성 PNG) 주입 ──
// generated.ts를 건드리지 않고, 최종 병합된 콘텐츠에 이미지 경로만 얹는다.
// (Codex 재생성 시에도 안 깨짐. 캡션은 오개념 방지 포인트를 담음.)
const DEMO_VISUAL_IMAGES: Record<string, { image: string; caption: string }> = {
  sci22_35: {
    image: "/concept-images/demo-yunghae.png",
    caption: "고체(줄 맞춘 입자) → 열을 얻음 → 액체(느슨한 입자). 입자 수는 그대로.",
  },
  sci22_36: {
    image: "/concept-images/demo-eunggo.png",
    caption: "액체(느슨한 입자) → 열을 잃음 → 고체(줄 맞춘 입자). 입자 수는 그대로.",
  },
  sci22_39: {
    image: "/concept-images/demo-seunghwa.png",
    caption: "고체 → (액체 단계 건너뜀) → 기체. 열을 얻어 바로 기체로.",
  },
  soc1_01: {
    image: "/concept-images/demo-segyehwa.png",
    caption: "사람·상품·정보·문화가 국경을 넘어 서로 오감 (상호의존).",
  },
  soc1_02: {
    image: "/concept-images/demo-jiyeokhwa.png",
    caption: "한 지역의 고유 특색이 다른 지역과 세계로 뻗어 나감.",
  },
};

for (const [id, v] of Object.entries(DEMO_VISUAL_IMAGES)) {
  const c = CONTENT_BY_CONCEPT[id];
  if (!c) continue;
  c.visual = {
    kind: c.visual?.kind ?? "화살표사슬",
    image: v.image,
    caption: v.caption,
    nodes: c.visual?.nodes,
  };
  if (c.screenContent?.visualThinking) {
    c.screenContent.visualThinking.image = v.image;
  }
  if (c.definitionImage) {
    c.definitionImage.image = v.image;
  }
}

export function getContent(conceptId: string): ConceptContent | undefined {
  return CONTENT_BY_CONCEPT[conceptId];
}
