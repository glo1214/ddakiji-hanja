import { getConceptsBySet } from "../concepts";
import type { Concept } from "../types";
import type {
  LearningRoute,
  SetCompare,
  StrategyBlock,
  WordFormation,
} from "./sci_03";

export function routeFromStrategies(concept: Concept): LearningRoute {
  if (concept.structureStrategy === "한자 짜임") return "조합형";
  if (concept.structureStrategy === "논리 사슬") return "과정인과형";
  if (concept.structureStrategy === "짝대조(대립)") return "의미확장형";
  if (concept.structureStrategy === "정의·논리") return "정밀화형";
  return "정의이미지형";
}

export function buildStrategyBlock(concept: Concept): StrategyBlock {
  return {
    route: routeFromStrategies(concept),
    structure: concept.structureStrategy || "정의·논리",
    connection: concept.connectionStrategy || "이미지·경험",
  };
}

export function buildWordFormation(concept: Concept): WordFormation | undefined {
  if (concept.hanja.length === 0) return undefined;

  const parts = concept.hanja.map((h) => ({
    text: h.char,
    meaning: h.mean,
  }));

  return {
    parts,
    formula: `${parts.map((p) => p.text).join(" + ")} = ${concept.name}`,
    readingCue: "글자 뜻을 먼저 읽고, 마지막에는 무엇의 개념인지 한 문장으로 닫기",
  };
}

export function buildSetCompare(concept: Concept): SetCompare | undefined {
  if (concept.kind !== "세트" || !concept.setName) return undefined;

  const items = getConceptsBySet(concept.setName).map((item) => ({
    conceptId: item.id,
    name: item.name,
    keyPoint:
      item.id === concept.id
        ? "지금 배우는 개념"
        : item.structureStrategy || item.connectionStrategy || undefined,
  }));

  return {
    setName: concept.setName,
    focusId: concept.id,
    items,
    summary: "같은 묶음 안에서 위치를 잡으면 비슷한 개념과 덜 헷갈려요.",
  };
}
