import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestFile = "콘텐츠_카드_매니페스트_v1.md";
const seedFile = "개념_시드_미래엔2022_중1_v2.json";
const outputFile = path.join(root, "lib", "learn", "content", "generated.ts");

const TAGS = {
  "①": "①범주",
  "②": "②용어",
  "③": "③구조",
  "④": "④핵심",
  "⑤": "⑤혼동",
  "⑥": "⑥표현",
};

function readText(fileName) {
  return readFileSync(path.join(root, fileName), "utf8");
}

function normalize(text) {
  return String(text ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function stripMarkdown(text) {
  return String(text ?? "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeading(heading) {
  return stripMarkdown(
    heading
      .replace(/^●\s*/, "")
      .replace(/^세트:\s*/, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/·\s*sci[_\w가-힣]+/g, "")
      .trim(),
  );
}

function splitList(text) {
  return stripMarkdown(text)
    .split(/\s*·\s*|\s*\/\s*|\s*,\s*|\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function firstSentence(text) {
  const clean = stripMarkdown(text);
  return clean.split(/(?<=[.!?。]|다\.|요\.)\s+/)[0]?.trim() || clean;
}

function fieldKey(raw) {
  return stripMarkdown(raw).replace(/\s+/g, "");
}

function parseManifest(text) {
  const entries = [];
  let current = null;

  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^##\s+`([^`]+)`/);
    if (heading) {
      if (current) entries.push(current);
      current = { fileName: heading[1], text: "" };
      continue;
    }
    if (current) current.text += `${line}\n`;
  }
  if (current) entries.push(current);

  return entries.map((entry) => {
    const concepts = [];
    for (const match of entry.text.matchAll(/((?:sci22|soc1)_\d+)\(([^)]+)\)/g)) {
      concepts.push({ id: match[1], name: match[2] });
    }
    return { ...entry, concepts };
  });
}

function parseSections(text) {
  const sections = [];
  let current = null;

  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^##\s+/, "").trim(), body: "" };
      continue;
    }
    if (current) current.body += `${line}\n`;
  }
  if (current) sections.push(current);

  return sections.map((section) => ({
    ...section,
    cleanHeading: cleanHeading(section.heading),
    fields: parseFields(section.body),
  }));
}

function parseFields(body) {
  const fields = new Map();
  let currentKey = null;

  for (const line of body.split(/\r?\n/)) {
    const field = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.*)$/);
    if (field) {
      currentKey = fieldKey(field[1]);
      fields.set(currentKey, field[2].trim());
      continue;
    }

    const trimmed = line.trim();
    if (!currentKey || !trimmed) continue;
    if (trimmed.startsWith("|") || trimmed === "---") continue;
    if (/^-\s+/.test(trimmed) && !/^-\s+✅/.test(trimmed)) continue;
    fields.set(currentKey, `${fields.get(currentKey)} ${trimmed}`.trim());
  }

  return fields;
}

function findField(fields, includes) {
  for (const [key, value] of fields) {
    if (includes.some((needle) => key.includes(needle))) return value;
  }
  return "";
}

function extractSpecificLine(name, body) {
  const target = normalize(name);
  if (!target) return "";

  for (const line of body.split(/\r?\n/)) {
    if (!line.trim().startsWith("- **")) continue;
    if (!normalize(line).includes(target)) continue;

    const afterFirstLabel = line.replace(/^-\s+\*\*.+?\*\*:\s*/, "");
    return stripMarkdown(afterFirstLabel.split(/\s+\/\s+\*\*/)[0]);
  }

  return "";
}

function routeFromText(text, concept) {
  const source = `${text} ${concept.구조전략 ?? ""}`;
  if (source.includes("조합형") || source.includes("한자분해") || source.includes("한자 짜임")) return "조합형";
  if (source.includes("과정인과형") || source.includes("논리 사슬") || source.includes("발문")) return "과정인과형";
  if (source.includes("의미확장형") || source.includes("짝대조") || source.includes("대립")) return "의미확장형";
  if (source.includes("정밀화형") || source.includes("정의·논리")) return "정밀화형";
  return "정의이미지형";
}

function visualKindFrom(route, concept) {
  if (concept.성격 === "세트" || concept.세트명) return "묶음맵";
  if (route === "조합형") return "한자분해";
  if (route === "의미확장형") return "대칭비교";
  if (route === "과정인과형") return "화살표사슬";
  return "묶음맵";
}

function parseAxes(raw, concept) {
  const fallback = {
    structure: concept.구조전략 || "정의·논리",
    connection: concept.연결전략 || "이미지·경험",
  };
  const text = stripMarkdown(raw);
  if (!text) return fallback;

  const match = text.match(/구조\s*=\s*([^/]+?)\s*\/\s*연결\s*=\s*(.+)$/);
  if (!match) return fallback;

  return {
    structure: stripMarkdown(match[1]),
    connection: stripMarkdown(match[2]),
  };
}

