import { ERROR_TAGS } from "../types";
import type { ConceptContent, SetCompare } from "./sci_03";
import biyeol from "./sci_37";
import eunggo from "./sci_22";

const heatTransferSet: SetCompare = {
  setName: "열의 이동",
  items: [
    {
      conceptId: "sci22_27",
      name: "전도",
      role: "입자 제자리 진동이 이웃으로 전달",
      keyPoint: "주로 고체",
      contrast: "금속 숟가락 손잡이가 뜨거워짐",
    },
    {
      conceptId: "sci22_28",
      name: "대류",
      role: "데워진 액체·기체가 직접 움직이며 순환",
      keyPoint: "액체·기체",
      contrast: "냄비 물이 돌며 데워짐",
    },
    {
      conceptId: "sci22_29",
      name: "복사",
      role: "매질 없이 열이 곧장 이동",
      keyPoint: "진공도 가능",
      contrast: "태양열, 모닥불 앞 열기",
    },
  ],
  summary: "전도는 입자가 제자리에서 전하고, 대류는 물질이 직접 돌고, 복사는 매질 없이 곧장 가.",
};

const massWeightSet: SetCompare = {
  setName: "질량↔무게",
  items: [
    {
      conceptId: "sci22_50",
      name: "질량",
      role: "물체가 가진 고유한 물질의 양",
      keyPoint: "장소가 바뀌어도 변하지 않음 · kg",
      contrast: "양팔저울로 비교",
    },
    {
      conceptId: "sci22_51",
      name: "무게",
      role: "물체에 작용하는 중력의 크기",
      keyPoint: "장소에 따라 달라짐 · N",
      contrast: "달에서는 작아짐",
    },
  ],
  summary: "달에 가도 질량은 그대로이고, 중력이 약해져 무게만 작아져.",
};

const biyeolScreenContent: ConceptContent["screenContent"] = {
  feel: {
    comicSituation: "여름 바닷가에서는 모래가 너무 뜨거워서 발을 못 대. 그런데 바로 옆 바닷물은 시원해.",
    question: "같은 햇빛을 받았는데, 왜 모래랑 물은 다르게 데워질까?",
    image: "/concept-images/comic-sci22_30.svg",
  },
  ox: [
    {
      statement: "서로 다른 물질이 같은 양의 열을 받으면 똑같이 뜨거워져.",
      answer: false,
      feedback: "아니야. 물질마다 비열이 달라서, 같은 열을 받아도 온도 변화가 다를 수 있어.",
    },
    {
      statement: "물은 모래보다 천천히 데워져.",
      answer: true,
      feedback: "맞아. 물은 비열이 커서 천천히 데워져.",
    },
  ],
  hanjaMatches: [
    { char: "比", meaning: "견줄 비", relatedWords: ["비교", "비율"] },
    { char: "熱", meaning: "더울 열", relatedWords: ["가열", "열정"] },
  ],
  definition: {
    dictionary: "비열은 물질 1kg의 온도를 1℃ 높이는 데 드는 열의 양이야.",
    easy: "비열이 큰 물질은 온도를 1도 올리는 데 열이 많이 필요하다는 의미야. 그래서 같은 열을 받아도 천천히 데워지고, 천천히 식는 거지.",
  },
  visualThinking: {
    image: "/concept-images/vt-sci22_30.svg",
    description: "똑같은 불 위에 물과 모래를 올려. 물 쪽 온도계는 조금 오르고, 모래 쪽 온도계는 많이 올라.",
    label: "물 = 천천히 / 모래 = 빨리",
    avoid: "물을 그냥 차가운 것으로만 그리면 안 돼. 비열은 온도가 아니라 데우기 어려운 정도야.",
  },
  explainHints: [
    "무엇이? 같은 열을 줄 때, 무엇을 서로 비교해?",
    "어떻게? 물과 모래는 어떻게 다르게 데워져?",
    "그래서? 비열이 크면 데워지는 속도는 어떻게 돼?",
  ],
};

const eunggoScreenContent: ConceptContent["screenContent"] = {
  feel: {
    comicSituation: "냉동실에 넣어 둔 물이 다음 날 딱딱한 얼음이 되어 있어. 흐르던 촛농도 식으면 굳어.",
    question: "흐르던 액체가 왜 딱딱하게 굳을까?",
    image: "/concept-images/comic-sci22_36.svg",
  },
  ox: [
    {
      statement: "응고는 액체가 고체로 변하는 거야.",
      answer: true,
      feedback: "맞아. 물이 얼음이 되는 게 응고야.",
    },
    {
      statement: "응고할 때 물질은 열을 얻어.",
      answer: false,
      feedback: "응고할 때는 열을 밖으로 내보내.",
    },
  ],
  hanjaMatches: [
    { char: "凝", meaning: "엉길 응", relatedWords: ["응결"] },
    { char: "固", meaning: "굳을 고", relatedWords: ["고체", "고집"] },
  ],
  definition: {
    dictionary: "응고는 액체가 열을 잃고 고체로 변하는 현상이야.",
    easy: "응고는 액체가 열을 내보내면서 고체로 굳는 거야. 입자가 사라지는 게 아니라, 움직임이 느려지고 배열이 단단해지는 거지.",
  },
  visualThinking: {
    image: "/concept-images/vt-sci22_36.svg",
    description: "자유롭게 움직이던 입자가 열을 밖으로 내보내. 그러면 제자리에 줄을 맞추듯 굳어.",
    label: "자유로운 입자 → 줄 맞춘 입자 / 열 나감",
    avoid: "차가움만 강조하거나 입자가 사라지는 것처럼 그리면 안 돼. 입자는 그대로 있고 배열만 바뀌어.",
  },
  explainHints: [
    "무엇이? 어떤 상태의 물질이 변하기 시작해?",
    "어떻게? 입자의 배열과 열은 어떻게 돼?",
    "그래서? 물질은 무엇으로 변해?",
  ],
};

