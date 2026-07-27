const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const projectRoot = path.join(__dirname, "..", "..");
const appRoot = path.join(__dirname, "..");
const template =
  "C:/Users/pc/AppData/Local/Temp/codex-clipboard-8bff61ee-3340-4a69-8750-1236cebb2c3e.png";

const iconDir = path.join(appRoot, "public", "concept-images");
const memoDirs = [
  path.join(projectRoot, "concept-visuals", "memo-cards"),
  path.join(appRoot, "public", "concept-memos"),
];

const cards = [
  {
    slug: "seunghwa",
    title: "승화",
    hanja: [
      { glyph: "昇", sound: "승", meaning: "오르다" },
      { glyph: "華", sound: "화", meaning: "빛나다, 꽃" },
    ],
    dictionary: "고체가 액체 상태를 거치지 않고 바로 기체로 변하는 현상.",
    easy: "단단한 알갱이가 녹지 않고 바로 멀리 퍼진 기체 알갱이가 됨.",
  },
  {
    slug: "eunggo",
    title: "응고",
    hanja: [
      { glyph: "凝", sound: "응", meaning: "엉기다" },
      { glyph: "固", sound: "고", meaning: "굳다" },
    ],
    dictionary: "액체가 열을 잃어 고체로 변하는 현상.",
    easy: "흐르던 알갱이들이 식으면서 서로 붙어 단단하게 굳음.",
  },
  {
    slug: "yunghae",
    title: "융해",
    hanja: [
      { glyph: "融", sound: "융", meaning: "녹다" },
      { glyph: "解", sound: "해", meaning: "풀리다" },
    ],
    dictionary: "고체가 열을 받아 액체로 변하는 현상.",
    easy: "단단히 붙어 있던 알갱이들이 열을 받아 풀려서 흐르게 됨.",
  },
  {
    slug: "gihwa",
    title: "기화",
    hanja: [
      { glyph: "氣", sound: "기", meaning: "기운, 기체" },
      { glyph: "化", sound: "화", meaning: "변하다" },
    ],
    dictionary: "액체가 열을 받아 기체로 변하는 현상.",
    easy: "가까이 있던 액체 알갱이들이 열을 받아 멀리 퍼져 날아감.",
  },
  {
    slug: "aekhwa",
    title: "액화",
    hanja: [
      { glyph: "液", sound: "액", meaning: "액체" },
      { glyph: "化", sound: "화", meaning: "변하다" },
    ],
    dictionary: "기체가 식거나 압력을 받아 액체로 변하는 현상.",
    easy: "멀리 퍼져 있던 기체 알갱이들이 모여 흐르는 액체가 됨.",
  },
];

function escapeXml(value) {
  return String(value)
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
  const tspans = [`<tspan x="${x}" y="${y}">${escapeXml(first || "")}</tspan>`];
  rest.forEach((line) => {
    tspans.push(`<tspan x="${x}" dy="${lineHeight}">${escapeXml(line)}</tspan>`);
  });
  return `<text class="${klass}">${tspans.join("")}</text>`;
}

function particles(points, radius = 24) {
  return points
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${radius}" />`)
    .join("\n");
}

function arrow({ x1, y1, x2, y2, head = 30 }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const left = angle + Math.PI * 0.82;
  const right = angle - Math.PI * 0.82;
  const lx = x2 + Math.cos(left) * head;
  const ly = y2 + Math.sin(left) * head;
  const rx = x2 + Math.cos(right) * head;
  const ry = y2 + Math.sin(right) * head;
  return `<path d="M ${x1} ${y1} L ${x2} ${y2} M ${lx} ${ly} L ${x2} ${y2} L ${rx} ${ry}" />`;
}

function heatWaves(x, y) {
  return `
    <path d="M ${x} ${y + 80} C ${x - 18} ${y + 55}, ${x + 18} ${y + 35}, ${x} ${y + 10}" />
    <path d="M ${x + 70} ${y + 80} C ${x + 52} ${y + 55}, ${x + 88} ${y + 35}, ${x + 70} ${y + 10}" />
    <path d="M ${x + 140} ${y + 80} C ${x + 122} ${y + 55}, ${x + 158} ${y + 35}, ${x + 140} ${y + 10}" />
  `;
}

function coldLines(x, y) {
  return `
    ${arrow({ x1: x, y1: y, x2: x - 55, y2: y + 55, head: 18 })}
    ${arrow({ x1: x + 80, y1: y + 5, x2: x + 80, y2: y + 78, head: 18 })}
    ${arrow({ x1: x + 160, y1: y, x2: x + 215, y2: y + 55, head: 18 })}
  `;
}

const solidGrid = [
  [150, 555], [215, 555], [280, 555], [345, 555],
  [150, 620], [215, 620], [280, 620], [345, 620],
  [150, 685], [215, 685], [280, 685], [345, 685],
  [150, 750], [215, 750], [280, 750], [345, 750],
];

const solidGridRight = solidGrid.map(([x, y]) => [x + 500, y - 150]);
const liquidLeft = [
  [150, 615], [230, 585], [315, 620], [190, 700], [280, 705], [360, 675],
  [245, 645],
];
const liquidRight = liquidLeft.map(([x, y]) => [x + 500, y - 35]);
const gasHigh = [
  [625, 165], [820, 145], [740, 280], [930, 285], [610, 385],
  [840, 455], [985, 420],
];
const gasLeft = gasHigh.map(([x, y]) => [x - 470, y + 60]);

