const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const template =
  "C:/Users/pc/AppData/Local/Temp/codex-clipboard-8bff61ee-3340-4a69-8750-1236cebb2c3e.png";

const outputDirs = [
  path.join(__dirname, "..", "..", "concept-visuals", "memo-cards"),
  path.join(__dirname, "..", "public", "concept-memos"),
];

const cards = [
  {
    slug: "hyeopyak",
    title: "협약",
    icon: "concept-hyeopyak.png",
    hanja: [
      { glyph: "協", sound: "협", meaning: "돕다", related: "협력" },
      { glyph: "約", sound: "약", meaning: "맺다", related: "약속" },
    ],
    dictionary: "서로 협의하여 정한 약속이나 조약.",
    relationType: "유의어",
    relation: "약정, 합의",
  },
  {
    slug: "sihaeng",
    title: "시행",
    icon: "concept-sihaeng.png",
    hanja: [
      { glyph: "施", sound: "시", meaning: "베풀다, 행하다", related: "실시" },
      { glyph: "行", sound: "행", meaning: "행하다", related: "실행" },
    ],
    dictionary: "법령이나 규칙, 계획 따위를 실제로 행함.",
    relationType: "유의어",
    relation: "실시, 실행",
  },
  {
    slug: "yeolpaengchang",
    title: "열팽창",
    icon: "concept-yeolpaengchang.png",
    hanja: [
      { glyph: "熱", sound: "열", meaning: "덥다", related: "열기" },
      { glyph: "膨脹", sound: "팽창", meaning: "부풀어 커지다", related: "팽창" },
    ],
    dictionary: "물체가 열을 받아 길이 또는 부피가 늘어나는 현상.",
    relationType: "반대 현상",
    relation: "열수축",
  },
  {
    slug: "bupi",
    title: "부피",
    icon: "concept-bupi.png",
    hanja: [
      { glyph: "순우리말", sound: "", meaning: "한자 없이 쓰는 우리말", related: "용적" },
    ],
    dictionary: "물체가 공간을 차지하는 크기.",
    relationType: "관련어",
    relation: "용적",
  },
  {
    slug: "hoero",
    title: "회로",
    icon: "concept-hoero.png",
    hanja: [
      { glyph: "回", sound: "회", meaning: "돌다", related: "회전" },
      { glyph: "路", sound: "로", meaning: "길", related: "도로" },
    ],
    dictionary: "전류가 흐르도록 전기 부품과 전선을 연결한 길.",
    relationType: "관련어",
    relation: "전류, 전기 회로",
  },
  {
    slug: "seosikji",
    title: "서식지",
    icon: "concept-seosikji.png",
    hanja: [
      { glyph: "棲", sound: "서", meaning: "깃들다, 머무르다", related: "서식" },
      { glyph: "息", sound: "식", meaning: "쉬다, 살아가다", related: "휴식" },
      { glyph: "地", sound: "지", meaning: "땅, 곳", related: "지역" },
    ],
    dictionary: "생물이 살아가는 장소나 환경.",
    relationType: "관련어",
    relation: "서식 환경",
  },
  {
    slug: "jeolmyeol",
    title: "절멸",
    icon: "concept-jeolmyeol.png",
    hanja: [
      { glyph: "絕", sound: "절", meaning: "끊어지다", related: "단절" },
      { glyph: "滅", sound: "멸", meaning: "사라지다", related: "소멸" },
    ],
    dictionary: "아주 없어지거나 끊어져 사라짐.",
    relationType: "반의어",
    relation: "생존",
  },
  {
    slug: "myeoljong",
    title: "멸종",
    icon: "concept-myeoljong.png",
    hanja: [
      { glyph: "滅", sound: "멸", meaning: "사라지다", related: "소멸" },
      { glyph: "種", sound: "종", meaning: "종류", related: "종자" },
    ],
    dictionary: "생물의 한 종류가 지구에서 완전히 사라짐.",
    relationType: "반의어",
    relation: "번성",
  },
  {
    slug: "tochak",
    title: "토착",
    icon: "concept-tochak.png",
    hanja: [
      { glyph: "土", sound: "토", meaning: "땅", related: "토지" },
      { glyph: "着", sound: "착", meaning: "자리 잡다", related: "정착" },
    ],
    dictionary: "대대로 그 지역에 살거나 그곳에 자리 잡음.",
    relationType: "유의어",
    relation: "토종, 정착",
  },
  {
    slug: "hyeongyeokhi",
    title: "현격히",
    icon: "concept-hyeongyeokhi.png",
    hanja: [
      { glyph: "懸", sound: "현", meaning: "멀리 떨어지다", related: "현수교" },
      { glyph: "隔", sound: "격", meaning: "사이가 벌어지다", related: "간격" },
    ],
    dictionary: "차이가 뚜렷하고 매우 크게.",
    relationType: "유의어",
    relation: "크게, 뚜렷이",
  },
  {
    slug: "paengchang",
    title: "팽창",
    icon: "concept-paengchang.png",
    hanja: [
      { glyph: "膨", sound: "팽", meaning: "부풀다", related: "팽대" },
      { glyph: "脹", sound: "창", meaning: "부어오르다", related: "팽창" },
    ],
    dictionary: "부피가 늘어나 커짐.",
    relationType: "반의어",
    relation: "수축",
  },
  {
    slug: "mildo",
    title: "밀도",
    icon: "concept-mildo.png",
    hanja: [
      { glyph: "密", sound: "밀", meaning: "빽빽하다", related: "밀집" },
      { glyph: "度", sound: "도", meaning: "정도", related: "온도" },
    ],
    dictionary: "물질의 질량을 부피로 나눈 값.",
    relationType: "관련어",
    relation: "질량, 부피",
  },
  {
    slug: "seubyundo",
    title: "습윤도",
    icon: "concept-seubyundo.png",
    hanja: [
      { glyph: "濕", sound: "습", meaning: "젖다", related: "습기" },
      { glyph: "潤", sound: "윤", meaning: "젖다, 윤택하다", related: "윤기" },
      { glyph: "度", sound: "도", meaning: "정도", related: "온도" },
    ],
    dictionary: "공기나 토양이 습기를 머금은 정도.",
    relationType: "반대 상태",
    relation: "건조",
  },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapKorean(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock({ klass, x, y, lines, lineHeight }) {
  const [first, ...rest] = lines;
  const tspans = [`<tspan x="${x}" y="${y}">${escapeXml(first)}</tspan>`];
  rest.forEach((line) => {
    tspans.push(`<tspan x="${x}" dy="${lineHeight}">${escapeXml(line)}</tspan>`);
  });
  return `<text class="${klass}">${tspans.join("")}</text>`;
}

async function makeInkIcon(iconPath, size) {
  const { data, info } = await sharp(iconPath)
    .resize(size, size, { fit: "contain", background: "#ffffff" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 1) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    alpha[j] = avg < 240 ? Math.min(255, Math.round((240 - avg) * 5)) : 0;
  }

  return sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: { r: 17, g: 17, b: 17 },
    },
  })
    .joinChannel(alpha, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
    .png()
    .toBuffer();
}