const heatTransferScreenContent: ConceptContent["screenContent"] = {
  feel: {
    comicSituation: "뜨거운 국에 담근 쇠숟가락은 손잡이가 뜨거워져. 냄비 속 물은 부글부글 돌고, 모닥불 앞에 서면 얼굴이 따뜻해.",
    question: "숟가락, 냄비 물, 모닥불에서 열은 각각 어떻게 움직일까?",
    image: "/concept-images/comic-heat-transfer.svg",
  },
  ox: [
    {
      statement: "복사는 공기가 있어야 열을 전해.",
      answer: false,
      feedback: "복사는 아무것도 없는 우주도 지나갈 수 있어.",
    },
    {
      statement: "전도는 물질이 직접 움직여서 열을 전해.",
      answer: false,
      feedback: "전도는 물질이 움직이는 게 아니야. 입자의 떨림만 옆으로 전해져.",
    },
  ],
  hanjaMatches: [
    { char: "傳", meaning: "전할 전", relatedWords: ["전달", "전파"], note: "전도" },
    { char: "流", meaning: "흐를 류", relatedWords: ["흐름", "유행"], note: "대류" },
    { char: "輻", meaning: "바퀴살 복", relatedWords: ["수레바퀴 살"], note: "복사" },
  ],
  definition: {
    dictionary: "전도·대류·복사는 열이 이동하는 세 가지 방법이야.",
    easy: "열은 세 가지 방식으로 이동해. 전도는 입자 떨림이 옆으로, 대류는 물질이 돌면서, 복사는 빈 공간도 뚫고 곧장 가는 거야.",
  },
  visualThinking: {
    image: "/concept-images/vt-heat-transfer.svg",
    description: "세 칸으로 비교해. 숟가락 속 입자는 제자리에서 떨며 열을 넘기고, 냄비 물은 위아래로 돌아. 해나 불에서는 사방으로 곧은 화살표가 뻗어.",
    label: "전도 = 옆으로 / 대류 = 돌면서 / 복사 = 곧장",
    avoid: "전도를 숟가락이 움직이는 것처럼 그리면 안 돼. 복사에 공기 같은 매질을 꼭 그릴 필요도 없어.",
  },
  explainHints: [
    "무엇이? 각 방법에서 열을 나르는 건 뭐야?",
    "어떻게? 입자나 물질은 어떻게 움직여?",
    "그래서? 세 방법은 무엇으로 구분돼?",
  ],
};

const massWeightScreenContent: ConceptContent["screenContent"] = {
  feel: {
    comicSituation: "우주인이 달에서 껑충 뛰어. 지구에서 몸무게계가 60을 가리키던 사람이, 달에서는 눈금이 10으로 줄어들어.",
    question: "달에 가면 몸이 가벼워질까? 뭐가 변하고 뭐가 그대로일까?",
    image: "/concept-images/comic-sci22_50_51.svg",
  },
  ox: [
    {
      statement: "달에 가면 질량이 줄어들어.",
      answer: false,
      feedback: "질량은 어디서나 그대로야. 줄어드는 건 무게야.",
    },
    {
      statement: "무게는 장소에 따라 달라져.",
      answer: true,
      feedback: "맞아. 달은 중력이 작아서 무게가 줄어.",
    },
  ],
  hanjaMatches: [
    { char: "質", meaning: "바탕 질", relatedWords: ["물질", "성질"] },
    { char: "量", meaning: "양 량", relatedWords: ["분량", "수량"] },
    { char: "무게", meaning: "순우리말", relatedWords: ["한자 없음"] },
  ],
  definition: {
    dictionary: "질량은 물체가 가진 고유한 양이고, 무게는 물체에 작용하는 중력의 크기야.",
    easy: "질량은 물체가 가진 물질의 양이라 장소가 바뀌어도 그대로야. 무게는 중력이 당기는 힘이라 달처럼 중력이 약한 곳에서는 작아지는 거지.",
  },
  visualThinking: {
    image: "/concept-images/vt-sci22_50_51.svg",
    description: "왼쪽은 지구, 오른쪽은 달이야. 같은 사람을 두고, 양팔저울은 그대로야. 하지만 용수철저울은 달에서 눈금이 짧아져.",
    label: "질량 = 안 변함 / 무게 = 달에서 줄어듦",
    avoid: "질량과 무게를 같은 것으로 그리면 안 돼. 둘 다 변하거나 둘 다 그대로인 그림은 헷갈린 그림이야.",
  },
  explainHints: [
    "무엇이? 달에 갔을 때 변하는 것과 그대로인 건 뭐야?",
    "어떻게? 왜 무게만 달라져?",
    "그래서? 질량과 무게는 어떻게 달라?",
  ],
};