function scoreSection(concept, section) {
  const name = normalize(concept.concept);
  const heading = normalize(section.cleanHeading);
  const body = normalize(section.body);
  const setName = normalize(concept.세트명 ?? "");
  const nameNoSuffix = normalize(
    concept.concept
      .replace(/\s*(기후|현상|운동|제도|사회|생물)$/g, "")
      .replace(/^넓은 의미의\s*/, "")
      .replace(/^좁은 의미의\s*/, ""),
  );
  const headingMain = normalize(section.cleanHeading.split(/[·↔+/]/)[0] ?? "");

  let score = 0;
  if (heading.includes(name)) score += 120;
  if (body.includes(name)) score += 50;
  if (name.includes(headingMain) && headingMain.length >= 3) score += 25;
  if (setName && heading.includes(setName)) score += 45;
  if (setName && body.includes(setName)) score += 18;
  if (nameNoSuffix.length >= 2 && heading.includes(nameNoSuffix)) score += 35;
  if (nameNoSuffix.length >= 2 && body.includes(nameNoSuffix)) score += 12;

  for (const token of concept.concept.split(/\s+|·|↔/).map(normalize).filter((t) => t.length >= 2)) {
    if (heading.includes(token)) score += 8;
    if (body.includes(token)) score += 2;
  }

  return score;
}

function bestSectionFor(concept, sections) {
  const ranked = sections
    .map((section) => ({ section, score: scoreSection(concept, section) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score > 0 ? ranked[0] : null;
}

function parseHanja(concept) {
  return Array.isArray(concept.hanja)
    ? concept.hanja.map(([char, mean]) => ({
        char: String(char),
        mean: String(mean),
        note: String(mean),
      }))
    : [];
}

function combinedMeaning(hanjaField, concept) {
  const arrow = stripMarkdown(hanjaField).split("→")[1]?.trim();
  if (arrow) return arrow;
  if (Array.isArray(concept.hanja) && concept.hanja.length > 0) {
    return `${concept.hanja.map(([char]) => char).join(" + ")} = ${concept.concept}`;
  }
  return `${concept.concept}의 핵심 뜻`;
}

function tagLabel(raw) {
  const mark = String(raw ?? "").match(/[①②③④⑤⑥]/)?.[0];
  return mark ? TAGS[mark] : null;
}

function parseOptions(raw) {
  return raw
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const isCorrect = part.startsWith("✅");
      const cleaned = stripMarkdown(part.replace(/^✅\s*/, ""));
      const tag = tagLabel(cleaned);
      const text = stripMarkdown(cleaned.replace(/→\s*[①②③④⑤⑥][^/]*$/u, ""));
      return {
        text,
        is_correct: isCorrect,
        tag: isCorrect ? null : tag ?? "④핵심",
      };
    })
    .filter((option) => option.text);
}

function matchNameToken(optionText, conceptName) {
  const option = normalize(optionText);
  const name = normalize(conceptName);
  if (!option || !name) return false;
  if (option.includes(name) || name.includes(option)) return true;
  const shortened = normalize(conceptName.replace(/\s*(기후|현상|선거|권|생물)$/g, ""));
  return shortened.length >= 2 && option.includes(shortened);
}

function parseQuestionBanks(concepts) {
  const quizByConcept = new Map();
  const bankFiles = readdirSync(root).filter((file) => /^확인문제은행_.*\.md$/.test(file));

  const conceptsByName = concepts.map((concept) => ({
    concept,
    name: normalize(concept.concept),
    setName: normalize(concept.세트명 ?? ""),
  }));

  function addQuiz(id, quiz) {
    if (!quizByConcept.has(id)) quizByConcept.set(id, []);
    quizByConcept.get(id).push(quiz);
  }

  for (const fileName of bankFiles) {
    const lines = readText(fileName).split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const match = lines[i].match(/^\*\*(.+?)\*\*\s*·\s*(정의형|적용형|변별형)\s*—\s*(.+)$/);
      if (!match) continue;

      const term = stripMarkdown(match[1]);
      const type = match[2];
      let rest = match[3].trim();
      if (!rest.includes("✅") && lines[i + 1]?.trim().startsWith("✅")) {
        rest = `${rest} ${lines[i + 1].trim()}`;
        i += 1;
      }

      const [promptPart, optionsPart] = rest.split("✅");
      if (!optionsPart) continue;
      const prompt = stripMarkdown(promptPart);
      const options = parseOptions(`✅${optionsPart}`);
      if (!prompt || options.length < 2) continue;

      const termNorm = normalize(term);
      const correct = options.find((option) => option.is_correct)?.text ?? "";
      const matched = new Set();

      for (const item of conceptsByName) {
        const concept = item.concept;
        const exactTerm =
          termNorm.includes(item.name) ||
          item.name.includes(termNorm) ||
          term.split(/[·↔+/]/).some((piece) => normalize(piece) === item.name);
        const correctTerm = matchNameToken(correct, concept.concept);
        const setTerm = item.setName && termNorm.includes(item.setName);

        if (exactTerm || correctTerm || (setTerm && correctTerm)) matched.add(concept.id);
      }

      for (const id of matched) {
        const count = quizByConcept.get(id)?.length ?? 0;
        addQuiz(id, {
          id: `${id}_bank_q${count + 1}`,
          concept_id: id,
          type,
          prompt,
          options,
        });
      }
    }
  }

  return quizByConcept;
}

