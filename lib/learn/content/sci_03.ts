// 관성(sci_03) 학습 콘텐츠 — 콘텐츠_관성_풀세트_v1.md 를 화면 데이터로 옮긴 것.
// 단계 산문(느낌/개념/크게보기)·객관식 문항·설명하기 비계는 시드 메타에 없는
// '학생이 보는 실물'이라 개념별 콘텐츠 모듈로 둔다(시드 1줄 → 풀세트 1개).

import { ERROR_TAGS, type QuizItem } from "../types";

export interface FeelStage {
  scene: string[]; // 상황 문단
  hook: string; // 한 줄 고리
}

export interface ConceptStage {
  hanja: { char: string; mean: string; note: string }[];
  combined: string; // 합치면 → ...
  definition: string;
  coreList: string[]; // 꼭 들어가야 할 3가지
  warning: string;
}

export interface BigPictureStage {
  flow: { when: string; then: string }[];
  compare: { label: string; what: string; oneLiner: string }[];
  why: string;
  /** If(4MAT) — 어디에 쓰나(실생활 적용). */
  useCases?: string[];
  /** If(4MAT) — 무엇으로 확장하나(상위·고등 개념 연계). */
  extend?: string;
}

export interface ExplainScaffoldSlot {
  label: string;
  hint: string;
  answer: string;
}

export interface ExplainStage {
  prompt: string;
  closeWord: { sentence: string; answer: string }; // 한 단어 닫기
  slots: ExplainScaffoldSlot[];
  hanjaHint: string;
  /** 자동 채점·태깅용 핵심 키워드(④ 충족 판정). core_elements를 화면 표현에 맞춰 단순화. */
  coreKeywords: string[];
}

// ── 전제지식 점검(prereq) — "생각이 어디서 끊기나"를 재는 질문 사슬 ──
export interface PrereqStep {
  ask: string; // 질문
  expect: string; // 기대 답
  ifStuck: string; // 막히면 되돌아갈 곳(개념·한 문장)
}

// ── 비주얼 싱킹(visual) — 단어 유형별 4종 그림 틀 ──
export type VisualKind = "한자분해" | "묶음맵" | "대칭비교" | "화살표사슬";
export interface VisualSpec {
  kind: VisualKind;
  image?: string; // /concept-images/xxx.png 재사용 시
  caption: string; // 도식 한 줄 설명
  nodes?: string[]; // 사슬·묶음 노드(텍스트 폴백)
  /** 한자분해 전용: 글자 뜻이 '무엇이 그러한가'까지 연결되는 칸 */
  essence?: string;
}

// ── v2 이해 2축·학습 경로 렌더용 선택 스키마 ──
export type LearningRoute =
  | "조합형"
  | "정밀화형"
  | "과정인과형"
  | "의미확장형"
  | "정의이미지형";

export interface StrategyBlock {
  route?: LearningRoute;
  structure: string;
  connection: string;
  misconception?: string;
}

export interface WordFormationPart {
  text: string;
  meaning: string;
  relatedWords?: string[];
}

export interface WordFormation {
  parts: WordFormationPart[];
  formula?: string;
  readingCue?: string;
}

export interface DefinitionImageCard {
  image?: string;
  alt?: string;
  dictionaryDefinition: string;
  imageCaption?: string;
  example?: string;
}

export interface ScreenFeel {
  comicSituation: string;
  question: string;
  image?: string;
}

export interface OxCheckItem {
  statement: string;
  answer: boolean;
  feedback: string;
}

export interface HanjaMatchItem {
  char: string;
  meaning: string;
  relatedWords: string[];
  note?: string;
}

export interface DefinitionScreen {
  dictionary: string;
  easy: string;
}

export interface VisualThinkingScreen {
  image?: string;
  description: string;
  label: string;
  avoid: string;
}

export interface ScreenContent {
  feel?: ScreenFeel;
  ox?: OxCheckItem[];
  hanjaMatches?: HanjaMatchItem[];
  definition?: DefinitionScreen;
  visualThinking?: VisualThinkingScreen;
  explainHints?: string[];
}

export interface SetCompareItem {
  conceptId?: string;
  name: string;
  role?: string;
  keyPoint?: string;
  contrast?: string;
}

export interface SetCompare {
  setName: string;
  focusId?: string;
  items: SetCompareItem[];
  summary?: string;
}

// ── 4MAT 한 바퀴 요약(Why/What/How/If) ──
export interface FourMat {
  why: string;
  what: string;
  how: string;
  iff: string; // if는 예약어 → iff
}

export interface ConceptContent {
  conceptId: string;
  feel: FeelStage;
  concept: ConceptStage;
  quiz: QuizItem[];
  bigPicture: BigPictureStage;
  explain: ExplainStage;
  // ↓ 선택 필드(기존 화면 안 깨짐). v2에서 추가.
  prereq?: PrereqStep[];
  visual?: VisualSpec;
  fourmat?: FourMat;
  strategy?: StrategyBlock;
  wordFormation?: WordFormation;
  definitionImage?: DefinitionImageCard;
  setCompare?: SetCompare;
  /** Demo-first screen copy: one markdown ### maps to one learner-facing screen. */
  screenContent?: ScreenContent;
}

