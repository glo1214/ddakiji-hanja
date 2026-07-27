// 희소성(soc_35) 학습 콘텐츠 — 4MAT·비주얼싱킹·전제점검 반영 v2.
// 정답 기준(메타): 정확주어=상태(자원의) · 닫는명사=상태
//   · 핵심요소=[욕구는 무한, 자원은 유한, 욕구 대비 부족(상대적), 선택 필요]
//   · 짝개념=부족·기회비용 · 한자=稀(드물)·少(적을)·性(성질)

import { ERROR_TAGS } from "../types";
import type { ConceptContent } from "./sci_03";

const huisoseong: ConceptContent = {
  conceptId: "soc_35",

  feel: {
    scene: [
      "용돈 5천 원으로 사고 싶은 건 떡볶이, 아이스크림, 문구… 한가득이에요.",
      "그런데 돈은 5천 원뿐. 하나를 고르면 다른 건 포기해야 해요.",
      "가지고 싶은 건 많은데 가진 것은 적은 이 상태 — 이름이 희소성이에요.",
    ],
    hook: "원하는 건 끝이 없는데, 그걸 채울 자원은 늘 모자란다.",
  },

  concept: {
    hanja: [
      { char: "稀", mean: "드물 희", note: "드묾 (희귀·희박에 든 그 '희')" },
      { char: "少", mean: "적을 소", note: "적음 (소수·감소에 든 그 '소')" },
      { char: "性", mean: "성질 성", note: "그러한 성질·상태" },
    ],
    combined: "드물고 적은 상태 — 단, '무엇에 비해' 적은가가 핵심",
    definition:
      "희소성은 인간의 욕구는 무한한데 그것을 채울 자원은 한정되어 있어, 욕구에 비해 자원이 부족한 상태이다.",
    coreList: [
      "인간의 욕구는 무한",
      "자원은 유한(한정)",
      "욕구에 비해 부족 → 그래서 선택이 필요",
    ],
    warning:
      "희소성은 '양이 절대적으로 적음'이 아니에요. 흔해도 원하는 사람이 더 많으면 희소, 적어도 아무도 안 원하면 희소하지 않음. → 언제나 '욕구 대비 상대적'.",
  },

  quiz: [
    {
      id: "soc_35_q1",
      concept_id: "soc_35",
      type: "정의형",
      prompt: "희소성을 가장 잘 설명한 것은?",
      options: [
        { text: "욕구에 비해 자원이 부족한 상태", is_correct: true, tag: null },
        { text: "물건의 양이 절대적으로 적은 것", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "값이 비싼 것", is_correct: false, tag: ERROR_TAGS.CATEGORY },
        { text: "사람들이 많이 사는 인기 상품", is_correct: false, tag: ERROR_TAGS.CATEGORY },
      ],
    },
    {
      id: "soc_35_q2",
      concept_id: "soc_35",
      type: "적용형",
      prompt: "사막 한가운데의 물과 도시의 물, 어느 쪽이 더 희소할까?",
      options: [
        { text: "사막의 물 — 원하는 정도에 비해 양이 크게 부족하니까", is_correct: true, tag: null },
        { text: "도시의 물 — 사람이 더 많으니까", is_correct: false, tag: ERROR_TAGS.STRUCTURE },
        { text: "둘 다 같다 — 물의 양이 정해져 있으니까", is_correct: false, tag: ERROR_TAGS.CONFUSION },
      ],
    },
    {
      id: "soc_35_q3",
      concept_id: "soc_35",
      type: "변별형",
      prompt: "희소성 때문에 반드시 따라오는 것은?",
      options: [
        { text: "선택 — 다 가질 수 없으니 골라야 한다", is_correct: true, tag: null },
        { text: "가격 하락", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        { text: "자원이 저절로 늘어남", is_correct: false, tag: ERROR_TAGS.CATEGORY },
      ],
    },
  ],

  bigPicture: {
    flow: [
      { when: "욕구(무한) > 자원(유한)", then: "희소성 발생 → 선택 필요 → 선택하면 기회비용 발생" },
      { when: "무엇을 선택할까", then: "포기한 것 중 가장 큰 가치 = 기회비용" },
    ],
    compare: [
      { label: "희소성", what: "욕구 대비 자원이 부족한 상태", oneLiner: "상대적(욕구에 비해)" },
      { label: "부족(절대량)", what: "그냥 양이 적음", oneLiner: "욕구와 무관 (희소성 아님)" },
      { label: "기회비용", what: "선택 때문에 포기한 가치", oneLiner: "희소성의 결과" },
    ],
    why:
      "모든 경제 문제의 출발점이 희소성이에요. 자원이 무한하다면 선택도, 기회비용도, 경제학도 필요 없어요.",
  },

  explain: {
    prompt: "희소성이 무엇인지, 용돈이나 사막의 물을 예로 '욕구'와 '자원'을 넣어 설명해보세요.",
    closeWord: { sentence: "희소성은 욕구에 비해 자원이 부족한 ___이다.", answer: "상태" },
    slots: [
      { label: "[무엇이] 인간의 욕구는 ___", hint: "무한? 유한?", answer: "무한" },
      { label: "[무엇이] 자원은 ___", hint: "무한? 유한?", answer: "유한" },
      { label: "[그래서] 부족하니 ___이 필요", hint: "무엇을 해야 하나", answer: "선택" },
    ],
    hanjaHint: "稀(드물) + 少(적을) → 단, '무엇에 비해' 적은가 = 욕구에 비해.",
    coreKeywords: ["욕구", "무한", "자원", "유한", "선택"],
  },

  prereq: [
    { ask: "사람이 가지고 싶은 것(욕구)에는 끝이 있나요?", expect: "없다(무한에 가깝다)", ifStuck: "하나 채우면 또 생기는 게 욕구예요." },
    { ask: "쓸 수 있는 돈·시간·자원은 끝이 있나요?", expect: "있다(한정)", ifStuck: "자원은 늘 한정되어 있어요." },
    { ask: "둘을 나란히 두면 어느 쪽이 더 큰가요?", expect: "욕구 > 자원", ifStuck: "★여기가 핵심: 욕구가 더 크니 '부족'이 생겨요 = 희소성." },
  ],

  visual: {
    kind: "화살표사슬",
    caption: "욕구(무한) > 자원(유한) → 희소성 → 선택 → 기회비용, 한 줄로 이어지는 사슬",
    nodes: ["욕구 무한", "자원 유한", "→ 희소성(상대적 부족)", "→ 선택", "→ 기회비용"],
    essence: "'적을 少' — 무엇에 비해 적나? 욕구에 비해. (절대량이 아니라 관계)",
  },

  fourmat: {
    why: "5천 원으로 사고 싶은 건 한가득 — 왜 다 못 사지?",
    what: "稀(드물)+少(적을): 욕구는 무한, 자원은 유한 → 욕구 대비 부족한 상태.",
    how: "'사막 물 vs 도시 물, 어디가 더 희소?' 적용 문제로 상대성 확인.",
    iff: "희소성→선택→기회비용 사슬로 확장, 고1 통합사회·경제로 연결.",
  },
};

export default huisoseong;