async function makeCleanTemplate() {
  const patch = await sharp(template)
    .extract({ left: 1580, top: 835, width: 45, height: 85 })
    .resize(220, 100, { fit: "fill" })
    .blur(6)
    .png()
    .toBuffer();

  return sharp(template)
    .composite([{ input: patch, left: 1370, top: 835 }])
    .png()
    .toBuffer();
}

function hanjaLines(card) {
  const startY = card.hanja.length === 3 ? 388 : 410;
  const lineHeight = card.hanja.length === 3 ? 49 : 55;
  return card.hanja
    .map((entry, index) => {
      const sound = entry.sound ? `(${escapeXml(entry.sound)})` : "";
      const y = startY + index * lineHeight;
      return `<text class="hanja-line" x="455" y="${y}">
        <tspan class="glyph">${escapeXml(entry.glyph)}${sound}</tspan>
        <tspan> : ${escapeXml(entry.meaning)}  →  </tspan>
        <tspan class="related">${escapeXml(entry.related)}</tspan>
      </text>`;
    })
    .join("\n");
}

function overlaySvg(card, width, height) {
  const titleSize = card.title.length >= 4 ? 58 : card.title.length === 3 ? 62 : 72;
  const dictionaryLines = wrapKorean(card.dictionary, 31);
  const relationColor = card.relationType.includes("반") ? "#cf342e" : "#2d8b3b";

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .title { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: ${titleSize}px; fill: #111; }
      .hanja-line { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 36px; fill: #111; }
      .glyph { font-weight: 900; }
      .related { fill: #2d8b3b; font-weight: 900; }
      .label { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 40px; fill: #cf342e; }
      .body { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 38px; fill: #111; }
      .relation-label { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 40px; fill: ${relationColor}; }
      .relation { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 40px; fill: #111; }
      .line { stroke: #111; stroke-width: 5; stroke-linecap: round; }
    </style>
  </defs>
  <text class="title" x="420" y="330">${escapeXml(card.title)}</text>
  ${hanjaLines(card)}
  <line class="line" x1="455" y1="535" x2="1345" y2="535"/>
  <text class="label" x="125" y="630">사전 뜻</text>
  ${textBlock({ klass: "body", x: 330, y: 630, lines: dictionaryLines, lineHeight: 44 })}
  <text class="relation-label" x="125" y="725">${escapeXml(card.relationType)}</text>
  <text class="relation" x="330" y="725">${escapeXml(card.relation)}</text>
</svg>`);
}

async function generateCard(card, cleanTemplate) {
  const meta = await sharp(cleanTemplate).metadata();
  const icon = await makeInkIcon(
    path.join(__dirname, "..", "public", "concept-images", card.icon),
    230,
  );
  const image = await sharp(cleanTemplate)
    .composite([
      { input: icon, left: 140, top: 300 },
      { input: overlaySvg(card, meta.width, meta.height), left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  for (const outputDir of outputDirs) {
    fs.mkdirSync(outputDir, { recursive: true });
    await sharp(image).toFile(path.join(outputDir, `memo-${card.slug}.png`));
  }
}

async function makeReviewGrid() {
  const thumbWidth = 410;
  const thumbHeight = 238;
  const gap = 24;
  const cols = 2;
  const rows = Math.ceil(cards.length / cols);
  const width = cols * thumbWidth + (cols + 1) * gap;
  const height = rows * thumbHeight + (rows + 1) * gap;
  const composites = [];

  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i];
    const file = path.join(outputDirs[0], `memo-${card.slug}.png`);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = gap + col * (thumbWidth + gap);
    const top = gap + row * (thumbHeight + gap);
    const thumb = await sharp(file)
      .resize(thumbWidth, thumbHeight, { fit: "contain", background: "#fff" })
      .png()
      .toBuffer();
    composites.push({ input: thumb, left, top });
  }

  await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .composite(composites)
    .png()
    .toFile(path.join(outputDirs[0], "review-related-word-memo-cards.png"));
}

(async () => {
  if (!fs.existsSync(template)) throw new Error(`Template image not found: ${template}`);
  const cleanTemplate = await makeCleanTemplate();
  for (const card of cards) await generateCard(card, cleanTemplate);
  await makeReviewGrid();
  console.log(JSON.stringify({
    cards: cards.map((card) => `memo-${card.slug}.png`),
    outputDirs,
  }, null, 2));
})();
