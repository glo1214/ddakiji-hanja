// 응고(sci_22) 학습 콘텐츠 — 4MAT·비주얼싱킹·전제점검 반영 v2.
// 정답 기준(메타): 정확주어=상태 변화(액체→고체) · 닫는명사=변화(현상)
//   · 핵심요소=[액체→고체, 열 방출, 어는점, 물→얼음] · 짝개념=융해 · 한자=凝(엉길)·固(굳을)

import { ERROR_TAGS } from "../types";
import type { ConceptContent } from "./sci_03";

const eunggo: ConceptContent = {
  conceptId: "sci_22",

  feel: {
    scene: [
      "냉동실에 넣어둔 물이 다음 날 딱딱한 얼음이 되어 있어요.",
      "촛농이 흘러내리다 굳고, 뜨거운 엿물이 식으며 단단한 엿이 돼요.",
      "액체가 굳어 고체가 되는 이 변화 — 이름이 응고예요.",
    ],
    hook: "자유롭게 흐르던 액체가 식으면서 제자리에 굳는다.",
  },

  concept: {
    hanja: [
      { char: "凝", mean: "엉길 응", note: "엉기다: 흩어져 움직이던 것이 서로 달라붙어 한 덩어리로 뭉침" },
      { char: "固", mean: "굳을 고", note: "굳음 (고체·고집·고정에도 든 그 '고')" },
    ],
    combined: "엉겨서 굳음 → 액체가 굳어 고체가 되는 것",
    definition:
      "응고는 액체가 열을 잃어(어는점에서) 고체로 상태가 변하는 현상이다.",
    coreList: [
      "액체 → 고체",
      "열을 방출함(내보냄)",
      "어는점에서 일어남 (예: 물 0℃)",
    ],
    warning:
      "'무엇이' 굳는 걸까요? 물질이 사라지는 게 아니라 입자의 배열이 규칙적으로 굳는 거예요. 응고 ↔ 융해(반대), 응결(기체→액체)과는 다릅니다.",
  },

  quiz: [
    {
      id: "sci_22_q1",
      concept_id: "sci_22",
      type: "정의형",
      prompt: "응고를 가장 잘 설명한 것은?",
      options: [
        { text: "액체가 열을 잃고 고체로 변하는 현상", is_correct: true, tag: null },
        { text: "고체가 녹아 액체로 변하는 현상", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "기체가 액체로 맺히는 현상", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "그냥 물질이 차가워지는 것", is_correct: false, tag: ERROR_TAGS.CORE },
      ],
    },
    {
      id: "sci_22_q2",
      concept_id: "sci_22",
      type: "변별형",
      prompt: "다음 중 응고가 아닌 것은?",
      options: [
        { text: "물이 얼어 얼음이 된다", is_correct: false, tag: null },
        { text: "촛농이 흘러내리다 굳는다", is_correct: false, tag: null },
        { text: "얼음이 녹아 물이 된다 (정답: 이건 융해)", is_correct: true, tag: ERROR_TAGS.CONFUSION },
      ],
    },
    {
      id: "sci_22_q3",
      concept_id: "sci_22",
      type: "적용형",
      prompt: "응고할 때 입자와 열은 어떻게 되나?",
      options: [
        { text: "열을 내보내고, 입자 배열이 규칙적으로 굳는다", is_correct: true, tag: null },
        { text: "열을 흡수하고, 입자가 자유롭게 흩어진다", is_correct: false, tag: ERROR_TAGS.STRUCTURE },
        { text: "입자 자체가 사라진다", is_correct: false, tag: ERROR_TAGS.CATEGORY },
      ],
    },
  ],

  bigPicture: {
    flow: [
      { when: "액체가 열을 잃음(식음)", then: "입자 운동이 느려짐 → 제자리에 규칙적으로 배열 → 고체(응고)" },
      { when: "고체가 열을 얻음(데워짐)", then: "입자 운동이 활발 → 배열이 풀림 → 액체(융해)" },
    ],
    compare: [
      { label: "응고", what: "액체 → 고체 (열 방출)", oneLiner: "굳음" },
      { label: "융해", what: "고체 → 액체 (열 흡수)", oneLiner: "녹음 (응고의 반대)" },
      { label: "응결", what: "기체 → 액체", oneLiner: "맺힘 (응고 아님, 헷갈림 주의)" },
    ],
    why:
      "응고에서 변하는 건 '무엇'이 아니라 '어떻게 배열됐나'예요. 물질의 양은 그대로, 입자의 자리만 자유→고정으로 바뀝니다.",
  },

  explain: {
    prompt: "응고가 무엇인지, 물→얼음을 예로 입자와 열까지 설명해보세요.",
    closeWord: { sentence: "응고는 액체가 고체로 변하는 ___이다.", answer: "현상" },
    slots: [
      { label: "[무엇이] ___가", hint: "어떤 상태", answer: "액체" },
      { label: "[열] 열을 ___", hint: "얻나 잃나", answer: "잃고(방출)" },
      { label: "[무엇으로] ___가 된다", hint: "어떤 상태", answer: "고체" },
    ],
    hanjaHint: "凝(엉길) + 固(굳을) → “엉겨서 굳음”. 굳는 건 입자의 배열.",
    coreKeywords: ["액체", "고체", "열 방출", "어는점"],
  },

  prereq: [
    { ask: "물질은 무엇으로 이루어져 있나요?", expect: "아주 작은 입자", ifStuck: "모든 물질은 눈에 안 보이는 입자로 되어 있어요." },
    { ask: "고체와 액체는 입자 배열이 어떻게 다른가요?", expect: "고체=규칙적·촘촘, 액체=비교적 자유", ifStuck: "고체는 제자리, 액체는 흐를 수 있게 느슨." },
    { ask: "온도가 내려가면 입자 운동은?", expect: "느려진다", ifStuck: "열을 잃으면 입자 운동이 느려져요 → 굳을 준비." },
  ],

  visual: {
    kind: "대칭비교",
    image: "/concept-images/concept-eunggo.png",
    caption: "가운데 축 기준 — 왼쪽 융해(고→액, 열 흡수) ↔ 오른쪽 응고(액→고, 열 방출)",
    nodes: ["액체(입자 자유)", "→ 열 방출·냉각 →", "고체(입자 규칙 배열)"],
    essence: "'굳을 固' — 무엇이 굳나? 입자의 위치. (고집=생각이 한 방향으로 굳음)",
  },

  fourmat: {
    why: "냉동실 물이 얼음이 됐다 — 왜 딱딱해졌지?",
    what: "凝(엉길)+固(굳을): 액체가 열을 잃고 고체가 되는 현상.",
    how: "'이건 응고? 융해?' 변별 객관식으로 짝개념과 구분.",
    iff: "융해↔응고 대칭도, 응결과 무엇이 다른지로 확장.",
  },
};

export default eunggo;