function fallbackQuiz(concept, definition) {
  return [
    {
      id: `${concept.id}_fallback_q1`,
      concept_id: concept.id,
      type: "정의형",
      prompt: `${concept.concept}의 뜻으로 가장 알맞은 것은?`,
      options: [
        { text: firstSentence(definition), is_correct: true, tag: null },
        { text: "비슷한 말과 구분하지 않아도 되는 낱말", is_correct: false, tag: "⑤혼동" },
        { text: "핵심 조건 없이 외우기만 하면 되는 말", is_correct: false, tag: "④핵심" },
      ],
    },
  ];
}

function buildContent(concept, sectionInfo, quizByConcept) {
  const section = sectionInfo?.section;
  const fields = section?.fields ?? new Map();
  const hanjaField = findField(fields, ["한자"]);
  const routeField = findField(fields, ["주학습경로"]);
  const easy = findField(fields, ["쉬운뜻"]);
  const specific = section ? extractSpecificLine(concept.concept, section.body) : "";
  const definition =
    findField(fields, ["교과정의"]) ||
    specific ||
    easy ||
    `${concept.concept}의 뜻과 쓰임을 정리한 개념입니다.`;
  const question = findField(fields, ["핵심질문"]);
  const condition = findField(fields, ["필수조건"]);
  const example = findField(fields, ["대표예시"]);
  const warning =
    findField(fields, ["대표오개념", "오개념"]) ||
    findField(fields, ["반례"]) ||
    `${concept.concept}은(는) 비슷한 개념과 섞지 말고 핵심 조건으로 구분해요.`;
  const axes = parseAxes(findField(fields, ["2축"]), concept);
  const route = routeFromText(routeField, concept);
  const coreList = splitList(condition).length
    ? splitList(condition)
    : Array.isArray(concept.core_elements) && concept.core_elements.length
      ? concept.core_elements
      : [firstSentence(definition)];
  const visualText = findField(fields, ["시각"]);
  const quiz = quizByConcept.get(concept.id)?.slice(0, 3) ?? fallbackQuiz(concept, definition);
  const hanja = parseHanja(concept);

  return {
    conceptId: concept.id,
    feel: {
      scene: [
        example ? `${example}처럼 생활 속 장면에서 ${concept.concept}을(를) 만날 수 있어요.` : `${concept.concept}이라는 말을 보면 먼저 익숙한 장면을 떠올려요.`,
        easy ? `쉬운 말로는 ${easy}예요.` : firstSentence(definition),
        question || `이 개념에서는 ${coreList[0]}을(를) 꼭 확인해요.`,
      ],
      hook: easy || firstSentence(definition),
    },
    concept: {
      hanja,
      combined: combinedMeaning(hanjaField, concept),
      definition,
      coreList,
      warning,
    },
    quiz,
    bigPicture: {
      flow: [
        { when: "뜻", then: firstSentence(definition) },
        { when: "예시", then: example || `${concept.concept}이(가) 쓰이는 상황을 떠올려 보기` },
      ],
      compare: [
        {
          label: concept.concept,
          what: firstSentence(easy || definition),
          oneLiner: coreList[0],
        },
        ...(Array.isArray(concept.confusable) ? concept.confusable : []).slice(0, 2).map((name) => ({
          label: name,
          what: "헷갈리기 쉬운 짝개념",
          oneLiner: "정의의 핵심 조건으로 가르기",
        })),
      ],
      why: warning,
      useCases: example ? splitList(example) : undefined,
      extend: findField(fields, ["관계태그"]) || undefined,
    },
    explain: {
      prompt: findField(fields, ["설명과제"]) || `${concept.concept}이(가) 무엇인지 예를 들어 설명해보세요.`,
      closeWord: {
        sentence: `${concept.concept}은(는) ___이다.`,
        answer: concept.closing_noun || "개념",
      },
      slots: coreList.slice(0, 4).map((item, index) => ({
        label: `[핵심 ${index + 1}] ${item}`,
        hint: item,
        answer: item,
      })),
      hanjaHint: hanja.length
        ? `${hanja.map((item) => `${item.char}(${item.mean})`).join(" + ")} → ${combinedMeaning(hanjaField, concept)}`
        : axes.connection,
      coreKeywords: Array.from(new Set([...coreList, concept.concept])),
    },
    prereq: question
      ? question.split(/\s*\/\s*/).slice(0, 3).map((ask) => ({
          ask: stripMarkdown(ask),
          expect: "정의와 예시를 보고 답하기",
          ifStuck: firstSentence(definition),
        }))
      : undefined,
    visual: {
      kind: visualKindFrom(route, concept),
      caption: visualText || `${concept.concept}의 핵심 의미를 선, 묶음, 화살표로 정리해요.`,
      nodes: [concept.concept, ...coreList.slice(0, 3)],
      essence: findField(fields, ["관계태그"]) || undefined,
    },
    fourmat: {
      why: question || example || `${concept.concept}을(를) 왜 배울까요?`,
      what: definition,
      how: quiz[0]?.prompt || `${concept.concept}을(를) 확인해요.`,
      iff: findField(fields, ["관계태그"]) || "비슷한 개념과 비교하며 넓혀요.",
    },
    strategy: {
      route,
      structure: axes.structure,
      connection: axes.connection,
      misconception: warning,
    },
    wordFormation: hanja.length
      ? {
          parts: hanja.map((item) => ({ text: item.char, meaning: item.mean })),
          formula: `${hanja.map((item) => item.char).join(" + ")} = ${concept.concept}`,
          readingCue: "글자 뜻을 먼저 읽고, 마지막에는 무엇의 개념인지 한 문장으로 닫기",
        }
      : undefined,
    definitionImage: route === "정의이미지형"
      ? {
          dictionaryDefinition: definition,
          imageCaption: visualText || `${concept.concept}의 의미가 드러나는 단순 도식`,
          example: example || undefined,
        }
      : undefined,
  };
}