function iconSvg(kind) {
  const bodies = {
    seunghwa: `
      ${particles(solidGrid)}
      ${arrow({ x1: 420, y1: 565, x2: 610, y2: 365 })}
      ${particles(gasHigh)}
      ${heatWaves(180, 820)}
    `,
    eunggo: `
      ${particles(liquidLeft)}
      <path d="M 115 735 C 185 790, 305 790, 395 730" />
      ${arrow({ x1: 430, y1: 625, x2: 590, y2: 625 })}
      ${particles(solidGridRight)}
      ${coldLines(215, 800)}
    `,
    yunghae: `
      ${particles(solidGrid)}
      ${heatWaves(180, 815)}
      ${arrow({ x1: 430, y1: 625, x2: 590, y2: 625 })}
      ${particles(liquidRight)}
      <path d="M 615 700 C 705 760, 850 760, 940 698" />
    `,
    gihwa: `
      ${particles(liquidLeft)}
      <path d="M 110 725 C 180 785, 315 785, 400 725" />
      ${heatWaves(160, 800)}
      ${arrow({ x1: 420, y1: 620, x2: 610, y2: 395 })}
      ${particles(gasHigh)}
    `,
    aekhwa: `
      ${particles(gasLeft)}
      ${arrow({ x1: 435, y1: 405, x2: 610, y2: 565 })}
      ${arrow({ x1: 930, y1: 405, x2: 760, y2: 565 })}
      ${particles(liquidRight)}
      <path d="M 615 700 C 705 760, 850 760, 940 698" />
      ${coldLines(680, 790)}
    `,
  };

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#fff"/>
  <g fill="none" stroke="#111" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
    ${bodies[kind]}
  </g>
</svg>`);
}

async function makeCleanTemplate() {
  if (!fs.existsSync(template)) {
    return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1647" height="955" viewBox="0 0 1647 955">
  <defs>
    <filter id="softPaper">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 0.88  0 0 0 0 0.45  0 0 0 .12 0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
    <style>
      .big { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 60px; fill: #050505; }
      .heading { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 60px; fill: #050505; }
      .red { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 42px; fill: #d43731; }
      .bottom { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 64px; fill: #050505; }
      .line { stroke: #050505; stroke-width: 5; stroke-linecap: round; }
      .box { fill: none; stroke: #050505; stroke-width: 7; }
    </style>
  </defs>
  <rect x="10" y="10" width="1627" height="935" rx="10" fill="#ffefb3" filter="url(#softPaper)"/>
  <text class="big" x="50" y="90">과목 :</text>
  <line class="line" x1="210" y1="98" x2="420" y2="98"/>
  <text class="big" x="50" y="175">단원 :</text>
  <line class="line" x1="210" y1="183" x2="420" y2="183"/>
  <rect class="box" x="52" y="212" width="1543" height="550" rx="50"/>
  <text class="heading" x="675" y="288">핵심 키워드</text>
  <text class="red" x="52" y="830">오늘 과목의 중요 키워드를 메모하세요!</text>
  <text class="bottom" x="52" y="905">오늘의 메모가 상위권으로 가는 지름길이야!!</text>
</svg>`);
  }

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

function hanjaLine(entry, index) {
  const y = 405 + index * 58;
  return `<text class="hanja" x="465" y="${y}">
    <tspan class="glyph">${escapeXml(entry.glyph)}(${escapeXml(entry.sound)})</tspan>
    <tspan> : ${escapeXml(entry.meaning)}</tspan>
  </text>`;
}

function overlaySvg(card, width, height) {
  const dictionaryLines = wrapKorean(card.dictionary, 28);
  const easyLines = wrapKorean(card.easy, 30);

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .title { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 72px; fill: #111; }
      .hanja { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 40px; fill: #111; }
      .glyph { font-weight: 900; }
      .label { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 38px; fill: #cf342e; }
      .body { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 34px; fill: #111; }
      .line { stroke: #111; stroke-width: 5; stroke-linecap: round; }
    </style>
  </defs>
  <text class="title" x="465" y="330">${escapeXml(card.title)}</text>
  ${card.hanja.map(hanjaLine).join("\n")}
  <line class="line" x1="465" y1="535" x2="1345" y2="535"/>
  <text class="label" x="125" y="600">사전 뜻</text>
  ${textBlock({ klass: "body", x: 330, y: 600, lines: dictionaryLines, lineHeight: 40 })}
  <text class="label" x="125" y="700">쉬운 풀이</text>
  ${textBlock({ klass: "body", x: 330, y: 700, lines: easyLines, lineHeight: 40 })}
</svg>`);
}

async function generateIcon(card) {
  const iconPath = path.join(iconDir, `concept-${card.slug}.png`);
  fs.mkdirSync(iconDir, { recursive: true });
  await sharp(iconSvg(card.slug)).png().toFile(iconPath);
  return iconPath;
}

async function generateMemo(card, cleanTemplate) {
  const meta = await sharp(cleanTemplate).metadata();
  const icon = await makeInkIcon(
    path.join(iconDir, `concept-${card.slug}.png`),
    270,
  );

  const image = await sharp(cleanTemplate)
    .composite([
      { input: icon, left: 125, top: 300 },
      { input: overlaySvg(card, meta.width, meta.height), left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  for (const outputDir of memoDirs) {
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
    const file = path.join(memoDirs[0], `memo-${card.slug}.png`);
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
    .toFile(path.join(memoDirs[0], "review-phase-change-memo-cards.png"));
}

(async () => {
  const cleanTemplate = await makeCleanTemplate();
  const icons = [];
  const memos = [];

  for (const card of cards) {
    icons.push(await generateIcon(card));
    await generateMemo(card, cleanTemplate);
    memos.push(path.join(memoDirs[0], `memo-${card.slug}.png`));
  }

  await makeReviewGrid();

  console.log(JSON.stringify({ icons, memos, memoDirs }, null, 2));
})();
