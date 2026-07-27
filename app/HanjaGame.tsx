"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  loadProgress,
  loadWrongTags,
  saveConceptProgress,
  saveWrongTag,
  resetProgress,
} from "@/lib/storage";
import type {
  Concept,
  ConceptProgress,
  Difficulty,
  Progress,
  WrongTagCounts,
} from "./types";
import ConceptExample, { hasExample } from "./components/ConceptExample";
import DrawingPad from "./components/DrawingPad";

// ---------- 데이터 ----------
export const CONCEPTS: Record<string, Concept> = {
  sci_byeonyi: {
    id: "sci_byeonyi",
    term: "변이",
    subject: "과학 · 진화",
    difficulty: "보통",
    hanja: [
      { sound: "변", meaning: "변하다" },
      { sound: "이", meaning: "다르다" },
    ],
    easyMeaning: "생긴 모습이나 특징이 조금씩 다른 것",
    example:
      "강낭콩 씨앗을 보면, 같은 식물에서 나왔어도 색깔, 크기, 무늬가 조금씩 달라요. 이렇게 같은 종류인데 조금씩 다른 모습을 변이라고 해요.",
    quiz: [
      {
        q: '"변이"는 무엇과 무엇 사이에서 보이는 차이일까요?',
        options: [
          "같은 종류의 생물들 사이",
          "서로 다른 종류의 생물들 사이",
          "한 생물이 어제와 오늘 변한 모습",
        ],
        correct: 0,
        hint: '변이는 "같은 종류" 안에서의 차이라는 점을 떠올려볼까요?',
        wrongTags: {
          1: "overgeneralization",
          2: "literal_meaning",
        },
      },
      {
        q: "변이가 왜 중요할까요?",
        options: [
          "환경에 더 잘 맞는 특징을 가진 개체가 살아남아 자손을 남긴다",
          "변이가 생기면 그 생물은 곧 다른 종이 된다",
          "변이는 자손에게 전달되지 않고 사라진다",
        ],
        correct: 0,
        hint: "변이는 자손에게 전달될 수 있고, 환경에 유리한 변이는 살아남는 데 도움을 줘요.",
        wrongTags: {
          1: "overgeneralization",
          2: "cause_effect_reversal",
        },
      },
    ],
    explanation: {
      keywords: ["변함", "다름", "개체", "차이", "같은 종"],
      minRequired: 2,
      modelAnswer: "변이는 같은 종 안에서 개체들이 서로 다른(異) 모습을 보이며 차이가 나는(變) 것을 말한다.",
    },
    prerequisites: [],
  },
  sci_saengtaegye: {
    id: "sci_saengtaegye",
    term: "생태계",
    subject: "과학 · 생태",
    difficulty: "보통",
    hanja: [
      { sound: "생", meaning: "살다" },
      { sound: "태", meaning: "모습" },
      { sound: "계", meaning: "이어매다" },
    ],
    easyMeaning: "생물과 그 주변 환경이 서로 영향을 주고받는 하나의 세계",
    example:
      "연못 속 물고기, 물풀, 햇빛, 물, 흙이 서로 영향을 주고받으며 함께 살아가는 모습 전체가 하나의 생태계예요.",
    quiz: [
      {
        q: "생태계에 포함되는 것은 무엇일까요?",
        options: [
          "생물과 그를 둘러싼 환경 모두",
          "동물과 식물 같은 생물만",
          "햇빛, 물, 온도 같은 환경만",
        ],
        correct: 0,
        hint: "생물만 있거나 환경만 있어서는 생태계가 될 수 없어요.",
        wrongTags: {
          1: "literal_meaning",
          2: "literal_meaning",
        },
      },
      {
        q: "생태계의 균형이 깨지는 경우는?",
        options: [
          "한 생물 종의 수가 갑자기 크게 변할 때",
          "계절이 봄에서 여름으로 바뀔 때",
          "하루 동안 해가 뜨고 질 때",
        ],
        correct: 0,
        hint: "계절 변화나 낮밤은 자연스러운 반복이지, 균형이 깨지는 사건은 아니에요.",
        wrongTags: {
          1: "overgeneralization",
          2: "overgeneralization",
        },
      },
    ],
    explanation: {
      keywords: ["생물", "환경", "상호작용", "균형", "체계"],
      minRequired: 2,
      modelAnswer: "생태계는 생물이 살아가는(生) 모습(態)이 환경과 서로 영향을 주고받으며 하나의 체계(系)를 이루는 것이다.",
    },
    prerequisites: [],
  },
  sci_beonsik: {
    id: "sci_beonsik",
    term: "번식",
    subject: "과학 · 생식",
    difficulty: "쉬움",
    hanja: [
      { sound: "번", meaning: "번성하다" },
      { sound: "식", meaning: "불리다" },
    ],
    easyMeaning: "생물이 새끼나 씨를 만들어 수를 늘리는 것",
    example:
      "토끼 한 쌍이 새끼를 낳으면 토끼의 수가 늘어나요. 이렇게 자손을 만들어 수를 늘리는 것을 번식이라고 해요.",
    quiz: [
      {
        q: "번식의 결과로 늘어나는 것은?",
        options: ["개체의 수", "한 개체의 크기", "한 개체가 사는 기간"],
        correct: 0,
        hint: "번식은 '늘리다'라는 뜻의 한자(殖)가 들어있어요. 무엇이 늘어날까요?",
        wrongTags: {
          1: "literal_meaning",
          2: "literal_meaning",
        },
      },
      {
        q: "번식이 생물에게 중요한 이유는?",
        options: [
          "종족을 유지하고 이어가기 위해서",
          "한 개체가 더 오래 살기 위해서",
          "환경 온도를 조절하기 위해서",
        ],
        correct: 0,
        hint: "번식은 한 개체가 아니라, 그 생물 무리 전체와 관련이 있어요.",
        wrongTags: {
          1: "overgeneralization",
          2: "overgeneralization",
        },
      },
    ],
    explanation: {
      keywords: ["늘어남", "개체", "자손", "종족"],
      minRequired: 2,
      modelAnswer: "번식은 생물이 번성하여(繁) 자신과 닮은 자손을 만들어 개체 수를 늘리는(殖) 과정이다.",
    },
    prerequisites: [],
  },
  sci_wonhaek_saengmul: {
    id: "sci_wonhaek_saengmul",
    term: "원핵생물",
    subject: "과학 · 분류",
    difficulty: "어려움",
    hanja: [
      { sound: "원", meaning: "원래" },
      { sound: "핵", meaning: "씨, 핵" },
      { sound: "생물", meaning: "살아있는 것" },
    ],
    easyMeaning: "몸 안에 핵을 감싸는 막이 없는, 아주 단순한 생물",
    example:
      "세균(박테리아)은 우리 몸 세포와 달리 핵을 감싸는 막이 따로 없어요. 이렇게 핵막 없이 단순한 구조를 가진 생물을 원핵생물이라고 해요.",
    quiz: [
      {
        q: "원핵생물에게 없는 것은 무엇일까요?",
        options: [
          "핵막으로 둘러싸인 핵",
          "유전 물질(DNA) 자체",
          "세포를 둘러싸는 막",
        ],
        correct: 0,
        hint: "핵막이 없다고 해서 유전 물질 자체가 없는 건 아니에요. DNA는 세포 안에 그냥 퍼져 있어요.",
        wrongTags: {
          1: "location_confusion",
          2: "overgeneralization",
        },
      },
      {
        q: "원핵생물에 속하는 예시는?",
        options: ["세균(박테리아)", "사람의 세포", "버섯과 곰팡이"],
        correct: 0,
        hint: "사람의 세포나 버섯, 곰팡이는 핵막을 가진 더 복잡한 세포로 되어 있어요.",
        wrongTags: {
          1: "overgeneralization",
          2: "location_confusion",
        },
      },
    ],
    explanation: {
      keywords: ["핵", "핵막", "없음", "단순한", "세균"],
      minRequired: 2,
      modelAnswer: "원핵생물은 원래(原) 핵막으로 둘러싸인 핵(核)이 없는 생물(生物)로, 세균처럼 단순한 구조의 세포로 이루어져 있다.",
    },
    prerequisites: [],
  },
  sci_gyungye: {
    id: "sci_gyungye",
    term: "균계",
    subject: "과학 · 분류",
    difficulty: "어려움",
    hanja: [
      { sound: "균", meaning: "곰팡이" },
      { sound: "계", meaning: "영역" },
    ],
    easyMeaning: "곰팡이, 버섯처럼 다른 생물의 양분을 분해해서 사는 생물 무리",
    example:
      "버섯과 곰팡이는 스스로 양분을 만들지 못하고, 죽은 나무나 다른 생물에서 나온 영양분을 분해해서 흡수해요. 이런 생물들을 묶어 균계라고 해요.",
    quiz: [
      {
        q: "균계에 속하는 생물들의 공통점은?",
        options: [
          "다른 생물이 만든 양분을 분해해 흡수한다",
          "스스로 빛을 이용해 양분을 만든다",
          "다른 생물을 잡아먹어 양분을 얻는다",
        ],
        correct: 0,
        hint: "스스로 빛으로 양분을 만드는 건 식물의 특징이에요. 균계는 분해자 역할을 해요.",
        wrongTags: {
          1: "overgeneralization",
          2: "overgeneralization",
        },
      },
      {
        q: "균계에 속하는 생물의 예시는?",
        options: ["버섯, 곰팡이", "세균, 대장균", "선인장, 소나무"],
        correct: 0,
        hint: "세균은 원핵생물, 선인장과 소나무는 식물이에요.",
        wrongTags: {
          1: "location_confusion",
          2: "overgeneralization",
        },
      },
    ],
    explanation: {
      keywords: ["분류", "곰팡이", "버섯", "분해", "흡수"],
      minRequired: 2,
      modelAnswer: "균계는 곰팡이나 버섯 같은 균(菌)을 하나의 분류 영역(界)으로 묶은 것으로, 이들은 다른 생물이 만든 양분을 분해해 흡수하며 살아간다.",
    },
    prerequisites: ["sci_saengtaegye", "sci_wonhaek_saengmul"],
  },
  sci_jong_bunhwa: {
    id: "sci_jong_bunhwa",
    term: "종분화",
    subject: "과학 · 진화",
    difficulty: "어려움",
    hanja: [
      { sound: "종", meaning: "씨, 종류" },
      { sound: "분", meaning: "나누다" },
      { sound: "화", meaning: "되다, 변하다" },
    ],
    easyMeaning: "한 종류의 생물이 시간이 지나면서 여러 종류로 나뉘는 것",
    example:
      "옛날에 한 종류였던 새가, 서로 멀리 떨어진 섬에 살게 되면서 시간이 지나 부리 모양이 다른 여러 종으로 나뉘는 경우가 있어요. 이걸 종분화라고 해요.",
    quiz: [
      {
        q: "종분화는 무엇이 나뉘는 과정일까요?",
        options: [
          "한 종이 여러 종으로 나뉜다",
          "한 개체가 여러 신체 부위로 나뉜다",
          "한 세포가 여러 조직으로 나뉜다",
        ],
        correct: 0,
        hint: '"種(종류)"이 나뉜다(分)는 것은, 생물 분류상 종류 자체가 나뉘는 것을 말해요.',
        wrongTags: {
          1: "literal_meaning",
          2: "overgeneralization",
        },
      },
      {
        q: "종분화가 일어나려면 먼저 무엇이 필요할까요?",
        options: [
          "서로 다른 환경에서의 오랜 격리",
          "갑작스러운 기온 상승",
          "개체 수의 급격한 증가",
        ],
        correct: 0,
        hint: "변이를 가진 무리가 서로 다른 환경에서 오래 떨어져 지내야 새로운 종으로 갈라질 수 있어요.",
        wrongTags: {
          1: "cause_effect_reversal",
          2: "overgeneralization",
        },
      },
    ],
    explanation: {
      keywords: ["종류", "나뉨", "변화", "환경", "새로운 종"],
      minRequired: 2,
      modelAnswer: "종분화는 한 종(種)이 여러 무리로 나뉘어(分) 환경 차이를 겪으며 시간이 지나 서로 다른 종으로 변화하는(化) 과정이다.",
    },
    prerequisites: ["sci_byeonyi"],
  },
  sci_photosynthesis: {
    id: "sci_photosynthesis",
    term: "광합성",
    subject: "과학 · 에너지",
    difficulty: "어려움",
    hanja: [
      { sound: "광", meaning: "빛" },
      { sound: "합", meaning: "합하다" },
      { sound: "성", meaning: "이루다" },
    ],
    easyMeaning: "식물이 빛을 이용해서 영양분을 스스로 만드는 것",
    example:
      "식물의 잎은 빛을 받아서 이산화탄소와 물을 합쳐 포도당(영양분)과 산소를 만들어요. 이 모든 과정을 광합성이라고 해요.",
    quiz: [
      {
        q: "빛(光)으로 합하여(合) 이루다(成) — 무엇을 합할까요?",
        options: ["이산화탄소와 물", "산소와 질소", "포도당과 산소"],
        correct: 0,
        hint: "식물이 공기 중에서 들이마시는 것과, 뿌리에서 빨아올리는 것을 떠올려볼까요?",
        wrongTags: {
          1: "literal_meaning",
          2: "structure_order_confusion",
        },
      },
      {
        q: "이 반응은 식물 세포의 어디에서 일어날까요?",
        options: ["엽록체", "미토콘드리아", "핵"],
        correct: 0,
        hint: "식물의 초록색을 만드는 부분이 바로 빛을 이용하는 장소예요.",
        wrongTags: {
          1: "location_confusion",
          2: "location_confusion",
        },
      },
      {
        q: "그 결과로 무엇이 만들어질까요?",
        options: ["이산화탄소와 물", "단백질", "포도당과 산소"],
        correct: 2,
        hint: "광합성의 결과물은 재료(이산화탄소, 물)와는 달라요. 식물의 영양분과, 우리가 숨 쉬는 데 필요한 기체를 떠올려보세요.",
        wrongTags: {
          0: "structure_order_confusion",
          1: "overgeneralization",
        },
      },
    ],
    explanation: {
      keywords: ["빛", "결합", "이산화탄소", "물", "엽록체", "포도당", "산소"],
      minRequired: 3,
      modelAnswer: "광합성은 빛(光)을 이용해 이산화탄소와 물을 합쳐서(合) 포도당을 만들어내는(成) 과정이다.",
    },
    prerequisites: [],
  },

  // ---------- 보너스: 光 시리즈 ----------
  sci_yagwang: {
    id: "sci_yagwang",
    term: "야광",
    subject: "光 시리즈 · 보너스",
    difficulty: "쉬움",
    hanja: [
      { sound: "야", meaning: "밤" },
      { sound: "광", meaning: "빛" },
    ],
    easyMeaning: "어두운 곳에서 스스로 빛을 내는 성질",
    example: "야광 스티커나 야광 시계 바늘은 불을 꺼도 빛이 보여요. 낮에 빛을 흡수해뒀다가 어두운 밤에 내보내는 거예요.",
    quiz: [
      {
        q: "야광 물질은 빛을 어떻게 얻을까요?",
        options: [
          "낮에 빛을 흡수해 저장했다가 어두운 곳에서 내보낸다",
          "스스로 불을 태워서 빛을 만든다",
          "전기 신호를 받아서 빛난다",
        ],
        correct: 0,
        hint: "야광 물질은 따로 전기나 불 없이도 빛나요. 낮 동안 무엇을 모아두는 걸까요?",
        wrongTags: {
          1: "literal_meaning",
          2: "overgeneralization",
        },
      },
      {
        q: "다음 중 야광의 의미가 가장 잘 드러나는 예시는?",
        options: [
          "불을 꺼도 어둠 속에서 빛나는 시계 바늘",
          "해가 떠 있을 때만 보이는 그림자",
          "낮에만 사용하는 손전등",
        ],
        correct: 0,
        hint: '"夜(밤)"에 "光(빛)"이 난다는 뜻을 떠올려보세요.',
        wrongTags: {
          1: "literal_meaning",
          2: "literal_meaning",
        },
      },
    ],
    prerequisites: [],
    isBonus: true,
  },
  sci_gwangseon: {
    id: "sci_gwangseon",
    term: "광선",
    subject: "光 시리즈 · 보너스",
    difficulty: "쉬움",
    hanja: [
      { sound: "광", meaning: "빛" },
      { sound: "선", meaning: "줄, 선" },
    ],
    easyMeaning: "빛이 곧게 나아가는 줄 모양의 길",
    example: "어두운 방에 작은 틈으로 빛이 들어오면, 빛이 일직선으로 뻗어나가는 줄 모양이 보여요. 이걸 광선이라고 해요.",
    quiz: [
      {
        q: "광선은 빛의 어떤 모습을 나타낼까요?",
        options: [
          "빛이 곧게 일직선으로 나아가는 모습",
          "빛이 사방으로 퍼져서 사라지는 모습",
          "빛의 색깔이 변하는 모습",
        ],
        correct: 0,
        hint: '"線(줄, 선)"이라는 한자는 길고 곧은 모양을 나타내요.',
        wrongTags: {
          1: "literal_meaning",
          2: "overgeneralization",
        },
      },
      {
        q: "광선이 거울에 부딪히면 어떻게 될까요?",
        options: [
          "방향이 바뀌어 다른 쪽으로 나아간다(반사)",
          "그 자리에서 사라진다",
          "더 이상 직선이 아닌 모양이 된다",
        ],
        correct: 0,
        hint: "빛은 거울에 부딪혀도 사라지지 않고, 방향만 바뀌어 계속 직선으로 나아가요.",
        wrongTags: {
          1: "overgeneralization",
          2: "literal_meaning",
        },
      },
    ],
    prerequisites: [],
    isBonus: true,
  },
  sci_hyeonggwang: {
    id: "sci_hyeonggwang",
    term: "형광",
    subject: "光 시리즈 · 보너스",
    difficulty: "보통",
    hanja: [
      { sound: "형", meaning: "반딧불이" },
      { sound: "광", meaning: "빛" },
    ],
    easyMeaning: "물질이 빛을 흡수했다가 곧바로 다른 빛으로 내보내는 현상",
    example: "형광펜으로 칠한 부분에 특수한 빛을 비추면 더 밝게 빛나 보여요. 빛을 흡수하고 즉시 다른 빛으로 내보내기 때문이에요.",
    quiz: [
      {
        q: "형광과 야광의 차이는 무엇일까요?",
        options: [
          "형광은 빛을 흡수하면 곧바로 내보내고, 야광은 흡수한 빛을 저장해뒀다가 천천히 내보낸다",
          "형광과 야광은 완전히 같은 현상이다",
          "형광은 밤에만, 야광은 낮에만 일어난다",
        ],
        correct: 0,
        hint: '"螢(반딧불이)"처럼 빛을 받는 즉시 반응해서 빛난다는 점에 주목해보세요.',
        wrongTags: {
          1: "overgeneralization",
          2: "literal_meaning",
        },
      },
      {
        q: "형광 현상을 활용한 예시는?",
        options: [
          "형광펜, 형광등",
          "거울에 비친 그림자",
          "프리즘을 통과한 무지개",
        ],
        correct: 0,
        hint: "형광등과 형광펜은 빛을 흡수해서 곧바로 다른 빛(주로 밝은 빛)으로 바꿔 내보내요.",
        wrongTags: {
          1: "overgeneralization",
          2: "overgeneralization",
        },
      },
    ],
    prerequisites: [],
    isBonus: true,
  },
  sci_gwangbok: {
    id: "sci_gwangbok",
    term: "광복",
    subject: "光 시리즈 · 보너스",
    difficulty: "보통",
    hanja: [
      { sound: "광", meaning: "빛" },
      { sound: "복", meaning: "되찾다" },
    ],
    easyMeaning: "빼앗긴 나라의 주권과 자유를 다시 되찾는 것",
    example: "1945년, 우리나라는 일본의 지배에서 벗어나 나라의 주권을 다시 되찾았어요. 이날을 광복절이라고 부르며 기념해요.",
    quiz: [
      {
        q: "광복이 일어나면 무엇을 되찾을까요?",
        options: [
          "나라의 주권과 자유",
          "밝은 전등",
          "잃어버린 물건",
        ],
        correct: 0,
        hint: '"光(빛)"은 여기서 실제 전등 불빛이 아니라, "밝음·희망"을 비유하는 말로 쓰여요. 무엇이 다시 밝아진 걸까요?',
        wrongTags: {
          1: "literal_meaning",
          2: "overgeneralization",
        },
      },
      {
        q: "광복절은 어떤 날을 기념하는 날일까요?",
        options: [
          "나라의 주권을 되찾은 날",
          "전기가 처음 들어온 날",
          "태양이 가장 밝게 뜨는 날",
        ],
        correct: 0,
        hint: "광복은 '빛을 되찾음'이라는 한자 뜻이 '나라의 주권을 되찾음'이라는 의미로 비유적으로 쓰인 경우예요.",
        wrongTags: {
          1: "literal_meaning",
          2: "literal_meaning",
        },
      },
    ],
    prerequisites: [],
    isBonus: true,
  },

  // ---------- 열 · 온도 ----------
  sci_yeolpaengchang: {
    id: "sci_yeolpaengchang",
    term: "열팽창",
    subject: "과학 · 열",
    difficulty: "보통",
    hanja: [
      { sound: "열", meaning: "뜨거움" },
      { sound: "팽", meaning: "부풀다" },
      { sound: "창", meaning: "부풀다" },
    ],
    easyMeaning: "물질이 열을 받으면 부피가 늘어나는 것",
    example:
      "여름철 기찻길은 철로 사이에 틈을 두고 깔아요. 더우면 철이 늘어나는데(열팽창), 틈이 없으면 철로가 휘어버리기 때문이에요.",
    quiz: [
      {
        q: "열팽창이 일어나면 물질의 무엇이 커질까요?",
        options: ["부피", "무게", "색깔"],
        correct: 0,
        hint: '"팽창"은 부풀어 오른다는 뜻이에요. 무엇이 늘어날까요?',
        wrongTags: { 1: "literal_meaning", 2: "literal_meaning" },
      },
      {
        q: "다음 중 열팽창 때문에 생기는 일은?",
        options: [
          "더운 날 다리 이음새 틈이 좁아진다",
          "물이 끓어 수증기가 된다",
          "겨울에 호수 표면이 언다",
        ],
        correct: 0,
        hint: "열을 받아 길이나 부피가 늘어나는 예를 떠올려보세요.",
        wrongTags: { 1: "overgeneralization", 2: "cause_effect_reversal" },
      },
    ],
    prerequisites: [],
  },
  sci_biyeol: {
    id: "sci_biyeol",
    term: "비열",
    subject: "과학 · 열",
    difficulty: "보통",
    hanja: [
      { sound: "비", meaning: "견주다" },
      { sound: "열", meaning: "열" },
    ],
    easyMeaning: "어떤 물질 1g의 온도를 1도 올리는 데 필요한 열의 양",
    example:
      "물은 비열이 커서 잘 데워지지도, 잘 식지도 않아요. 그래서 한낮에도 바닷물은 모래보다 시원해요.",
    quiz: [
      {
        q: "비열이 큰 물질의 특징은?",
        options: ["온도가 천천히 변한다", "온도가 빨리 변한다", "온도가 절대 안 변한다"],
        correct: 0,
        hint: "비열이 크면 데우는 데 열이 많이 필요해요. 그만큼 온도가 어떻게 변할까요?",
        wrongTags: { 1: "cause_effect_reversal", 2: "overgeneralization" },
      },
      {
        q: "물의 비열이 큰 덕분에 생기는 일은?",
        options: [
          "바닷가 기온이 급격히 변하지 않는다",
          "물이 아주 빨리 끓는다",
          "물이 아주 빨리 언다",
        ],
        correct: 0,
        hint: "비열이 크면 온도 변화가 느리다는 점을 떠올려보세요.",
        wrongTags: { 1: "cause_effect_reversal", 2: "cause_effect_reversal" },
      },
    ],
    prerequisites: [],
  },
  sci_yeoljeondoyul: {
    id: "sci_yeoljeondoyul",
    term: "열전도율",
    subject: "과학 · 열",
    difficulty: "보통",
    hanja: [
      { sound: "열", meaning: "열" },
      { sound: "전", meaning: "전하다" },
      { sound: "도", meaning: "이끌다" },
      { sound: "율", meaning: "비율" },
    ],
    easyMeaning: "열이 물질을 통해 전달되는 빠르기(정도)",
    example:
      "금속 숟가락을 뜨거운 국에 담그면 손잡이까지 금방 뜨거워져요. 금속은 열전도율이 높아 열이 빠르게 전달되기 때문이에요.",
    quiz: [
      {
        q: "열전도율이 가장 높은 물질은?",
        options: ["금속", "나무", "플라스틱"],
        correct: 0,
        hint: "뜨거운 국에 넣으면 손잡이까지 빨리 뜨거워지는 게 무엇일까요?",
        wrongTags: { 1: "overgeneralization", 2: "overgeneralization" },
      },
      {
        q: "냄비 손잡이를 플라스틱으로 만드는 이유는?",
        options: [
          "열전도율이 낮아 잘 뜨거워지지 않아서",
          "열전도율이 높아 빨리 식어서",
          "그냥 가볍기만 해서",
        ],
        correct: 0,
        hint: "손이 데지 않으려면 열이 잘 전달되지 않아야겠죠?",
        wrongTags: { 1: "cause_effect_reversal", 2: "literal_meaning" },
      },
    ],
    prerequisites: [],
  },
  sci_bimetal: {
    id: "sci_bimetal",
    term: "바이메탈",
    subject: "과학 · 열",
    difficulty: "보통",
    hanja: [
      { sound: "바이", meaning: "둘" },
      { sound: "메탈", meaning: "금속" },
    ],
    easyMeaning: "열팽창 정도가 다른 두 금속을 붙여, 온도에 따라 휘어지는 장치",
    example:
      "화재경보기 속 바이메탈은 뜨거워지면 한쪽 금속이 더 많이 늘어나 휘어져요. 그 휘어짐으로 전기를 연결해 경보를 울려요.",
    quiz: [
      {
        q: "바이메탈은 무엇으로 만들까요?",
        options: ["열팽창이 다른 두 금속", "똑같은 금속 두 개", "금속과 플라스틱"],
        correct: 0,
        hint: '"바이"는 둘이라는 뜻. 핵심은 두 금속이 늘어나는 정도가 달라야 한다는 거예요.',
        wrongTags: { 1: "literal_meaning", 2: "overgeneralization" },
      },
      {
        q: "바이메탈이 뜨거워지면 어떻게 될까요?",
        options: ["한쪽이 더 늘어나 휜다", "두 금속이 똑같이 늘어 곧게 있다", "두 금속이 줄어든다"],
        correct: 0,
        hint: "두 금속의 열팽창 정도가 다르다는 점을 떠올려보세요.",
        wrongTags: { 1: "cause_effect_reversal", 2: "literal_meaning" },
      },
    ],
    prerequisites: [],
  },
  sci_yeollyang: {
    id: "sci_yeollyang",
    term: "열량",
    subject: "과학 · 열",
    difficulty: "보통",
    hanja: [
      { sound: "열", meaning: "열" },
      { sound: "량", meaning: "양" },
    ],
    easyMeaning: "어떤 물체가 주고받는 열의 양",
    example:
      "같은 불에 올려도 물이 많을수록 끓이는 데 필요한 열량이 더 커요. 데울 양이 많으니까요.",
    quiz: [
      {
        q: "열량은 무엇을 나타낼까요?",
        options: ["주고받는 열의 양", "물체의 온도", "물체의 색깔"],
        correct: 0,
        hint: '"량(量)"은 양, 분량이라는 뜻이에요.',
        wrongTags: { 1: "literal_meaning", 2: "literal_meaning" },
      },
      {
        q: "같은 온도만큼 올릴 때 열량이 더 많이 필요한 경우는?",
        options: ["양이 많은 물", "양이 적은 물", "둘 다 똑같다"],
        correct: 0,
        hint: "데울 양이 많으면 그만큼 열도 더 들겠죠?",
        wrongTags: { 1: "cause_effect_reversal", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
  sci_paengchang: {
    id: "sci_paengchang",
    term: "팽창",
    subject: "과학 · 열",
    difficulty: "쉬움",
    hanja: [
      { sound: "팽", meaning: "부풀다" },
      { sound: "창", meaning: "부풀다" },
    ],
    easyMeaning: "부피가 늘어나 커지는 것",
    example:
      "풍선에 바람을 더 불어넣거나 공기를 데우면 부피가 늘어나며 팽창해요.",
    quiz: [
      {
        q: "팽창은 무엇이 일어나는 것일까요?",
        options: ["부피가 커진다", "부피가 줄어든다", "색이 변한다"],
        correct: 0,
        hint: "두 글자 모두 '부풀다'라는 뜻이에요.",
        wrongTags: { 1: "literal_meaning", 2: "literal_meaning" },
      },
      {
        q: "다음 중 팽창의 예는?",
        options: ["공기를 데우니 부피가 커졌다", "그릇에 물을 가만히 따랐다", "종이를 반으로 접었다"],
        correct: 0,
        hint: "부피가 커지는 경우를 골라보세요.",
        wrongTags: { 1: "overgeneralization", 2: "literal_meaning" },
      },
    ],
    prerequisites: [],
  },
  sci_suchuk: {
    id: "sci_suchuk",
    term: "수축",
    subject: "과학 · 열",
    difficulty: "쉬움",
    hanja: [
      { sound: "수", meaning: "거두다" },
      { sound: "축", meaning: "줄어들다" },
    ],
    easyMeaning: "부피가 줄어들어 작아지는 것",
    example:
      "따뜻한 곳에 있던 풍선을 찬 곳에 두면, 속 공기가 식어 부피가 줄며 수축해요.",
    quiz: [
      {
        q: "수축은 무엇이 일어나는 것일까요?",
        options: ["부피가 줄어든다", "부피가 커진다", "무게가 늘어난다"],
        correct: 0,
        hint: '"축(縮)"은 줄어든다는 뜻이에요.',
        wrongTags: { 1: "literal_meaning", 2: "literal_meaning" },
      },
      {
        q: "팽창과 수축의 관계는?",
        options: ["서로 반대다", "똑같은 말이다", "아무 관계없다"],
        correct: 0,
        hint: "하나는 커지고, 하나는 작아져요.",
        wrongTags: { 1: "overgeneralization", 2: "literal_meaning" },
      },
    ],
    prerequisites: [],
  },
  sci_aekche: {
    id: "sci_aekche",
    term: "액체",
    subject: "과학 · 물질의 상태",
    difficulty: "쉬움",
    hanja: [
      { sound: "액", meaning: "진, 물" },
      { sound: "체", meaning: "물체" },
    ],
    easyMeaning: "부피는 일정하지만 모양은 그릇에 따라 자유롭게 변하는 상태",
    example:
      "물이나 주스는 컵 모양대로 담기지만, 양(부피)은 그대로예요. 이런 상태를 액체라고 해요.",
    quiz: [
      {
        q: "액체의 특징은?",
        options: [
          "부피는 일정하고 모양은 자유롭게 변한다",
          "부피와 모양이 모두 일정하다",
          "부피와 모양이 모두 자유롭게 변한다",
        ],
        correct: 0,
        hint: "컵에 담으면 모양은 변해도 양은 그대로죠?",
        wrongTags: { 1: "structure_order_confusion", 2: "overgeneralization" },
      },
      {
        q: "다음 중 액체는?",
        options: ["물", "공기", "얼음"],
        correct: 0,
        hint: "흐르면서 그릇 모양을 따르는 걸 골라보세요.",
        wrongTags: { 1: "location_confusion", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
  sci_giche: {
    id: "sci_giche",
    term: "기체",
    subject: "과학 · 물질의 상태",
    difficulty: "쉬움",
    hanja: [
      { sound: "기", meaning: "공기, 기운" },
      { sound: "체", meaning: "물체" },
    ],
    easyMeaning: "부피와 모양이 모두 자유롭게 변하며 공간을 가득 채우는 상태",
    example:
      "공기는 눈에 안 보이지만, 풍선이든 방이든 빈 공간을 가득 채워요. 이런 상태가 기체예요.",
    quiz: [
      {
        q: "기체의 특징은?",
        options: [
          "부피와 모양이 모두 자유롭게 변한다",
          "부피와 모양이 모두 일정하다",
          "부피만 일정하다",
        ],
        correct: 0,
        hint: "기체는 공간을 가득 채우며 사방으로 퍼져요.",
        wrongTags: { 1: "overgeneralization", 2: "structure_order_confusion" },
      },
      {
        q: "다음 중 기체는?",
        options: ["수증기", "물", "돌"],
        correct: 0,
        hint: "공기처럼 퍼지는 걸 골라보세요.",
        wrongTags: { 1: "location_confusion", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
  sci_goche: {
    id: "sci_goche",
    term: "고체",
    subject: "과학 · 물질의 상태",
    difficulty: "쉬움",
    hanja: [
      { sound: "고", meaning: "굳다" },
      { sound: "체", meaning: "물체" },
    ],
    easyMeaning: "부피와 모양이 모두 일정하게 유지되는 상태",
    example:
      "돌이나 얼음은 손에 쥐어도 모양과 크기가 그대로예요. 이런 상태를 고체라고 해요.",
    quiz: [
      {
        q: "고체의 특징은?",
        options: [
          "부피와 모양이 모두 일정하다",
          "모양이 자유롭게 변한다",
          "공간을 가득 채운다",
        ],
        correct: 0,
        hint: '"고(固)"는 굳어서 단단하다는 뜻이에요.',
        wrongTags: { 1: "overgeneralization", 2: "overgeneralization" },
      },
      {
        q: "다음 중 고체는?",
        options: ["나무 블록", "우유", "수증기"],
        correct: 0,
        hint: "모양이 변하지 않고 단단한 걸 골라보세요.",
        wrongTags: { 1: "location_confusion", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },

  sci_bupi: {
    id: "sci_bupi",
    term: "부피",
    subject: "과학 · 물질",
    difficulty: "쉬움",
    hanja: [{ sound: "부피", meaning: "차지하는 공간의 크기" }],
    easyMeaning: "물체가 차지하는 공간의 크기",
    example:
      "같은 컵이라도 물을 가득 담으면 부피가 크고, 조금 담으면 부피가 작아요. 공기를 데우면 부피가 늘어나기도 해요.",
    quiz: [
      {
        q: "부피는 무엇을 나타낼까요?",
        options: ["물체가 차지하는 공간의 크기", "물체의 무게", "물체의 색깔"],
        correct: 0,
        hint: "공간을 얼마나 차지하는지를 말해요.",
        wrongTags: { 1: "literal_meaning", 2: "literal_meaning" },
      },
      {
        q: "공기를 데우면 부피는 어떻게 될까요?",
        options: ["늘어난다", "줄어든다", "변하지 않는다"],
        correct: 0,
        hint: "열팽창을 떠올려보세요.",
        wrongTags: { 1: "cause_effect_reversal", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },

  // ---------- 생태 · 생물 ----------
  sci_seosikji: {
    id: "sci_seosikji",
    term: "서식지",
    subject: "과학 · 생태",
    difficulty: "쉬움",
    hanja: [
      { sound: "서", meaning: "깃들다" },
      { sound: "식", meaning: "쉬다" },
      { sound: "지", meaning: "땅" },
    ],
    easyMeaning: "생물이 살아가는 장소",
    example:
      "북극곰의 서식지는 얼음이 많은 북극이에요. 그 얼음이 녹아 사라지면 살 곳을 잃어요.",
    quiz: [
      {
        q: "서식지는 무엇일까요?",
        options: ["생물이 살아가는 장소", "생물이 먹는 먹이", "생물의 이름"],
        correct: 0,
        hint: '"지(地)"는 땅, 장소를 뜻해요.',
        wrongTags: { 1: "literal_meaning", 2: "literal_meaning" },
      },
      {
        q: "서식지가 파괴되면 생물은 어떻게 될까요?",
        options: ["살 곳을 잃어 위험해진다", "오히려 더 빨리 번식한다", "아무 영향이 없다"],
        correct: 0,
        hint: "살아갈 장소가 사라지면 어떻게 될까요?",
        wrongTags: { 1: "cause_effect_reversal", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
  sci_myeoljong: {
    id: "sci_myeoljong",
    term: "멸종",
    subject: "과학 · 생태",
    difficulty: "보통",
    hanja: [
      { sound: "멸", meaning: "없어지다" },
      { sound: "종", meaning: "종류" },
    ],
    easyMeaning: "한 종류의 생물이 지구에서 완전히 사라지는 것",
    example:
      "공룡은 아주 오래전에 멸종해서, 지금은 화석으로만 볼 수 있어요.",
    quiz: [
      {
        q: "멸종은 무엇이 사라지는 걸까요?",
        options: ["한 종류의 생물 전체", "한 마리의 생물", "생물의 서식지만"],
        correct: 0,
        hint: '"종(種)"은 생물의 종류를 뜻해요.',
        wrongTags: { 1: "literal_meaning", 2: "location_confusion" },
      },
      {
        q: "멸종을 막으려면 무엇이 도움이 될까요?",
        options: ["서식지를 보호한다", "사냥을 더 늘린다", "외래종을 더 들여온다"],
        correct: 0,
        hint: "생물이 살 곳과 환경을 지켜야겠죠?",
        wrongTags: { 1: "cause_effect_reversal", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
  sci_tochaksaengmul: {
    id: "sci_tochaksaengmul",
    term: "토착생물",
    subject: "과학 · 생태",
    difficulty: "보통",
    hanja: [
      { sound: "토", meaning: "흙, 땅" },
      { sound: "착", meaning: "붙다" },
      { sound: "생물", meaning: "살아있는 것" },
    ],
    easyMeaning: "원래부터 그 지역에 살아온 생물",
    example:
      "우리나라 하천의 쉬리 같은 물고기는 오래전부터 그곳에 살아온 토착생물이에요.",
    quiz: [
      {
        q: "토착생물은 어떤 생물일까요?",
        options: ["원래부터 그곳에 살던 생물", "다른 곳에서 새로 들어온 생물", "이미 멸종한 생물"],
        correct: 0,
        hint: '"토착"은 그 땅에 붙어(着) 살아왔다는 뜻이에요.',
        wrongTags: { 1: "overgeneralization", 2: "literal_meaning" },
      },
      {
        q: "토착생물과 반대되는 말은?",
        options: ["외래종", "멸종", "서식지"],
        correct: 0,
        hint: "밖에서 들어온 생물을 뭐라고 부를까요?",
        wrongTags: { 1: "overgeneralization", 2: "location_confusion" },
      },
    ],
    prerequisites: [],
  },
  sci_saengmuldayangseong: {
    id: "sci_saengmuldayangseong",
    term: "생물다양성",
    subject: "과학 · 생태",
    difficulty: "보통",
    hanja: [
      { sound: "생물", meaning: "살아있는 것" },
      { sound: "다", meaning: "많다" },
      { sound: "양", meaning: "모양" },
      { sound: "성", meaning: "성질" },
    ],
    easyMeaning: "한 지역에 여러 종류의 생물이 풍부하게 사는 정도",
    example:
      "열대우림에는 수많은 동식물이 어울려 살아요. 생물다양성이 아주 높은 곳이에요.",
    quiz: [
      {
        q: "생물다양성이 높다는 건 무슨 뜻일까요?",
        options: ["여러 종류의 생물이 많다", "한 종류만 아주 많다", "생물이 거의 없다"],
        correct: 0,
        hint: '"다양(多樣)"은 종류가 많고 가지각색이라는 뜻이에요.',
        wrongTags: { 1: "overgeneralization", 2: "literal_meaning" },
      },
      {
        q: "생물다양성이 높으면 생태계는 어떨까요?",
        options: ["더 안정적이다", "쉽게 무너진다", "변화가 전혀 없다"],
        correct: 0,
        hint: "종류가 많으면 한쪽이 줄어도 서로 빈자리를 메워줄 수 있어요.",
        wrongTags: { 1: "cause_effect_reversal", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
  sci_saengtaegyepyeonghyeong: {
    id: "sci_saengtaegyepyeonghyeong",
    term: "생태계평형",
    subject: "과학 · 생태",
    difficulty: "보통",
    hanja: [
      { sound: "생태계", meaning: "생물과 환경의 체계" },
      { sound: "평", meaning: "고르다" },
      { sound: "형", meaning: "균형" },
    ],
    easyMeaning: "생물의 수와 종류가 크게 변하지 않고 균형을 이루는 상태",
    example:
      "토끼가 늘면 여우도 늘어 토끼를 잡아먹고, 다시 수가 맞춰져요. 이런 안정 상태가 생태계평형이에요.",
    quiz: [
      {
        q: "생태계평형이란 무엇일까요?",
        options: [
          "생물 수와 종류가 균형을 이룬 상태",
          "한 생물만 계속 늘어나는 상태",
          "모든 생물이 사라진 상태",
        ],
        correct: 0,
        hint: '"평형(平衡)"은 저울처럼 균형이 맞는 것을 말해요.',
        wrongTags: { 1: "overgeneralization", 2: "overgeneralization" },
      },
      {
        q: "생태계평형이 깨지는 경우는?",
        options: ["외래종이 갑자기 크게 늘어날 때", "계절이 바뀔 때", "낮과 밤이 바뀔 때"],
        correct: 0,
        hint: "자연스러운 반복이 아니라, 균형을 무너뜨리는 사건을 골라보세요.",
        wrongTags: { 1: "overgeneralization", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
  sci_oeraejong: {
    id: "sci_oeraejong",
    term: "외래종",
    subject: "과학 · 생태",
    difficulty: "보통",
    hanja: [
      { sound: "외", meaning: "바깥" },
      { sound: "래", meaning: "오다" },
      { sound: "종", meaning: "종류" },
    ],
    easyMeaning: "원래 살던 곳이 아닌 다른 지역에서 들어온 생물 종",
    example:
      "황소개구리는 외국에서 들어온 외래종이에요. 토종 생물을 잡아먹어 생태계평형을 깨기도 해요.",
    quiz: [
      {
        q: "외래종은 어떤 생물일까요?",
        options: ["밖에서 들어온 생물 종", "원래부터 살던 생물", "이미 멸종한 생물"],
        correct: 0,
        hint: '"외래(外來)"는 바깥에서 왔다는 뜻이에요.',
        wrongTags: { 1: "overgeneralization", 2: "literal_meaning" },
      },
      {
        q: "외래종이 문제가 되는 이유는?",
        options: [
          "토착생물을 위협해 생태계평형을 깬다",
          "생물다양성을 항상 높여준다",
          "아무런 영향이 없다",
        ],
        correct: 0,
        hint: "천적이 없으면 너무 늘어나 토종을 위협할 수 있어요.",
        wrongTags: { 1: "overgeneralization", 2: "overgeneralization" },
      },
    ],
    prerequisites: [],
  },
};

const TREE_ORDER = [
  "sci_byeonyi",
  "sci_saengtaegye",
  "sci_beonsik",
  "sci_wonhaek_saengmul",
  "sci_gyungye",
  "sci_jong_bunhwa",
  "sci_photosynthesis",
];

const BONUS_ORDER = ["sci_yagwang", "sci_gwangseon", "sci_hyeonggwang", "sci_gwangbok"];

const HEAT_ORDER = [
  "sci_yeolpaengchang",
  "sci_biyeol",
  "sci_yeoljeondoyul",
  "sci_bimetal",
  "sci_yeollyang",
  "sci_paengchang",
  "sci_suchuk",
  "sci_bupi",
  "sci_aekche",
  "sci_giche",
  "sci_goche",
];

const ECO_ORDER = [
  "sci_seosikji",
  "sci_myeoljong",
  "sci_tochaksaengmul",
  "sci_saengmuldayangseong",
  "sci_saengtaegyepyeonghyeong",
  "sci_oeraejong",
];

const DIFF_COLOR: Record<string, { bg: string; fg: string }> = {
  쉬움: { bg: "var(--color-background-success)", fg: "var(--color-text-success)" },
  보통: { bg: "var(--color-background-info)", fg: "var(--color-text-info)" },
  어려움: { bg: "var(--color-background-danger)", fg: "var(--color-text-danger)" },
};

export const TAG_LABELS: Record<string, { title: string; desc: string }> = {
  literal_meaning: {
    title: "글자 그대로 해석하는 경향",
    desc: "한자의 본래 뜻에서 한 걸음 더 나아가, 비유적으로 쓰이는 경우를 연습해봐요.",
  },
  location_confusion: {
    title: "장소·위치 혼동",
    desc: "어떤 일이 '어디서' 일어나는지에 좀 더 주의를 기울여봐요.",
  },
  cause_effect_reversal: {
    title: "원인과 결과 혼동",
    desc: "무엇이 먼저 일어나고, 그 결과로 무엇이 일어나는지 순서를 다시 떠올려봐요.",
  },
  overgeneralization: {
    title: "과도한 일반화",
    desc: "한 곳에서 배운 규칙을 다른 경우에도 그대로 적용하지 않는지 확인해봐요.",
  },
  structure_order_confusion: {
    title: "흐름의 순서 혼동",
    desc: "재료 → 과정 → 결과의 순서를 다시 한번 짚어봐요.",
  },
};

// ---------- 작은 컴포넌트 ----------
function DiffBadge({ diff }: { diff: Difficulty }) {
  const c = DIFF_COLOR[diff] || DIFF_COLOR["보통"];
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 12, padding: "3px 8px", borderRadius: "var(--border-radius-md)", fontWeight: 500 }}>
      {diff}
    </span>
  );
}

// ---------- 화면: 지식 트리 ----------
function ConceptCard({ id, progress, onSelect }: { id: string; progress: Progress; onSelect: (id: string) => void }) {
  const c = CONCEPTS[id];
  const done = progress[id]?.done;
  const locked = c.prerequisites.some((p) => !progress[p]?.done);
  return (
    <div
      onClick={() => !locked && onSelect(id)}
      style={{
        position: "relative",
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.5 : 1,
        transition: "transform 0.12s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{c.subject}</span>
        {done ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-text-success)" }}>
            <i className="ti ti-check" style={{ fontSize: 14 }} aria-hidden="true"></i> 완료 · {progress[id]?.score}점
          </span>
        ) : locked ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-text-tertiary)" }}>
            <i className="ti ti-lock" style={{ fontSize: 14 }} aria-hidden="true"></i> 잠김
          </span>
        ) : (
          <DiffBadge diff={c.difficulty} />
        )}
      </div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>{c.term}</p>
      {locked && (
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "4px 0 0" }}>
          {c.prerequisites.map((p) => CONCEPTS[p].term).join(", ")} 완료 후 열려요
        </p>
      )}
    </div>
  );
}

function TreeScreen({ progress, onSelect, onReport }: { progress: Progress; onSelect: (id: string) => void; onReport: () => void }) {
  const bonusDone = BONUS_ORDER.filter((id) => progress[id]?.done).length;
  const heatDone = HEAT_ORDER.filter((id) => progress[id]?.done).length;
  const ecoDone = ECO_ORDER.filter((id) => progress[id]?.done).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>중1 과학 한자개념어</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
            완료한 개념어: {Object.values(progress).filter((p) => p.done).length} / {TREE_ORDER.length + HEAT_ORDER.length + ECO_ORDER.length + BONUS_ORDER.length}
          </p>
        </div>
        <button onClick={onReport} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <i className="ti ti-chart-bar" style={{ fontSize: 16 }} aria-hidden="true"></i> 리포트
        </button>
      </div>

      {TREE_ORDER.map((id) => (
        <ConceptCard key={id} id={id} progress={progress} onSelect={onSelect} />
      ))}

      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 16, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 500, flexShrink: 0 }}>
            열
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>열 · 물질</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              {heatDone} / {HEAT_ORDER.length} 완료
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {HEAT_ORDER.map((id) => (
            <ConceptCard key={id} id={id} progress={progress} onSelect={onSelect} />
          ))}
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 16, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 500, flexShrink: 0 }}>
            생
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>생태 · 생물</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              {ecoDone} / {ECO_ORDER.length} 완료
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ECO_ORDER.map((id) => (
            <ConceptCard key={id} id={id} progress={progress} onSelect={onSelect} />
          ))}
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 16, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 500, flexShrink: 0 }}>
            광
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>光 시리즈 · 보너스</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              {bonusDone} / {BONUS_ORDER.length} 완료 · 자유롭게 선택하세요
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {BONUS_ORDER.map((id) => (
            <ConceptCard key={id} id={id} progress={progress} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- 화면: 1단계 (글자-뜻 매칭) ----------
function Stage1({ concept, onComplete }: { concept: Concept; onComplete: (score: number) => void }) {
  const pairs = concept.hanja;
  const [shuffled] = useState(() =>
    pairs.map((p, i) => ({ meaning: p.meaning, i })).sort(() => Math.random() - 0.5)
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("글자 카드를 선택하세요");
  const [score, setScore] = useState(0);

  const cols = pairs.length <= 2 ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))";

  function pickRune(i: number) {
    if (solved.has(i)) return;
    setSelected(i);
    setFeedback("이제 알맞은 뜻 카드를 골라보세요");
  }

  function pickMeaning(i: number) {
    if (selected === null || solved.has(i)) return;
    if (selected === i) {
      const next = new Set(solved);
      next.add(i);
      setSolved(next);
      setScore((s) => s + 10);
      setFeedback(next.size === pairs.length ? "1단계 완료!" : "정답! +10점");
      if (next.size === pairs.length) {
        setTimeout(() => onComplete(score + 10), 600);
      }
    } else {
      setShake(i);
      setFeedback("다시 생각해볼까?");
      setTimeout(() => setShake(null), 200);
    }
    setSelected(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DiffBadge diff={concept.difficulty} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{concept.term}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-bolt" style={{ fontSize: 18, color: "var(--color-text-warning)" }} aria-hidden="true"></i>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{score}</span>
        </div>
      </div>

      <p style={{ fontSize: 14, margin: 0, textAlign: "center", color: "var(--color-text-secondary)" }}>
        글자 카드를 먼저 누른 뒤, 알맞은 뜻 카드를 누르세요
      </p>

      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8 }}>
        {pairs.map((p, i) => (
          <div
            key={"r" + i}
            onClick={() => pickRune(i)}
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "var(--border-radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: solved.has(i) ? "default" : "pointer",
              background: "var(--color-background-secondary)",
              border: selected === i ? "2px solid #BA7517" : "2px solid var(--color-border-secondary)",
              boxShadow: selected === i ? "0 0 0 3px rgba(186,117,23,0.18)" : "none",
              opacity: solved.has(i) ? 0.35 : 1,
              transition: "transform 0.12s, border-color 0.12s, box-shadow 0.12s, opacity 0.2s",
            }}
          >
            <span style={{ position: "absolute", top: 6, left: 8, fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: "var(--color-background-warning)", color: "var(--color-text-warning)" }}>
              글자
            </span>
            <span style={{ fontSize: 26, fontWeight: 500 }}>{p.sound}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8 }}>
        {shuffled.map((m) => (
          <div
            key={"m" + m.i}
            onClick={() => pickMeaning(m.i)}
            style={{
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
              borderRadius: "var(--border-radius-lg)",
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              cursor: solved.has(m.i) ? "default" : "pointer",
              fontSize: 15,
              fontWeight: 500,
              textAlign: "center",
              opacity: solved.has(m.i) ? 0.35 : 1,
              animation: shake === m.i ? "shake 0.2s ease" : "none",
              transition: "opacity 0.2s",
            }}
          >
            {m.meaning}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 500, minHeight: 20, color: feedback.startsWith("정답") || feedback.includes("완료") ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
        {feedback}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ---------- 화면: 추측 + 뜻 공개 ----------
function GuessReveal({ concept, onContinue }: { concept: Concept; onContinue: () => void }) {
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);

  const hanjaStr = concept.hanja.map((h) => `${h.sound}(${h.meaning})`).join(" + ");

  return (
    <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <i className="ti ti-check" style={{ fontSize: 18, color: "var(--color-text-success)" }} aria-hidden="true"></i>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-success)" }}>1단계 완료</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        {concept.hanja.map((h, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ fontSize: 18, color: "var(--color-text-tertiary)" }}>+</span>}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 26, fontWeight: 500 }}>{h.sound}</span>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{h.meaning}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {!revealed ? (
        <>
          <p style={{ fontSize: 14, margin: "0 0 4px", textAlign: "center" }}>
            &quot;{hanjaStr}&quot; — {concept.term}은 무슨 뜻일까요? 짧게 추측해서 써보세요
          </p>
          <textarea
            rows={2}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="추측한 뜻을 적어보세요"
            style={{ width: "100%", resize: "none", padding: 10, fontSize: 14, boxSizing: "border-box" }}
          />
          <button style={{ width: "100%" }} onClick={() => setRevealed(true)}>
            내 추측 확인하기 <i className="ti ti-arrow-right" aria-hidden="true" style={{ marginLeft: 4 }}></i>
          </button>
        </>
      ) : (
        <>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: 10, fontSize: 13, color: "var(--color-text-secondary)" }}>
            <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>내 추측: </span>
            {guess.trim() || "(입력 안 함)"}
          </div>

          <div style={{ background: "var(--color-background-info)", borderRadius: "var(--border-radius-md)", padding: 12 }}>
            <p style={{ fontSize: 14, margin: 0, textAlign: "center", color: "var(--color-text-info)" }}>{concept.easyMeaning}</p>
          </div>

          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 10 }}>
            <p style={{ fontSize: 13, margin: 0 }}>{concept.example}</p>
          </div>

          <button style={{ width: "100%" }} onClick={onContinue}>
            그려보기 <i className="ti ti-arrow-right" aria-hidden="true" style={{ marginLeft: 4 }}></i>
          </button>
        </>
      )}
    </div>
  );
}

// ---------- 화면: 2단계 (구조 퍼즐) ----------
function Stage2({ concept, baseScore, onComplete, onWrongTag }: { concept: Concept; baseScore: number; onComplete: (score: number) => void; onWrongTag: (tag: string) => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(baseScore);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [feedback, setFeedback] = useState("");

  const q = concept.quiz[qIndex];
  const total = concept.quiz.length;

  // 보기 순서를 문제마다 섞는다(정답이 항상 같은 자리에 오지 않도록).
  // 원래 인덱스를 그대로 넘기므로 correct/wrongTags 매핑은 영향받지 않는다.
  const order = useMemo(() => {
    const idx = concept.quiz[qIndex].options.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [concept, qIndex]);

  function pick(i: number) {
    if (status !== "idle") return;
    setSelectedIdx(i);
    if (i === q.correct) {
      setStatus("correct");
      setScore((s) => s + 15);
      setFeedback("정답! +15점");
      setTimeout(() => {
        if (qIndex + 1 < total) {
          setQIndex((prev) => prev + 1);
          setSelectedIdx(null);
          setStatus("idle");
          setFeedback("");
        } else {
          onComplete(score + 15);
        }
      }, 700);
    } else {
      setStatus("wrong");
      setFeedback(q.hint);
      if (q.wrongTags && q.wrongTags[i]) {
        onWrongTag(q.wrongTags[i]);
      }
      setTimeout(() => {
        setSelectedIdx(null);
        setStatus("idle");
        setFeedback("");
      }, 1400);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DiffBadge diff={concept.difficulty} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{concept.term} · 2단계</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-bolt" style={{ fontSize: 18, color: "var(--color-text-warning)" }} aria-hidden="true"></i>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{score}</span>
        </div>
      </div>

      <div style={{ width: "100%", height: 6, background: "var(--color-background-secondary)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: Math.round((qIndex / total) * 100) + "%", height: "100%", background: "var(--color-text-success)", transition: "width 0.3s" }} />
      </div>

      <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>구조 퍼즐</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{qIndex + 1} / {total}</span>
        </div>
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 14, margin: 0 }}>{q.q}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {order.map((origIdx) => {
            let bg = "";
            let fg = "";
            if (status !== "idle" && selectedIdx === origIdx) {
              if (status === "correct") {
                bg = "var(--color-background-success)";
                fg = "var(--color-text-success)";
              } else {
                bg = "var(--color-background-danger)";
                fg = "var(--color-text-danger)";
              }
            }
            return (
              <button
                key={origIdx}
                disabled={status !== "idle"}
                onClick={() => pick(origIdx)}
                style={{ width: "100%", textAlign: "left", padding: 12, background: bg, color: fg }}
              >
                {q.options[origIdx]}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 500, minHeight: 18, color: status === "correct" ? "var(--color-text-success)" : status === "wrong" ? "var(--color-text-danger)" : "var(--color-text-secondary)" }}>
        {feedback}
      </div>
    </div>
  );
}

// ---------- 화면: 4단계 (설명 챌린지) ----------
function Stage4({ concept, baseScore, onComplete }: { concept: Concept; baseScore: number; onComplete: (score: number) => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ passed: boolean; matched: number; total: number } | null>(null);
  const keywords = concept.explanation!.keywords;

  function containsKeyword(t: string, kw: string) {
    if (t.indexOf(kw) !== -1) return true;
    if (kw === "결합") return t.indexOf("합") !== -1 || t.indexOf("합쳐") !== -1;
    return false;
  }

  const matchedSet = new Set(keywords.filter((kw) => containsKeyword(text, kw)));

  function submit() {
    const matched = matchedSet.size;
    const passed = matched >= concept.explanation!.minRequired;
    setResult({ passed, matched, total: keywords.length });
  }

  const stars = result
    ? result.matched >= keywords.length - 1
      ? 3
      : result.matched >= concept.explanation!.minRequired + 1
      ? 2
      : 1
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DiffBadge diff={concept.difficulty} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{concept.term} · 최종 챌린지</span>
        </div>
        <span style={{ background: "var(--color-background-warning)", color: "var(--color-text-warning)", fontSize: 12, padding: "4px 10px", borderRadius: "var(--border-radius-md)", fontWeight: 500 }}>
          보스
        </span>
      </div>

      <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "1rem 1.25rem" }}>
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 14, margin: 0 }}>{concept.term}이란 무엇인지, 한자의 뜻을 이용해 직접 설명해보세요</p>
        </div>

        <textarea
          rows={3}
          value={text}
          disabled={!!result}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 빛을 이용해서..."
          style={{ width: "100%", resize: "none", padding: 10, fontSize: 14, boxSizing: "border-box" }}
        />

        <div style={{ display: "flex", gap: 8, margin: "10px 0 14px", flexWrap: "wrap" }}>
          {keywords.map((kw) => {
            const found = matchedSet.has(kw);
            return (
              <span
                key={kw}
                style={{
                  background: found ? "var(--color-background-success)" : "var(--color-background-secondary)",
                  color: found ? "var(--color-text-success)" : "var(--color-text-tertiary)",
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: "var(--border-radius-md)",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {kw}
              </span>
            );
          })}
        </div>

        {!result ? (
          <button style={{ width: "100%" }} onClick={submit} disabled={!text.trim()}>
            제출하고 채점받기 <i className="ti ti-send" aria-hidden="true" style={{ marginLeft: 4 }}></i>
          </button>
        ) : result.passed ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="ti ti-check" style={{ fontSize: 18, color: "var(--color-text-success)" }} aria-hidden="true"></i>
              <span style={{ color: "var(--color-text-success)", fontWeight: 500 }}>{concept.term} 마스터! +50점</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              {[0, 1, 2].map((i) => (
                <i
                  key={i}
                  className={"ti " + (i < stars ? "ti-star" : "ti-star-off")}
                  style={{ fontSize: 18, color: "var(--color-text-warning)" }}
                  aria-hidden="true"
                ></i>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
              한자의 뜻과 개념을 잘 연결했어요. 핵심 키워드 {result.matched}/{result.total}개 포함!
            </p>
            <button style={{ width: "100%" }} onClick={() => onComplete(baseScore + 50)}>
              완료하기 <i className="ti ti-arrow-right" aria-hidden="true" style={{ marginLeft: 4 }}></i>
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: "var(--color-text-danger)", margin: "0 0 12px", fontSize: 13 }}>
              조금만 더! 한자의 뜻을 다시 떠올려 설명을 보충해볼까요? ({result.matched}/{result.total}개 포함)
            </p>
            <button style={{ width: "100%" }} onClick={() => setResult(null)}>
              다시 작성하기 <i className="ti ti-refresh" aria-hidden="true" style={{ marginLeft: 4 }}></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- 화면: 학습 리포트 ----------
function ReportScreen({ progress, wrongTagCounts, onBack, onReset }: { progress: Progress; wrongTagCounts: WrongTagCounts; onBack: () => void; onReset: () => void }) {
  const doneEntries = Object.entries(progress).filter(([, p]) => p.done);
  const totalScore = doneEntries.reduce((sum, [, p]) => sum + p.score, 0);

  const tagEntries = Object.entries(wrongTagCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "1rem 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} aria-label="뒤로 가기" style={{ padding: "6px 10px" }}>
          <i className="ti ti-arrow-left" aria-hidden="true"></i>
        </button>
        <h2 style={{ margin: 0 }}>학습 리포트</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem" }}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>학습한 개념어</p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{doneEntries.length}개</p>
        </div>
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem" }}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>누적 점수</p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{totalScore}점</p>
        </div>
      </div>

      <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "1rem 1.25rem" }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 12px" }}>개념어별 결과</p>
        {doneEntries.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
            아직 완료한 개념어가 없어요. 지식 트리에서 개념어를 학습해보세요.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {doneEntries.map(([id, p]) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className="ti ti-check" style={{ fontSize: 18, color: "var(--color-text-success)", flexShrink: 0 }} aria-hidden="true"></i>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, margin: 0 }}>{CONCEPTS[id].term}</p>
                </div>
                <span style={{ fontSize: 13, color: "var(--color-text-success)", fontWeight: 500 }}>{p.score}점</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {tagEntries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>자주 보이는 사고 패턴</p>
          {tagEntries.map(([tag, count]) => {
            const info = TAG_LABELS[tag];
            if (!info) return null;
            return (
              <div key={tag} style={{ background: "var(--color-background-warning)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <i className="ti ti-refresh" style={{ fontSize: 18, color: "var(--color-text-warning)" }} aria-hidden="true"></i>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "var(--color-text-warning)" }}>
                    {info.title} ({count}회)
                  </p>
                </div>
                <p style={{ fontSize: 13, margin: 0, color: "var(--color-text-warning)" }}>{info.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {doneEntries.length > 0 && (
        <button
          style={{ width: "100%", color: "var(--color-text-danger)" }}
          onClick={() => {
            if (window.confirm("모든 학습 진행 상황을 초기화할까요?")) onReset();
          }}
        >
          진행 상황 초기화
        </button>
      )}
    </div>
  );
}

// ---------- 화면: 완료 ----------
function CompleteScreen({ concept, score, onBack }: { concept: Concept; score: number; onBack: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "1rem 0", alignItems: "center", textAlign: "center" }}>
      <i className="ti ti-circle-check" style={{ fontSize: 40, color: "var(--color-text-success)" }} aria-hidden="true"></i>
      <h2 style={{ margin: 0 }}>{concept.term} 완료!</h2>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
        총 {score}점을 획득했어요
      </p>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: 12, fontSize: 13, width: "100%", boxSizing: "border-box" }}>
        {concept.easyMeaning}
      </div>
      <button style={{ width: "100%" }} onClick={onBack}>
        지식 트리로 돌아가기 <i className="ti ti-arrow-right" aria-hidden="true" style={{ marginLeft: 4 }}></i>
      </button>
    </div>
  );
}

type Screen = "tree" | "stage1" | "reveal" | "draw" | "stage2" | "stage4" | "complete" | "report";

// ---------- 화면: 그려보기 ----------
function DrawScreen({ concept, onContinue }: { concept: Concept; onContinue: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "1rem 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <DiffBadge diff={concept.difficulty} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{concept.term} · 그려보기</span>
      </div>

      {hasExample(concept.id) && (
        <div style={{ background: "var(--color-background-primary)", border: "1px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 12px 8px" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", borderRadius: 999, padding: "2px 10px" }}>
            예시
          </span>
          <div style={{ marginTop: 6 }}>
            <ConceptExample conceptId={concept.id} />
          </div>
        </div>
      )}

      <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>
        {hasExample(concept.id)
          ? "예시를 보고 따라 그려봐!"
          : `"${concept.term}"을 그림으로 표현해볼까?`}
      </p>

      <DrawingPad />

      <button style={{ width: "100%" }} onClick={onContinue}>
        다 그렸어! <i className="ti ti-arrow-right" aria-hidden="true" style={{ marginLeft: 4 }}></i>
      </button>
    </div>
  );
}

// ---------- 메인 앱 ----------
export default function HanjaGame({ phone }: { phone: string }) {
  const [screen, setScreen] = useState<Screen>("tree");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stage1Score, setStage1Score] = useState(0);
  const [stage2Score, setStage2Score] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [wrongTagCounts, setWrongTagCounts] = useState<WrongTagCounts>({});
  const [lastScreen, setLastScreen] = useState<Screen>("tree");
  const [loaded, setLoaded] = useState(false);

  // 저장된 진행 상태 불러오기 (Firestore)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, t] = await Promise.all([loadProgress(phone), loadWrongTags(phone)]);
        if (mounted) {
          setProgress(p);
          setWrongTagCounts(t);
        }
      } catch {
        // 저장된 데이터가 없으면 빈 상태로 시작
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [phone]);

  const concept = activeId ? CONCEPTS[activeId] : null;

  function selectConcept(id: string) {
    setActiveId(id);
    setStage1Score(0);
    setScreen("stage1");
  }

  function finishStage1(score: number) {
    setStage1Score(score);
    setScreen("reveal");
  }

  function recordWrongTag(tag: string) {
    const next = (wrongTagCounts[tag] || 0) + 1;
    setWrongTagCounts((prev) => ({ ...prev, [tag]: (prev[tag] || 0) + 1 }));
    saveWrongTag(phone, tag, next).catch(() => {});
  }

  function persistDone(finalScore: number) {
    if (!activeId) return;
    const record: ConceptProgress = { done: true, score: finalScore };
    setProgress((prev) => ({ ...prev, [activeId]: record }));
    saveConceptProgress(phone, activeId, record).catch(() => {});
    setScreen("complete");
  }

  function finishStage2(finalScore: number) {
    if (concept && concept.difficulty === "어려움" && concept.explanation) {
      setStage2Score(finalScore);
      setScreen("stage4");
    } else {
      persistDone(finalScore);
    }
  }

  function finishStage4(finalScore: number) {
    persistDone(finalScore);
  }

  function backToTree() {
    setActiveId(null);
    setScreen("tree");
  }

  function openReport() {
    setLastScreen(screen);
    setScreen("report");
  }

  function handleReset() {
    setProgress({});
    setWrongTagCounts({});
    resetProgress(phone).catch(() => {});
  }

  if (!loaded) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 0", textAlign: "center", color: "var(--color-text-secondary)" }}>
        진행 상황을 불러오는 중…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {screen === "tree" && <TreeScreen progress={progress} onSelect={selectConcept} onReport={openReport} />}
      {screen === "stage1" && concept && <Stage1 concept={concept} onComplete={finishStage1} />}
      {screen === "reveal" && concept && <GuessReveal concept={concept} onContinue={() => setScreen("draw")} />}
      {screen === "draw" && concept && <DrawScreen concept={concept} onContinue={() => setScreen("stage2")} />}
      {screen === "stage2" && concept && (
        <Stage2 concept={concept} baseScore={stage1Score} onComplete={finishStage2} onWrongTag={recordWrongTag} />
      )}
      {screen === "stage4" && concept && <Stage4 concept={concept} baseScore={stage2Score} onComplete={finishStage4} />}
      {screen === "complete" && concept && (
        <CompleteScreen concept={concept} score={(activeId && progress[activeId]?.score) || 0} onBack={backToTree} />
      )}
      {screen === "report" && (
        <ReportScreen
          progress={progress}
          wrongTagCounts={wrongTagCounts}
          onBack={() => setScreen(lastScreen === "report" ? "tree" : lastScreen)}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