const inertia: ConceptContent = {
  conceptId: "sci_03",

  feel: {
    scene: [
      "버스가 갑자기 출발하면 몸이 뒤로 휙 쏠리고, 급정거하면 앞으로 쏠려요.",
      "분명 나는 가만히 있었는데, 왜 몸이 마음대로 움직였을까요?",
      "달리다가 멈추려 해도 두세 걸음 더 나가는 것도, 안전벨트가 꼭 필요한 것도 — 전부 같은 이유 하나로 설명돼요. 그 이유의 이름이 관성이에요.",
    ],
    hook: "내 몸은 원래 하던 대로 계속하려고 한다.",
  },

  concept: {
    hanja: [
      { char: "慣", mean: "익숙할 관", note: "늘 하던 대로, 익숙한 상태" },
      { char: "性", mean: "성질 성", note: "성질" },
    ],
    combined: "늘 하던 운동 상태를 유지하려는 성질",
    definition:
      "관성은 외부에서 힘이 작용하지 않으면, 물체가 원래의 운동 상태를 계속 유지하려는 성질이다.",
    coreList: [
      "운동 상태를 유지하려 함",
      "외부 힘이 없을 때",
      "정지도, 등속(같은 빠르기)도 둘 다 해당",
    ],
    warning: "관성은 힘이 아니라 성질이에요. “관성이라는 힘이 민다” → 틀린 말.",
  },

  quiz: [
    {
      id: "sci_03_q1",
      concept_id: "sci_03",
      type: "정의형",
      prompt: "관성을 가장 잘 설명한 것은?",
      options: [
        { text: "외부 힘이 없을 때 물체가 운동 상태를 유지하려는 성질", is_correct: true, tag: null },
        { text: "물체를 움직이게 하는 힘", is_correct: false, tag: ERROR_TAGS.CATEGORY },
        { text: "속도가 점점 빨라지는 현상", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "정지한 물체만 계속 멈춰 있으려는 성질", is_correct: false, tag: ERROR_TAGS.CORE },
      ],
    },
    {
      id: "sci_03_q2",
      concept_id: "sci_03",
      type: "적용형",
      prompt: "버스가 급정거할 때 승객이 앞으로 쏠리는 이유는?",
      options: [
        { text: "승객의 몸이 원래 가던 운동을 계속 유지하려 해서", is_correct: true, tag: null },
        { text: "버스가 승객을 앞으로 미는 힘 때문에", is_correct: false, tag: ERROR_TAGS.CATEGORY },
        { text: "승객의 속도가 갑자기 빨라져서", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "중력이 앞으로 당겨서", is_correct: false, tag: ERROR_TAGS.CONFUSION },
      ],
    },
    {
      id: "sci_03_q3",
      concept_id: "sci_03",
      type: "변별형",
      prompt: "다음 중 관성 때문에 생기는 일이 아닌 것은?",
      options: [
        { text: "달리던 사람이 멈춰도 몇 걸음 더 나간다", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "컵 밑 종이를 빠르게 빼면 컵은 그대로 있다", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "자석이 클립을 끌어당긴다 (이건 자기력)", is_correct: true, tag: null },
      ],
    },
  ],

  bigPicture: {
    flow: [
      { when: "외부 힘 없음", then: "운동 상태 그대로 (정지→계속 정지 / 등속→계속 등속)" },
      { when: "외부 힘 있음", then: "운동 상태 변함 (빨라짐·느려짐·방향 바뀜)" },
    ],
    compare: [
      { label: "관성", what: "상태를 유지하려는 성질", oneLiner: "그대로 있으려 함" },
      { label: "힘", what: "상태를 변화시키는 원인", oneLiner: "바꾸는 것" },
      { label: "가속도", what: "상태가 변하는 정도", oneLiner: "얼마나 바뀌나" },
    ],
    why:
      "안전벨트·에어백은 관성 때문에 필요해요. 차가 멈춰도 몸은 계속 앞으로 가려 하니까, 그 몸을 잡아주는 장치죠.",
  },

  explain: {
    prompt: "관성이 무엇인지, 버스 예를 들어 설명해보세요.",
    closeWord: { sentence: "관성은 ___이다.", answer: "성질" },
    slots: [
      { label: "[언제] 외부 힘이 ___ 때", hint: "외부 힘이", answer: "없을" },
      { label: "[무엇이] ___가", hint: "주어", answer: "물체" },
      { label: "[어떻게] 운동 상태를 ___", hint: "그대로", answer: "유지" },
      { label: "[둘 다] ___와(과) 등속", hint: "멈춤", answer: "정지" },
    ],
    hanjaHint: "慣(익숙할) + 性(성질) → “늘 하던 상태를 유지하는 성질”",
    coreKeywords: ["유지", "외부 힘", "정지", "등속"],
  },
};

export default inertia;

// 개념별 콘텐츠 레지스트리 (다음 개념도 여기에 등록)
export const CONTENT_BY_CONCEPT: Record<string, ConceptContent> = {
  sci_03: inertia,
};

export function getContent(conceptId: string): ConceptContent | undefined {
  return CONTENT_BY_CONCEPT[conceptId];
}