const solarSystemScreenContent: ConceptContent["screenContent"] = {
  feel: {
    comicSituation: "밤하늘에서는 태양을 가운데 두고 여러 행성이 둥근 길을 따라 돌아. 달은 지구 곁을 돌아.",
    question: "태양 주위를 도는 것과 행성 주위를 도는 것은 각각 뭘까?",
    image: "/concept-images/comic-sci22_55.svg",
  },
  ox: [
    {
      statement: "태양계의 중심은 지구야.",
      answer: false,
      feedback: "중심은 태양이야. 지구도 태양을 돌아.",
    },
    {
      statement: "위성은 행성 주위를 돌아.",
      answer: true,
      feedback: "맞아. 달은 지구의 위성이야.",
    },
  ],
  hanjaMatches: [
    { char: "太", meaning: "클 태", relatedWords: ["태초", "태평"] },
    { char: "陽", meaning: "볕 양", relatedWords: ["양지", "석양"] },
    { char: "系", meaning: "이어맬 계", relatedWords: ["계열", "관계"] },
  ],
  definition: {
    dictionary: "태양계는 태양과 그 주위를 도는 천체들의 집단이야.",
    easy: "태양계는 태양을 중심으로 행성, 위성, 혜성 같은 천체들이 함께 움직이는 큰 묶음이야. 중심은 지구가 아니라 태양이야.",
  },
  visualThinking: {
    image: "/concept-images/vt-sci22_55.svg",
    description: "가운데에 태양을 두고, 둘레에는 행성이 도는 길을 원으로 그려. 지구 옆에는 작은 달이 도는 작은 원을 그려.",
    label: "가운데 = 태양 / 태양을 도는 것 = 행성 / 행성을 도는 것 = 위성",
    avoid: "지구를 중심에 두면 안 돼. 스스로 빛나는 별과 빛을 반사하는 행성을 똑같이 그려도 헷갈려.",
  },
  explainHints: [
    "무엇이? 태양계의 중심에는 뭐가 있어?",
    "어떻게? 행성과 위성은 각각 무엇을 돌아?",
    "그래서? 태양계는 무엇들이 모인 거야?",
  ],
};

