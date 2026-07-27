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
    slug: "eunggo-connection",
    iconSlug: "eunggo-connection",
    title: "응고",
    links: [
      { known: "응어리", hanja: "凝(응)", meaning: "엉기다" },
      { known: "고집 · 고정 · 고체", hanja: "固(고)", meaning: "굳다" },
    ],
    dictionary: "액체가 열을 잃어 고체로 변하는 현상.",
    easy: "흐르던 알갱이들이 식으면서 서로 엉겨 단단하게 굳음.",
  },
  {
    slug: "jeungbal-connection",
    iconSlug: "jeungbal-connection",
    title: "증발",
    links: [
      { known: "증기기관차", hanja: "蒸(증)", meaning: "수증기가 오르다" },
      { known: "출발 · 발생", hanja: "發(발)", meaning: "나오다, 일어나다" },
    ],
    dictionary: "액체가 표면에서 기체로 변하여 공기 중으로 날아가는 현상.",
    easy: "물 알갱이가 열을 받아 수증기가 되어 위로 올라감.",
  },
  {
    slug: "hwaksan-connection",
    iconSlug: "hwaksan-connection",
    title: "확산",
    links: [
      { known: "확장", hanja: "擴(확)", meaning: "넓히다" },
      { known: "분산", hanja: "散(산)", meaning: "흩어지다" },
    ],
    dictionary: "물질이 농도가 높은 곳에서 낮은 곳으로 퍼져 나가는 현상.",
    easy: "모여 있던 알갱이들이 사방으로 흩어져 넓게 퍼짐.",
  },
  {
    slug: "gihwa-connection",
    iconSlug: "gihwa-connection",
    title: "기화",
    links: [
      { known: "기체 · 공기", hanja: "氣(기)", meaning: "기운, 기체" },
      { known: "변화 · 화장", hanja: "化(화)", meaning: "변하다" },
    ],
    dictionary: "액체가 열을 받아 기체로 변하는 현상.",
    easy: "가까이 있던 액체 알갱이들이 열을 받아 멀리 퍼져 날아감.",
  },
  {
    slug: "aekhwa-connection",
    iconSlug: "aekhwa-connection",
    title: "액화",
    links: [
      { known: "액체 · 액상 · 혈액", hanja: "液(액)", meaning: "액체" },
      { known: "변화 · 화장", hanja: "化(화)", meaning: "변하다" },
    ],
    dictionary: "기체가 식거나 압력을 받아 액체로 변하는 현상.",
    easy: "멀리 퍼져 있던 기체 알갱이들이 모여 흐르는 액체가 됨.",
  },
  {
    slug: "yunghae-connection",
    iconSlug: "yunghae-connection",
    title: "융해",
    links: [
      { known: "융합 · 융통", hanja: "融(융)", meaning: "녹다, 풀리다" },
      { known: "해결 · 해체", hanja: "解(해)", meaning: "풀리다" },
    ],
    dictionary: "고체가 열을 받아 액체로 변하는 현상.",
    easy: "단단히 붙어 있던 알갱이들이 열을 받아 풀려서 흐르게 됨.",
  },
  {
    slug: "seunghwa-connection",
    iconSlug: "seunghwa-connection",
    title: "승화",
    links: [
      { known: "상승 · 승강기", hanja: "昇(승)", meaning: "오르다" },
      { known: "화려 · 무궁화", hanja: "華(화)", meaning: "빛나다, 꽃" },
    ],
    dictionary: "고체가 액체 상태를 거치지 않고 바로 기체로 변하는 현상.",
    easy: "단단한 알갱이가 녹지 않고 바로 멀리 퍼진 기체 알갱이가 됨.",
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

function arrow({ x1, y1, x2, y2, head = 26 }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const left = angle + Math.PI * 0.82;
  const right = angle - Math.PI * 0.82;
  const lx = x2 + Math.cos(left) * head;
  const ly = y2 + Math.sin(left) * head;
  const rx = x2 + Math.cos(right) * head;
  const ry = y2 + Math.sin(right) * head;
  return `<path d="M ${x1} ${y1} L ${x2} ${y2} M ${lx} ${ly} L ${x2} ${y2} L ${rx} ${ry}" />`;
}

function particles(points, radius = 23) {
  return points
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${radius}" />`)
    .join("\n");
}

function heatWaves(x, y) {
  return `
    <path d="M ${x} ${y + 80} C ${x - 18} ${y + 55}, ${x + 18} ${y + 35}, ${x} ${y + 10}" />
    <path d="M ${x + 70} ${y + 80} C ${x + 52} ${y + 55}, ${x + 88} ${y + 35}, ${x + 70} ${y + 10}" />
    <path d="M ${x + 140} ${y + 80} C ${x + 122} ${y + 55}, ${x + 158} ${y + 35}, ${x + 140} ${y + 10}" />
  `;
}

const liquid = [
  [180, 575], [260, 545], [340, 585], [210, 665], [300, 670], [385, 635],
  [270, 610],
];
const solid = [
  [625, 525], [690, 525], [755, 525], [820, 525],
  [625, 590], [690, 590], [755, 590], [820, 590],
  [625, 655], [690, 655], [755, 655], [820, 655],
  [625, 720], [690, 720], [755, 720], [820, 720],
];
const tight = [
  [420, 500], [485, 500], [550, 500],
  [420, 565], [485, 565], [550, 565],
  [420, 630], [485, 630], [550, 630],
];
const spread = [
  [215, 215], [410, 165], [625, 210], [780, 360], [620, 535],
  [330, 720], [820, 720], [515, 830],
];
const gas = [
  [620, 210], [760, 165], [890, 265], [670, 395], [840, 460], [950, 575],
];
const liquidRight = [
  [620, 590], [700, 555], [780, 595], [650, 675], [740, 680], [825, 640],
  [710, 625],
];
const solidLeft = [
  [150, 525], [215, 525], [280, 525], [345, 525],
  [150, 590], [215, 590], [280, 590], [345, 590],
  [150, 655], [215, 655], [280, 655], [345, 655],
  [150, 720], [215, 720], [280, 720], [345, 720],
];

function iconSvg(kind) {
  const drawings = {
    "eunggo-connection": `
      ${particles(liquid)}
      <path d="M 130 705 C 225 780, 365 780, 450 705" />
      ${arrow({ x1: 470, y1: 625, x2: 585, y2: 625 })}
      ${particles(solid)}
      ${arrow({ x1: 245, y1: 835, x2: 195, y2: 760, head: 18 })}
      ${arrow({ x1: 295, y1: 845, x2: 295, y2: 760, head: 18 })}
      ${arrow({ x1: 345, y1: 835, x2: 395, y2: 760, head: 18 })}
    `,
    "jeungbal-connection": `
      <path d="M 150 690 C 260 760, 420 760, 535 690" />
      ${particles([
        [220, 620], [300, 590], [390, 620], [260, 680], [350, 675],
      ], 24)}
      ${heatWaves(230, 780)}
      ${arrow({ x1: 590, y1: 640, x2: 700, y2: 390, head: 30 })}
      ${arrow({ x1: 720, y1: 670, x2: 820, y2: 310, head: 30 })}
      <circle cx="705" cy="315" r="31" />
      <circle cx="825" cy="235" r="31" />
      <circle cx="905" cy="390" r="31" />
      <circle cx="760" cy="485" r="25" />
    `,
    "hwaksan-connection": `
      ${particles(tight, 25)}
      ${arrow({ x1: 485, y1: 565, x2: 215, y2: 215, head: 22 })}
      ${arrow({ x1: 485, y1: 565, x2: 410, y2: 165, head: 22 })}
      ${arrow({ x1: 485, y1: 565, x2: 625, y2: 210, head: 22 })}
      ${arrow({ x1: 485, y1: 565, x2: 780, y2: 360, head: 22 })}
      ${arrow({ x1: 485, y1: 565, x2: 620, y2: 535, head: 22 })}
      ${arrow({ x1: 485, y1: 565, x2: 330, y2: 720, head: 22 })}
      ${arrow({ x1: 485, y1: 565, x2: 820, y2: 720, head: 22 })}
      ${arrow({ x1: 485, y1: 565, x2: 515, y2: 830, head: 22 })}
      ${particles(spread, 25)}
    `,
    "hwa-connection": `
      <circle cx="285" cy="530" r="140" />
      ${arrow({ x1: 455, y1: 530, x2: 600, y2: 530, head: 30 })}
      <path d="M 760 350 L 935 700 L 585 700 Z" />
      <path d="M 260 745 C 365 825, 560 825, 735 735" />
      ${arrow({ x1: 720, y1: 735, x2: 800, y2: 685, head: 20 })}
    `,
    "gihwa-connection": `
      ${particles(liquid)}
      <path d="M 130 705 C 225 780, 365 780, 450 705" />
      ${heatWaves(190, 805)}
      ${arrow({ x1: 440, y1: 610, x2: 610, y2: 380, head: 28 })}
      ${particles(gas, 24)}
    `,
    "aekhwa-connection": `
      ${particles(gas.map(([x, y]) => [x - 470, y + 70]), 24)}
      ${arrow({ x1: 430, y1: 380, x2: 610, y2: 575, head: 28 })}
      ${arrow({ x1: 930, y1: 380, x2: 790, y2: 575, head: 28 })}
      ${particles(liquidRight)}
      <path d="M 575 705 C 675 780, 830 780, 915 705" />
      ${arrow({ x1: 705, y1: 840, x2: 655, y2: 760, head: 18 })}
      ${arrow({ x1: 760, y1: 850, x2: 760, y2: 760, head: 18 })}
      ${arrow({ x1: 815, y1: 840, x2: 865, y2: 760, head: 18 })}
    `,
    "yunghae-connection": `
      ${particles(solidLeft)}
      ${heatWaves(180, 805)}
      ${arrow({ x1: 430, y1: 625, x2: 585, y2: 625, head: 28 })}
      ${particles(liquidRight)}
      <path d="M 575 705 C 675 780, 830 780, 915 705" />
    `,
    "seunghwa-connection": `
      ${particles(solidLeft)}
      ${heatWaves(180, 805)}
      ${arrow({ x1: 415, y1: 555, x2: 595, y2: 360, head: 28 })}
      ${particles(gas, 24)}
    `,
  };

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#fff"/>
  <g fill="none" stroke="#111" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
    ${drawings[kind]}
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

function linkRows(card) {
  return card.links
    .map((link, index) => {
      const y = 408 + index * 58;
      return `
        <text class="known" x="465" y="${y}">${escapeXml(link.known)}</text>
        <text class="arrow-text" x="760" y="${y}">→</text>
        <text class="hanja" x="825" y="${y}">
          <tspan class="glyph">${escapeXml(link.hanja)}</tspan>
          <tspan> : ${escapeXml(link.meaning)}</tspan>
        </text>
      `;
    })
    .join("\n");
}

function overlaySvg(card, width, height) {
  const dictionaryLines = wrapKorean(card.dictionary, 30);
  const easyLines = wrapKorean(card.easy, 31);
  const titleSize = card.title.length >= 3 ? 64 : 76;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .title { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: ${titleSize}px; fill: #111; }
      .mini { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 32px; fill: #2d8b3b; }
      .known { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 38px; fill: #111; }
      .arrow-text { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 38px; fill: #111; }
      .hanja { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 38px; fill: #111; }
      .glyph { font-weight: 900; }
      .label { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 38px; fill: #cf342e; }
      .body { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 34px; fill: #111; }
      .line { stroke: #111; stroke-width: 5; stroke-linecap: round; }
    </style>
  </defs>
  <text class="title" x="465" y="330">${escapeXml(card.title)}</text>
  <text class="mini" x="735" y="330">아는 단어 → 한자 뜻</text>
  ${linkRows(card)}
  <line class="line" x1="465" y1="535" x2="1345" y2="535"/>
  <text class="label" x="125" y="600">사전 뜻</text>
  ${textBlock({ klass: "body", x: 330, y: 600, lines: dictionaryLines, lineHeight: 40 })}
  <text class="label" x="125" y="700">쉬운 풀이</text>
  ${textBlock({ klass: "body", x: 330, y: 700, lines: easyLines, lineHeight: 40 })}
</svg>`);
}

async function generateIcon(card) {
  const iconPath = path.join(iconDir, `concept-${card.iconSlug}.png`);
  fs.mkdirSync(iconDir, { recursive: true });
  await sharp(iconSvg(card.iconSlug)).png().toFile(iconPath);
  return iconPath;
}

async function generateMemo(card, cleanTemplate) {
  const meta = await sharp(cleanTemplate).metadata();
  const icon = await makeInkIcon(
    path.join(iconDir, `concept-${card.iconSlug}.png`),
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
    .toFile(path.join(memoDirs[0], "review-known-word-connection-cards.png"));
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
