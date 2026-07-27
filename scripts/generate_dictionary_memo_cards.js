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
    slug: "chulbeom",
    title: "출범",
    icon: "concept-chulbeom.png",
    hanja: "出 나갈 출 + 帆 돛 범",
    dictionary: "배가 항구를 떠남. 단체나 일이 새롭게 시작함.",
    easy: "새로운 일이나 조직이 처음 출발하는 것.",
  },
  {
    slug: "gwanse",
    title: "관세",
    icon: "concept-gwanse.png",
    hanja: "關 관문 관 + 稅 세금 세",
    dictionary: "나라 사이를 오가는 물건에 매기는 세금.",
    easy: "외국 물건이 들어오거나 나갈 때 붙는 세금.",
  },
  {
    slug: "danil",
    title: "단일",
    icon: "concept-danil.png",
    hanja: "單 홑 단 + 一 하나 일",
    dictionary: "하나로 되어 있음. 또는 하나뿐임.",
    easy: "여럿이 아니라 하나로 묶인 상태.",
  },
  {
    slug: "gyoyeok",
    title: "교역",
    icon: "concept-gyoyeok.png",
    hanja: "交 바꿀 교 + 易 바꿀 역",
    dictionary: "나라와 나라 사이에 물건을 사고파는 일.",
    easy: "나라끼리 필요한 물건을 서로 주고받는 것.",
  },
  {
    slug: "jihyang",
    title: "지향",
    icon: "concept-jihyang-clean.png",
    hanja: "志 뜻 지 + 向 향할 향",
    dictionary: "어떤 목표나 방향으로 뜻이 향함.",
    easy: "생각과 행동이 목표 쪽으로 나아가는 것.",
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
  rest.forEach((line, index) => {
    tspans.push(
      `<tspan x="${x}" dy="${lineHeight}">${escapeXml(line)}</tspan>`,
    );
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

function overlaySvg(card, width, height) {
  const titleSize = card.title.length >= 4 ? 68 : 76;
  const dictionaryLines = wrapKorean(card.dictionary, 31);
  const easyLines = wrapKorean(card.easy, 31);

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .title { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: ${titleSize}px; fill: #111; }
      .hanja { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 44px; fill: #111; }
      .label { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 40px; fill: #cf342e; }
      .body { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 40px; fill: #111; }
      .line { stroke: #111; stroke-width: 5; stroke-linecap: round; }
    </style>
  </defs>
  <text class="title" x="455" y="350">${escapeXml(card.title)}</text>
  <line class="line" x1="455" y1="385" x2="1345" y2="385"/>

  <text class="label" x="125" y="500">한자 뜻</text>
  <text class="hanja" x="330" y="500">${escapeXml(card.hanja)}</text>

  <text class="label" x="125" y="595">사전 뜻</text>
  ${textBlock({
    klass: "body",
    x: 330,
    y: 595,
    lines: dictionaryLines,
    lineHeight: 48,
  })}

  <text class="label" x="125" y="710">쉬운 풀이</text>
  ${textBlock({
    klass: "body",
    x: 330,
    y: 710,
    lines: easyLines,
    lineHeight: 48,
  })}
</svg>`);
}

async function generateCard(card) {
  const meta = await sharp(template).metadata();
  const icon = await makeInkIcon(
    path.join(__dirname, "..", "public", "concept-images", card.icon),
    285,
  );

  const image = await sharp(template)
    .composite([
      { input: icon, left: 130, top: 300 },
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
  const labelHeight = 34;
  const gap = 24;
  const cols = 2;
  const rows = Math.ceil(cards.length / cols);
  const width = cols * thumbWidth + (cols + 1) * gap;
  const height = rows * (thumbHeight + labelHeight) + (rows + 1) * gap;
  const composites = [];

  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i];
    const file = path.join(outputDirs[0], `memo-${card.slug}.png`);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = gap + col * (thumbWidth + gap);
    const top = gap + row * (thumbHeight + labelHeight + gap);
    const thumb = await sharp(file)
      .resize(thumbWidth, thumbHeight, { fit: "contain", background: "#fff" })
      .png()
      .toBuffer();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${thumbWidth}" height="${labelHeight}">
      <rect width="100%" height="100%" fill="white"/>
      <text x="${thumbWidth / 2}" y="24" text-anchor="middle" font-family="Arial" font-size="20" fill="#111">${card.slug}</text>
    </svg>`);
    composites.push({ input: thumb, left, top });
    composites.push({ input: label, left, top: top + thumbHeight });
  }

  await sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .composite(composites)
    .png()
    .toFile(path.join(outputDirs[0], "review-dictionary-memo-cards.png"));
}

(async () => {
  if (!fs.existsSync(template)) {
    throw new Error(`Template image not found: ${template}`);
  }

  for (const card of cards) {
    await generateCard(card);
  }
  await makeReviewGrid();

  console.log(
    JSON.stringify(
      {
        cards: cards.map((card) => `memo-${card.slug}.png`),
        outputDirs,
      },
      null,
      2,
    ),
  );
})();