export const DEMO_CONTENT_BY_CONCEPT: Record<string, ConceptContent> = {
  sci22_30: {
    ...biyeol,
    conceptId: "sci22_30",
    feel: {
      scene: [biyeolScreenContent.feel!.comicSituation],
      hook: biyeolScreenContent.feel!.question,
    },
    concept: {
      hanja: [
        { char: "比", mean: "견줄 비", note: "비교, 비율처럼 서로 견주어 봄" },
        { char: "熱", mean: "더울 열", note: "가열, 열정처럼 열과 관련됨" },
      ],
      combined: "견주어 보는 열 → 물질마다 데워지는 정도를 비교",
      definition: biyeolScreenContent.definition!.easy,
      coreList: ["1kg을 1℃ 높이는 데 필요한 열", "클수록 천천히 데워짐", "물은 모래보다 비열이 큼"],
      warning: biyeolScreenContent.visualThinking!.avoid,
    },
    visual: {
      kind: "대칭비교",
      image: "/concept-images/vt-sci22_30.svg",
      caption: biyeolScreenContent.visualThinking!.label,
      nodes: ["같은 열", "물: 조금 오름", "모래: 많이 오름"],
    },
    definitionImage: {
      image: "/concept-images/vt-sci22_30.svg",
      alt: "물과 모래의 비열 비교 도식",
      dictionaryDefinition: biyeolScreenContent.definition!.dictionary,
      imageCaption: biyeolScreenContent.visualThinking!.label,
    },
    explain: {
      ...biyeol.explain,
      prompt: "비열이 무엇인지, 물과 모래의 예로 설명해 봐.",
      slots: biyeolScreenContent.explainHints!.map((hint) => ({ label: hint, hint, answer: "" })),
    },
    screenContent: biyeolScreenContent,
  },

  sci22_36: {
    ...eunggo,
    conceptId: "sci22_36",
    feel: {
      scene: [eunggoScreenContent.feel!.comicSituation],
      hook: eunggoScreenContent.feel!.question,
    },
    concept: {
      hanja: [
        { char: "凝", mean: "엉길 응", note: "응결처럼 흩어진 것이 한데 엉김" },
        { char: "固", mean: "굳을 고", note: "고체, 고집, 고정처럼 굳음" },
      ],
      combined: "엉겨서 굳음 → 액체가 고체로 변함",
      definition: eunggoScreenContent.definition!.easy,
      coreList: ["액체가 고체로 변함", "열을 밖으로 내보냄", "입자는 사라지지 않고 배열이 바뀜"],
      warning: eunggoScreenContent.visualThinking!.avoid,
    },
    visual: {
      kind: "화살표사슬",
      image: "/concept-images/vt-sci22_36.svg",
      caption: eunggoScreenContent.visualThinking!.label,
      nodes: ["액체 입자", "열 나감", "고체 입자"],
    },
    definitionImage: {
      image: "/concept-images/vt-sci22_36.svg",
      alt: "응고 입자 배열 도식",
      dictionaryDefinition: eunggoScreenContent.definition!.dictionary,
      imageCaption: eunggoScreenContent.visualThinking!.label,
    },
    explain: {
      ...eunggo.explain,
      prompt: "응고가 무엇인지, 물이 얼음이 되는 예로 설명해 봐.",
      slots: eunggoScreenContent.explainHints!.map((hint) => ({ label: hint, hint, answer: "" })),
    },
    screenContent: eunggoScreenContent,
  },

  sci22_27: {
    conceptId: "sci22_27",
    feel: {
      scene: [
        "뜨거운 국에 금속 숟가락을 넣으면 손잡이까지 뜨거워져.",
        "숟가락 전체가 움직인 건 아닌데, 열은 손까지 전해져.",
        "이렇게 물질을 따라 이웃한 입자에게 열이 차례로 전해지는 방법이 전도야.",
      ],
      hook: "전도는 물질은 가만히 있고 열만 옆으로 전해지는 이동이다.",
    },
    concept: {
      hanja: [
        { char: "傳", mean: "전할 전", note: "옆으로 전해 줌" },
        { char: "導", mean: "이끌 도", note: "이끌어 감" },
      ],
      combined: "전하여 이끎 → 이웃한 입자로 열이 전달됨",
      definition: "전도는 고체에서 이웃한 입자로 열이 차례차례 전달되는 열의 이동 방법이다.",
      coreList: ["입자는 제자리에서 진동", "열만 이웃으로 전달", "주로 고체에서 잘 일어남"],
      warning: "전도는 물질이 직접 흘러가는 대류와 달라. 숟가락이 이동한 게 아니라 열이 전달된 거야.",
    },
    quiz: [
      {
        id: "sci22_27_demo_q1",
        concept_id: "sci22_27",
        type: "적용형",
        prompt: "금속 숟가락 손잡이가 뜨거워지는 열의 이동은?",
        options: [
          { text: "전도", is_correct: true, tag: null },
          { text: "대류", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "복사", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        ],
      },
      {
        id: "sci22_27_demo_q2",
        concept_id: "sci22_27",
        type: "변별형",
        prompt: "전도·대류·복사 중 매질 없이 이동할 수 있는 것은?",
        options: [
          { text: "복사", is_correct: true, tag: null },
          { text: "전도", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "대류", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        ],
      },
    ],
    bigPicture: {
      flow: [
        { when: "뜨거운 쪽 입자", then: "더 세게 진동함" },
        { when: "이웃한 입자", then: "진동이 차례로 전해져 열이 이동함" },
      ],
      compare: heatTransferSet.items.map((item) => ({
        label: item.name,
        what: item.role ?? "",
        oneLiner: item.keyPoint ?? "",
      })),
      why: "열의 이동은 전도·대류·복사를 구분해야 생활 속 예를 정확히 설명할 수 있어.",
    },
    explain: {
      prompt: "금속 숟가락이 뜨거워지는 일을 전도라는 말로 설명해 봐.",
      closeWord: { sentence: "전도는 열의 이동 ___이다.", answer: "방법" },
      slots: [
        { label: "[무엇이] 열이", hint: "이동하는 것", answer: "열" },
        { label: "[어떻게] 이웃한 입자로", hint: "차례차례", answer: "전달" },
        { label: "[어디서] 주로 고체에서", hint: "고체", answer: "고체" },
      ],
      hanjaHint: "傳(전할) + 導(이끌) → 열이 이웃으로 전해져 감",
      coreKeywords: ["열", "전달", "입자", "고체"],
    },
    visual: {
      kind: "대칭비교",
      caption: "전도·대류·복사는 열이 이동하는 방식이 서로 달라.",
      nodes: ["전도: 제자리 전달", "대류: 물질 순환", "복사: 매질 없이 이동"],
    },
    strategy: {
      route: "조합형",
      structure: "한자 짜임 + 세트 속 위치",
      connection: "금속 숟가락 경험",
      misconception: "전도와 대류를 섞지 않기: 전도는 물질이 흐르는 게 아니야.",
    },
    wordFormation: {
      parts: [
        { text: "傳", meaning: "전할 전", relatedWords: ["전달", "전파"] },
        { text: "導", meaning: "이끌 도", relatedWords: ["지도", "유도"] },
      ],
      formula: "傳 + 導 = 전도",
      readingCue: "무엇이 전해지는지 묻기: 물질이 아니라 열",
    },
    setCompare: { ...heatTransferSet, focusId: "sci22_27" },
    screenContent: heatTransferScreenContent,
  },

  sci22_28: {
    conceptId: "sci22_28",
    feel: {
      scene: ["냄비 아래쪽 물이 데워지면 위로 올라가고, 차가운 물은 아래로 내려와."],
      hook: "대류는 데워진 물질이 직접 움직이며 열을 나르는 이동이다.",
    },
    concept: {
      hanja: [
        { char: "對", mean: "마주할 대", note: "서로 마주함" },
        { char: "流", mean: "흐를 류", note: "흐름" },
      ],
      combined: "흐르며 순환함",
      definition: "대류는 액체나 기체가 직접 움직이고 순환하면서 열을 이동시키는 방법이다.",
      coreList: ["액체·기체", "물질이 직접 이동", "따뜻한 것은 위로, 차가운 것은 아래로"],
      warning: "대류는 입자 진동만 전해지는 전도와 달라.",
    },
    quiz: [
      {
        id: "sci22_28_demo_q1",
        concept_id: "sci22_28",
        type: "적용형",
        prompt: "냄비 속 물이 돌며 데워지는 열의 이동은?",
        options: [
          { text: "대류", is_correct: true, tag: null },
          { text: "전도", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "복사", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        ],
      },
    ],
    bigPicture: {
      flow: [
        { when: "아래쪽 물이 데워짐", then: "가벼워져 위로 올라감" },
        { when: "차가운 물", then: "아래로 내려와 순환함" },
      ],
      compare: heatTransferSet.items.map((item) => ({
        label: item.name,
        what: item.role ?? "",
        oneLiner: item.keyPoint ?? "",
      })),
      why: heatTransferSet.summary ?? "",
    },
    explain: {
      prompt: "냄비 속 물이 데워지는 일을 대류로 설명해 봐.",
      closeWord: { sentence: "대류는 열의 이동 ___이다.", answer: "방법" },
      slots: [
        { label: "[물질] 액체나 기체", hint: "액체·기체", answer: "액체나 기체" },
        { label: "[움직임] 직접 움직임", hint: "순환", answer: "순환" },
      ],
      hanjaHint: "流(흐를) → 물질이 흐르며 열을 나름",
      coreKeywords: ["액체", "기체", "순환", "이동"],
    },
    visual: {
      kind: "화살표사슬",
      caption: "따뜻한 물질은 올라가고 차가운 물질은 내려오며 돈다.",
      nodes: ["가열", "위로", "순환", "열 이동"],
    },
    strategy: {
      route: "정의이미지형",
      structure: "세트 속 위치",
      connection: "냄비 물과 에어컨 경험",
    },
    setCompare: { ...heatTransferSet, focusId: "sci22_28" },
    screenContent: heatTransferScreenContent,
  },

  sci22_29: {
    conceptId: "sci22_29",
    feel: {
      scene: ["햇빛은 우주의 빈 공간을 지나 지구를 따뜻하게 해."],
      hook: "복사는 사이에 물질이 없어도 열이 곧장 이동하는 방법이다.",
    },
    concept: {
      hanja: [
        { char: "輻", mean: "바퀴살 복", note: "사방으로 뻗음" },
        { char: "射", mean: "쏠 사", note: "쏘아 보냄" },
      ],
      combined: "사방으로 쏘아 보냄",
      definition: "복사는 물질(매질) 없이 열이 직접 이동하는 방법이다.",
      coreList: ["매질 필요 없음", "진공도 가능", "빛처럼 곧장 이동"],
      warning: "복사는 공기나 물 같은 매질이 꼭 있어야 한다는 생각이 오개념이야.",
    },
    quiz: [
      {
        id: "sci22_29_demo_q1",
        concept_id: "sci22_29",
        type: "변별형",
        prompt: "매질 없이 열이 이동하는 방법은?",
        options: [
          { text: "복사", is_correct: true, tag: null },
          { text: "전도", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "대류", is_correct: false, tag: ERROR_TAGS.CONFUSION },
        ],
      },
    ],
    bigPicture: {
      flow: [
        { when: "태양", then: "우주 공간을 지나 지구로 열을 보냄" },
        { when: "모닥불 앞", then: "공기가 직접 흐르지 않아도 앞쪽이 따뜻함" },
      ],
      compare: heatTransferSet.items.map((item) => ({
        label: item.name,
        what: item.role ?? "",
        oneLiner: item.keyPoint ?? "",
      })),
      why: heatTransferSet.summary ?? "",
    },
    explain: {
      prompt: "태양열이 지구까지 오는 일을 복사로 설명해 봐.",
      closeWord: { sentence: "복사는 열의 이동 ___이다.", answer: "방법" },
      slots: [
        { label: "[조건] 매질 없이", hint: "진공", answer: "매질 없이" },
        { label: "[방향] 곧장 이동", hint: "빛처럼", answer: "직접 이동" },
      ],
      hanjaHint: "輻(바퀴살) + 射(쏠) → 사방으로 쏘아 보냄",
      coreKeywords: ["매질", "진공", "직접", "태양"],
    },
    visual: {
      kind: "화살표사슬",
      caption: "태양에서 지구로 열이 매질 없이 이동한다.",
      nodes: ["태양", "빈 공간", "지구"],
    },
    strategy: {
      route: "의미확장형",
      structure: "한자 비유 + 세트 속 위치",
      connection: "햇빛과 모닥불 경험",
    },
    wordFormation: {
      parts: [
        { text: "輻", meaning: "바퀴살 복" },
        { text: "射", meaning: "쏠 사" },
      ],
      formula: "輻 + 射 = 복사",
      readingCue: "바퀴살처럼 사방으로 쏘아 보낸다는 이미지로 읽기",
    },
    setCompare: { ...heatTransferSet, focusId: "sci22_29" },
    screenContent: heatTransferScreenContent,
  },

  sci22_50: {
    conceptId: "sci22_50",
    feel: {
      scene: [
        "같은 물체를 지구에서 달로 가져가도 물체 자체의 양은 변하지 않아.",
        "하지만 달에서는 중력이 약해서 더 가볍게 느껴져.",
      ],
      hook: "질량은 변하지 않고, 무게는 장소에 따라 달라진다.",
    },
    concept: {
      hanja: [
        { char: "質", mean: "바탕 질", note: "물질의 바탕" },
        { char: "量", mean: "양 량", note: "얼마나 되는 양" },
      ],
      combined: "물질의 바탕이 되는 양",
      definition: "질량은 물체가 가진 고유한 물질의 양으로, 장소가 바뀌어도 변하지 않는다.",
      coreList: ["장소가 바뀌어도 변하지 않음", "단위 kg", "양팔저울로 측정"],
      warning: "질량과 무게를 같은 말로 쓰면 안 돼. 달에 가도 질량은 그대로야.",
    },
    quiz: [
      {
        id: "sci22_50_demo_q1",
        concept_id: "sci22_50",
        type: "적용형",
        prompt: "달에 가면 변하는 것은?",
        options: [
          { text: "무게", is_correct: true, tag: null },
          { text: "질량", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "둘 다", is_correct: false, tag: ERROR_TAGS.CORE },
        ],
      },
    ],
    bigPicture: {
      flow: [
        { when: "지구에서 달로 이동", then: "물질의 양은 그대로라 질량은 변하지 않음" },
        { when: "중력이 약한 곳", then: "당기는 힘이 작아져 무게가 작아짐" },
      ],
      compare: [
        { label: "질량", what: "물체가 가진 고유한 물질의 양", oneLiner: "변하지 않음 · kg" },
        { label: "무게", what: "물체에 작용하는 중력의 크기", oneLiner: "장소 따라 변함 · N" },
      ],
      why: "과학에서는 질량과 무게를 구분해야 힘, 중력, 부력을 정확히 설명할 수 있어.",
    },
    explain: {
      prompt: "질량과 무게의 차이를 달에 간 상황으로 설명해 봐.",
      closeWord: { sentence: "질량은 물질의 ___이다.", answer: "양" },
      slots: [
        { label: "[질량] 장소가 바뀌어도 변하지 않음", hint: "그대로", answer: "변하지 않음" },
        { label: "[무게] 중력의 크기", hint: "힘", answer: "중력의 크기" },
        { label: "[달] 무게가 작아짐", hint: "달", answer: "작아짐" },
      ],
      hanjaHint: "質(바탕) + 量(양) → 물질의 바탕이 되는 양",
      coreKeywords: ["질량", "무게", "중력", "변하지"],
    },
    visual: {
      kind: "대칭비교",
      caption: "지구와 달에서 질량은 그대로, 무게는 달라진다.",
      nodes: ["지구: 질량 같음·무게 큼", "달: 질량 같음·무게 작음"],
    },
    strategy: {
      route: "의미확장형",
      structure: "짝대조(질량↔무게)",
      connection: "달에서 가벼워지는 경험 상상",
      misconception: "질량 = 무게로 외우면 달 예시에서 바로 헷갈려.",
    },
    wordFormation: {
      parts: [
        { text: "質", meaning: "바탕 질" },
        { text: "量", meaning: "양 량", relatedWords: ["강수량", "열량"] },
      ],
      formula: "質 + 量 = 질량",
      readingCue: "量은 '얼마나 되는 양'이라는 가족말로 연결하기",
    },
    setCompare: { ...massWeightSet, focusId: "sci22_50" },
    screenContent: massWeightScreenContent,
  },

  sci22_51: {
    conceptId: "sci22_51",
    feel: {
      scene: ["달에서는 같은 물체도 지구보다 가볍게 느껴져."],
      hook: "무게는 물체에 작용하는 중력의 크기라 장소에 따라 달라진다.",
    },
    concept: {
      hanja: [],
      combined: "중력이 물체를 당기는 크기",
      definition: "무게는 물체에 작용하는 중력의 크기로, 장소에 따라 달라진다.",
      coreList: ["중력의 크기", "단위 N", "장소에 따라 달라짐"],
      warning: "무게는 물질의 양인 질량과 달라.",
    },
    quiz: [
      {
        id: "sci22_51_demo_q1",
        concept_id: "sci22_51",
        type: "적용형",
        prompt: "달에 가면 변하는 것은?",
        options: [
          { text: "무게", is_correct: true, tag: null },
          { text: "질량", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "둘 다", is_correct: false, tag: ERROR_TAGS.CORE },
        ],
      },
    ],
    bigPicture: {
      flow: [
        { when: "중력이 커짐", then: "무게도 커짐" },
        { when: "중력이 작아짐", then: "무게도 작아짐" },
      ],
      compare: [
        { label: "질량", what: "고유한 물질의 양", oneLiner: "kg · 변하지 않음" },
        { label: "무게", what: "중력의 크기", oneLiner: "N · 장소 따라 변함" },
      ],
      why: massWeightSet.summary ?? "",
    },
    explain: {
      prompt: "무게가 장소에 따라 달라지는 까닭을 설명해 봐.",
      closeWord: { sentence: "무게는 중력의 ___이다.", answer: "크기" },
      slots: [
        { label: "[정의] 중력의 크기", hint: "힘", answer: "중력의 크기" },
        { label: "[조건] 장소에 따라 달라짐", hint: "달·지구", answer: "장소" },
      ],
      hanjaHint: "무게는 순우리말이지만 과학에서는 '중력의 크기'로 정확히 닫아.",
      coreKeywords: ["중력", "크기", "장소", "N"],
    },
    visual: {
      kind: "대칭비교",
      caption: "같은 물체라도 지구와 달에서 무게가 달라진다.",
      nodes: ["질량 그대로", "중력 약함", "무게 작아짐"],
    },
    strategy: {
      route: "의미확장형",
      structure: "짝대조(질량↔무게)",
      connection: "달에서 가벼워짐 경험 상상",
    },
    setCompare: { ...massWeightSet, focusId: "sci22_51" },
    screenContent: massWeightScreenContent,
  },

  sci22_55: {
    conceptId: "sci22_55",
    feel: {
      scene: [
        "밤하늘의 달, 행성, 혜성은 모두 우주에 있는 물체야.",
        "그중 태양을 중심으로 함께 묶어 보는 가족이 태양계야.",
      ],
      hook: "태양계는 태양과 그 주위를 도는 천체들의 집단이다.",
    },
    concept: {
      hanja: [
        { char: "太", mean: "클 태", note: "크고 중심이 되는 것" },
        { char: "陽", mean: "볕 양", note: "햇빛, 태양" },
        { char: "系", mean: "이을 계", note: "서로 이어진 묶음" },
      ],
      combined: "큰 볕을 중심으로 이어진 묶음",
      definition: "태양계는 태양과 태양을 중심으로 도는 행성, 위성, 소행성, 혜성 등으로 이루어진 집단이다.",
      coreList: ["중심은 태양", "행성·위성·소행성·혜성 포함", "천체들의 집단"],
      warning: "별과 행성은 같지 않아. 태양 같은 별은 스스로 빛을 내고, 행성은 별 주위를 돌며 빛을 반사해.",
    },
    quiz: [
      {
        id: "sci22_55_demo_q1",
        concept_id: "sci22_55",
        type: "정의형",
        prompt: "태양계의 중심은?",
        options: [
          { text: "태양", is_correct: true, tag: null },
          { text: "지구", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "달", is_correct: false, tag: ERROR_TAGS.CATEGORY },
        ],
      },
      {
        id: "sci22_55_demo_q2",
        concept_id: "sci22_55",
        type: "변별형",
        prompt: "태양계에 포함되는 천체로 알맞은 것은?",
        options: [
          { text: "행성, 위성, 소행성, 혜성", is_correct: true, tag: null },
          { text: "구름, 바람, 바다", is_correct: false, tag: ERROR_TAGS.CATEGORY },
          { text: "태양만", is_correct: false, tag: ERROR_TAGS.CORE },
        ],
      },
    ],
    bigPicture: {
      flow: [
        { when: "태양", then: "태양계의 중심" },
        { when: "행성", then: "태양 주위를 돎" },
        { when: "위성", then: "행성 주위를 돎" },
      ],
      compare: [
        { label: "별", what: "스스로 빛을 내는 천체", oneLiner: "태양" },
        { label: "행성", what: "별 주위를 도는 천체", oneLiner: "지구 등" },
        { label: "위성", what: "행성 주위를 도는 천체", oneLiner: "달" },
      ],
      why: "태양계의 구성원을 알면 행성, 위성, 혜성, 달의 위상 같은 뒤 개념들이 한 묶음으로 정리돼.",
    },
    explain: {
      prompt: "태양계가 무엇인지, 중심과 구성원을 넣어 설명해 봐.",
      closeWord: { sentence: "태양계는 천체들의 ___이다.", answer: "집단" },
      slots: [
        { label: "[중심] 태양", hint: "중심", answer: "태양" },
        { label: "[구성] 행성·위성·소행성·혜성", hint: "구성원", answer: "천체" },
        { label: "[닫기] 집단", hint: "무리", answer: "집단" },
      ],
      hanjaHint: "太(클) + 陽(볕) + 系(이을) → 태양을 중심으로 이어진 천체 묶음",
      coreKeywords: ["태양", "행성", "위성", "집단"],
    },
    visual: {
      kind: "묶음맵",
      image: "/concept-images/vt-sci22_55.svg",
      caption: "태양을 중심으로 여러 천체가 궤도를 따라 도는 구조",
      nodes: ["태양", "행성", "위성", "소행성", "혜성"],
    },
    definitionImage: {
      image: "/concept-images/vt-sci22_55.svg",
      alt: "태양계 단순 도식",
      dictionaryDefinition: "태양계는 태양과 그 주위를 도는 천체들의 집단이다.",
      imageCaption: "중심이 태양이고, 여러 천체가 그 주위를 도는 구조가 핵심이야.",
      example: "태양, 지구, 달, 혜성",
    },
    strategy: {
      route: "정의이미지형",
      structure: "정의·이미지",
      connection: "태양계 그림과 밤하늘 경험",
      misconception: "태양계는 태양만이 아니라 태양 주변을 도는 여러 천체들의 집단이야.",
    },
    wordFormation: {
      parts: [
        { text: "太", meaning: "클 태", relatedWords: ["태평양"] },
        { text: "陽", meaning: "볕 양", relatedWords: ["양지", "태양"] },
        { text: "系", meaning: "이을 계", relatedWords: ["체계", "생태계"] },
      ],
      formula: "太 + 陽 + 系 = 태양계",
      readingCue: "系는 흩어진 것들이 하나로 이어진 묶음이라는 뜻으로 읽기",
    },
    screenContent: solarSystemScreenContent,
  },
  sci22_17: {
    conceptId: "sci22_17",
    feel: {
      scene: [
        "강낭콩 씨앗을 보면 같은 식물에서 나왔어도 크기, 색, 무늬가 조금씩 달라.",
        "서로 다른 생물이 아니라, 같은 종류 안에서 보이는 차이야.",
      ],
      hook: "변이는 같은 종 안의 개체들이 조금씩 다른 모습이다.",
    },
    concept: {
      hanja: [
        { char: "變", mean: "변할 변", note: "모습이나 성질이 달라짐" },
        { char: "異", mean: "다를 이", note: "서로 같지 않음" },
      ],
      combined: "변하고 다름 → 같은 종 안에서 나타나는 차이",
      definition: "변이는 같은 종의 개체 사이에서 나타나는 생김새나 성질의 차이이다.",
      coreList: ["같은 종 안의 차이", "개체마다 조금씩 다름", "생물 다양성의 바탕"],
      warning: "변이는 서로 다른 종 사이의 차이가 아니야. 강낭콩과 완두콩의 차이가 아니라, 강낭콩들 사이의 차이를 봐야 해.",
    },
    quiz: [
      {
        id: "sci22_17_demo_q1",
        concept_id: "sci22_17",
        type: "변별형",
        prompt: "같은 종 안에서 나타나는 개체들의 차이는?",
        options: [
          { text: "변이", is_correct: true, tag: null },
          { text: "종 분화", is_correct: false, tag: ERROR_TAGS.CONFUSION },
          { text: "분류", is_correct: false, tag: ERROR_TAGS.CATEGORY },
        ],
      },
    ],
    bigPicture: {
      flow: [
        { when: "같은 강낭콩 씨앗", then: "크기·무늬가 조금씩 다름" },
        { when: "같은 종 안의 차이", then: "변이라고 부름" },
        { when: "환경이 달라짐", then: "어떤 차이는 살아남는 데 도움이 될 수 있음" },
      ],
      compare: [
        { label: "변이", what: "같은 종 안의 개체 차이", oneLiner: "강낭콩 씨앗마다 다른 무늬" },
        { label: "다른 종의 차이", what: "종 자체가 다름", oneLiner: "강낭콩과 완두콩의 차이" },
      ],
      why: "변이를 이해하면 생물 다양성과 생물이 환경에 적응하는 과정을 더 쉽게 볼 수 있어.",
    },
    explain: {
      prompt: "강낭콩 씨앗 예시를 써서 변이가 무엇인지 설명해 봐.",
      closeWord: { sentence: "변이는 같은 종 안의 ___이다.", answer: "차이" },
      slots: [
        { label: "[범위] 같은 종 안에서", hint: "서로 다른 종 아님", answer: "같은 종" },
        { label: "[무엇] 개체마다 다른 모습", hint: "크기·색·무늬", answer: "차이" },
      ],
      hanjaHint: "變(변할) + 異(다를) → 같은 종 안에서 조금씩 달라 보이는 차이",
      coreKeywords: ["같은 종", "개체", "차이", "강낭콩"],
    },
    visual: {
      kind: "묶음맵",
      image: "/concept-images/vt-sci22_17.svg",
      caption: "같은 강낭콩 씨앗인데 크기와 무늬가 조금씩 다른 모습",
      nodes: ["같은 종", "강낭콩 씨앗", "조금씩 다름"],
    },
    definitionImage: {
      image: "/concept-images/vt-sci22_17.svg",
      alt: "강낭콩 씨앗으로 본 변이 도식",
      dictionaryDefinition: "변이는 같은 종의 개체 사이에서 나타나는 생김새나 성질의 차이이다.",
      imageCaption: "설명 예시가 강낭콩이면 그림도 강낭콩으로 맞춰 인지 부담을 줄여요.",
      example: "같은 강낭콩 씨앗들의 크기·무늬 차이",
    },
    strategy: {
      route: "정의이미지형",
      structure: "범위 확인: 같은 종 안",
      connection: "강낭콩 씨앗 관찰 경험",
      misconception: "다른 종끼리 비교하면 변이의 핵심 범위가 흐려져요.",
    },
    wordFormation: {
      parts: [
        { text: "變", meaning: "변할 변", relatedWords: ["변화", "변형"] },
        { text: "異", meaning: "다를 이", relatedWords: ["차이", "이상"] },
      ],
      formula: "變 + 異 = 변이",
      readingCue: "무엇이 다른지보다 먼저 '같은 종 안인가?'를 묻기",
    },
  },
};