function main() {
  if (!existsSync(path.join(root, manifestFile))) {
    throw new Error(`${manifestFile} 파일을 찾을 수 없습니다.`);
  }

  const seed = JSON.parse(readText(seedFile));
  const concepts = seed.concepts;
  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
  const manifestEntries = parseManifest(readText(manifestFile));
  const quizByConcept = parseQuestionBanks(concepts);
  const generated = {};
  const reports = [];

  for (const entry of manifestEntries) {
    if (!existsSync(path.join(root, entry.fileName))) {
      throw new Error(`매니페스트에 적힌 파일을 찾을 수 없습니다: ${entry.fileName}`);
    }
    const sections = parseSections(readText(entry.fileName));

    for (const listed of entry.concepts) {
      const concept = conceptById.get(listed.id);
      if (!concept) {
        reports.push({ id: listed.id, name: listed.name, file: entry.fileName, status: "missing-seed" });
        continue;
      }

      const sectionInfo = bestSectionFor(concept, sections);
      generated[concept.id] = buildContent(concept, sectionInfo, quizByConcept);
      reports.push({
        id: concept.id,
        name: concept.concept,
        file: entry.fileName,
        heading: sectionInfo?.section.cleanHeading ?? "",
        score: sectionInfo?.score ?? 0,
        quiz: generated[concept.id].quiz.length,
      });
    }
  }

  const source = `// Auto-generated by scripts/build_content_from_manifest.mjs.
// Source: ${manifestFile}, 콘텐츠카드_*.md, 확인문제은행_*.md.
// Do not edit this file by hand; update the markdown cards and rerun the script.

import type { ConceptContent } from "./sci_03";

export const GENERATED_CONTENT_BY_CONCEPT: Record<string, ConceptContent> = ${JSON.stringify(generated, null, 2)};
`;

  writeFileSync(outputFile, source, "utf8");

  const mappedIds = new Set(Object.keys(generated));
  const manifestIds = manifestEntries.flatMap((entry) => entry.concepts.map((concept) => concept.id));
  const missingFromManifest = concepts.filter((concept) => !mappedIds.has(concept.id));
  const lowScore = reports.filter((report) => report.status !== "missing-seed" && report.score < 10);
  const noBankQuiz = reports.filter((report) => report.quiz === 1 && generated[report.id]?.quiz[0]?.id.includes("fallback"));

  console.log(
    JSON.stringify(
      {
        manifestFiles: manifestEntries.length,
        manifestConceptIds: manifestIds.length,
        generatedConcepts: mappedIds.size,
        seedConcepts: concepts.length,
        missingFromManifest: missingFromManifest.map((concept) => concept.id),
        lowScoreMatches: lowScore.slice(0, 20),
        lowScoreCount: lowScore.length,
        fallbackQuizCount: noBankQuiz.length,
        output: path.relative(root, outputFile),
      },
      null,
      2,
    ),
  );
}

main();
