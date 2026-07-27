// 비열(sci_37) 학습 콘텐츠 — 시범 통합.
// 재료 출처: 딱이지 한자게임(app/HanjaGame.tsx)의 `sci_biyeol`(한자분해·쉬운뜻·예시·퀴즈)을
// 5단계 콘텐츠 모듈 형식으로 옮김. 한자게임의 인지오류 태그는 5단계 6종 태그로 변환:
//   cause_effect_reversal → ③구조 / overgeneralization → ①범주 / (온도·열량 혼동) → ⑤혼동.

import { ERROR_TAGS } from "../types";
import type { ConceptContent } from "./sci_03";

const biyeol: ConceptContent = {
  conceptId: "sci_37",

  feel: {
    scene: [
      "여름 한낮, 해변의 모래는 발을 못 댈 만큼 뜨거운데 바로 옆 바닷물은 시원해요.",
      "같은 햇빛을 똑같이 받았는데, 왜 모래와 물의 온도는 이렇게 다를까요?",
      "물은 데우기도, 식히기도 어려운 성질이 있어요. 그 '데우기 어려운 정도'의 이름이 비열이에요.",
    ],
    hook: "물은 좀처럼 뜨거워지지도, 식지도 않는다.",
  },

  concept: {
    hanja: [
      { char: "比", mean: "견줄 비", note: "다른 물질과 견주어 비교함" },
      { char: "熱", mean: "더울 열", note: "열(뜨거움)" },
    ],
    combined: "다른 물질과 견주어 본, 데우는 데 드는 열의 정도",
    definition:
      "비열은 어떤 물질 1kg의 온도를 1℃ 높이는 데 필요한 열량으로, 물질마다 다른 고유한 특성이다.",
    coreList: [
      "1kg을 1℃ 올리는 데 드는 열량",
      "물질마다 값이 다름",
      "클수록 온도가 천천히 변함(물이 큼)",
    ],
    warning:
      "비열은 '온도'가 아니라 물질의 '특성'이에요. 비열이 크다 = 지금 뜨겁다(✕). '데우기 어렵다'는 뜻이에요.",
  },

  quiz: [
    {
      id: "sci_37_q1",
      concept_id: "sci_37",
      type: "정의형",
      prompt: "비열을 가장 잘 설명한 것은?",
      options: [
        { text: "물질 1kg의 온도를 1℃ 높이는 데 필요한 열량", is_correct: true, tag: null },
        { text: "물질이 지금 얼마나 뜨거운지 나타내는 값", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "물체가 가지고 있는 열의 전체 양", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "물질이 그냥 데워지는 빠르기 자체", is_correct: false, tag: ERROR_TAGS.CORE },
      ],
    },
    {
      id: "sci_37_q2",
      concept_id: "sci_37",
      type: "적용형",
      prompt: "여름 해변에서 모래는 뜨겁고 바닷물은 시원한 이유는?",
      options: [
        { text: "물의 비열이 모래보다 커서 천천히 데워지기 때문", is_correct: true, tag: null },
        { text: "물의 비열이 작아서 빨리 식기 때문", is_correct: false, tag: ERROR_TAGS.STRUCTURE },
        { text: "모래가 물보다 무거워서", is_correct: false, tag: ERROR_TAGS.CATEGORY },
      ],
    },
    {
      id: "sci_37_q3",
      concept_id: "sci_37",
      type: "변별형",
      prompt: "비열이 큰 물질의 특징으로 옳은 것은?",
      options: [
        { text: "온도가 천천히 변한다", is_correct: true, tag: null },
        { text: "온도가 빨리 변한다", is_correct: false, tag: ERROR_TAGS.STRUCTURE },
        { text: "온도가 절대 변하지 않는다", is_correct: false, tag: ERROR_TAGS.CATEGORY },
      ],
    },
  ],

  bigPicture: {
    flow: [
      { when: "비열 큼 (예: 물)", then: "같은 열을 줘도 온도가 조금 오름 → 천천히 데워지고 천천히 식음" },
      { when: "비열 작음 (예: 모래·금속)", then: "같은 열에 온도가 많이 오름 → 빨리 데워지고 빨리 식음" },
    ],
    compare: [
      { label: "비열", what: "데우기 어려운 정도(물질의 특성)", oneLiner: "천천히 변함(물 큼)" },
      { label: "온도", what: "지금 얼마나 뜨거운지", oneLiner: "현재 상태" },
      { label: "열량", what: "주고받은 열의 양", oneLiner: "오간 열" },
    ],
    why:
      "바닷가 기온이 하루 종일 완만한 것도, 자동차 냉각수·찜질팩에 물을 쓰는 것도 물의 비열이 크기 때문이에요.",
    useCases: [
      "자동차 냉각수·보일러에 물을 쓴다(열을 많이 품음)",
      "찜질팩·손난로가 오래 따뜻하다",
      "바닷가는 낮·밤 기온 차가 작다",
    ],
    extend: "고등 물리·화학의 '비열용량·열용량', 열량 계산 Q=cmΔt로 이어져요.",
  },

  explain: {
    prompt: "비열이 무엇인지, 물과 모래의 예를 들어 설명해보세요.",
    closeWord: { sentence: "비열은 물질의 ___이다.", answer: "특성" },
    slots: [
      { label: "[무엇을] 물질 1kg의 온도를 ___ 올리는", hint: "몇 도", answer: "1℃" },
      { label: "[무엇이] 필요한 ___", hint: "열의 양", answer: "열량" },
      { label: "[특징] 비열이 크면 온도가 ___ 변함", hint: "빠르게? 느리게?", answer: "천천히" },
    ],
    hanjaHint: "比(견줄) + 熱(더울) → “다른 물질과 견준 데우기의 정도”",
    coreKeywords: ["1℃", "열량", "물질마다", "천천히"],
  },

  prereq: [
    { ask: "물질에 열을 주면 무엇이 변하나요?", expect: "온도(그리고 입자 운동)", ifStuck: "온도 개념부터: 온도는 입자 운동이 얼마나 활발한가예요." },
    { ask: "열을 주면 입자는 어떻게 되나요?", expect: "운동이 빨라진다", ifStuck: "열 = 입자 운동을 키우는 에너지." },
    { ask: "같은 열을 줘도 물질마다 온도가 똑같이 오르나요?", expect: "아니요, 다르게 오른다", ifStuck: "★여기가 핵심: 다르니까 '비교(比)'가 필요 → 비열이 태어납니다." },
  ],

  visual: {
    kind: "화살표사슬",
    image: "/concept-images/vt-biyeol.svg",
    caption: "비열 큼(물) → 온도 천천히 변함 / 비열 작음(모래) → 온도 빨리 변함",
    nodes: ["같은 열을 줌", "비열 크면 → 조금 오름(천천히)", "비열 작으면 → 많이 오름(빨리)"],
  },

  fourmat: {
    why: "해변 모래는 뜨겁고 바닷물은 시원하다 — 왜?",
    what: "比(견줄)+熱(더울): 1kg을 1℃ 올리는 데 드는 열량, 물질의 고유 특성.",
    how: "'모래가 빨리 뜨거워지는 이유?' 변별 객관식으로 온도·열량과 구분.",
    iff: "비열↔온도↔열량 비교표, 냉각수·찜질팩에 왜 물을 쓰나로 확장.",
  },
};

export default biyeol;
