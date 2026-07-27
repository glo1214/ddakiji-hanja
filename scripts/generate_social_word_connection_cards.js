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
    slug: "bujok-connection",
    title: "부족",
    mini: "아는 단어 → 한자 뜻",
    links: [
      { known: "부서 · 부분", target: "部(부)", meaning: "나누어진 무리" },
      { known: "가족 · 민족", target: "族(족)", meaning: "겨레, 무리" },
    ],
    dictionary: "같은 조상이나 생활 방식을 바탕으로 모여 사는 사람들의 집단.",
    easy: "비슷한 혈연과 문화를 가진 사람들이 한 무리로 살아감.",
  },
  {
    slug: "sinjaesaeng-energy-connection",
    title: "신재생에너지",
    mini: "아는 단어 → 한자 뜻",
    links: [
      { known: "신제품 · 신입", target: "新(신)", meaning: "새롭다" },
      { known: "재사용 · 재활용", target: "再(재)", meaning: "다시" },
      { known: "생명 · 생활", target: "生(생)", meaning: "살다, 생겨나다" },
    ],
    dictionary: "햇빛, 바람, 물처럼 계속 쓰거나 다시 생겨나는 자원으로 만든 에너지.",
    easy: "써도 다시 얻을 수 있는 자연의 힘으로 전기나 열을 만듦.",
  },
  {
    slug: "munmyeong-connection",
    title: "문명",
    mini: "아는 단어 → 한자 뜻",
    links: [
      { known: "문자 · 문화", target: "文(문)", meaning: "글, 문화" },
      { known: "조명 · 명확", target: "明(명)", meaning: "밝다" },
    ],
    dictionary: "인류가 이룬 발달된 사회, 기술, 제도, 문화의 모습.",
    easy: "사람들이 모여 도시, 문자, 기술, 규칙을 만들며 발전한 삶의 모습.",
  },
  {
    slug: "gia-connection",
    title: "기아",
    mini: "아는 말 → 한자 뜻",
    links: [
      { known: "배고픔 · 기근", target: "飢(기)", meaning: "굶주리다" },
      { known: "아사", target: "餓(아)", meaning: "굶주리다" },
    ],
    dictionary: "먹을 것이 부족하여 굶주리는 상태.",
    easy: "몸에 필요한 음식을 얻지 못해 오래 배고픈 상태.",
  },
  {
    slug: "yukseong-connection",
    title: "육성",
    mini: "아는 단어 → 한자 뜻",
    links: [
      { known: "교육 · 체육", target: "育(육)", meaning: "기르다" },
      { known: "성장 · 완성", target: "成(성)", meaning: "이루다" },
    ],
    dictionary: "사람이나 산업 등을 길러 발전하게 함.",
    easy: "작은 가능성이 자라도록 도와서 더 크게 발전시킴.",
  },
  {
    slug: "kudeta-connection",
    title: "쿠데타",
    mini: "아는 단어 → 뜻 연결",
    links: [
      { known: "갑작스러운 공격", target: "갑자기", meaning: "예고 없이 일어남" },
      { known: "권력 빼앗기", target: "권력 장악", meaning: "정권을 차지함" },
    ],
    dictionary: "군대나 일부 세력이 무력으로 갑자기 정권을 빼앗는 일.",
    easy: "정해진 절차가 아니라 힘으로 정부의 자리를 빼앗음.",
  },
  {
    slug: "naejeon-connection",
    title: "내전",
    mini: "아는 단어 → 한자 뜻",
    links: [
      { known: "내부 · 실내", target: "內(내)", meaning: "안" },
      { known: "전쟁 · 전투", target: "戰(전)", meaning: "싸움" },
    ],
    dictionary: "한 나라 안에서 같은 국민이나 집단끼리 벌이는 전쟁.",
    easy: "나라 밖의 적이 아니라 나라 안의 편끼리 서로 싸움.",
  },
  {
    slug: "dokjae-connection",
    title: "독재",
    mini: "아는 단어 → 한자 뜻",
    links: [
      { known: "독립 · 단독", target: "獨(독)", meaning: "홀로" },
      { known: "재판 · 재량", target: "裁(재)", meaning: "판단하고 다스리다" },
    ],
    dictionary: "한 사람이나 한 집단이 권력을 독차지하여 마음대로 다스림.",
    easy: "여러 사람의 의견보다 한 사람의 명령으로 나라가 움직임.",
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

function person(x, y, scale = 1) {
  const h = 34 * scale;
  const r = 18 * scale;
  return `
    <circle cx="${x}" cy="${y}" r="${r}" />
    <path d="M ${x} ${y + r} V ${y + r + h}" />
    <path d="M ${x - 28 * scale} ${y + r + 18 * scale} H ${x + 28 * scale}" />
    <path d="M ${x} ${y + r + h} L ${x - 24 * scale} ${y + r + h + 34 * scale}" />
    <path d="M ${x} ${y + r + h} L ${x + 24 * scale} ${y + r + h + 34 * scale}" />
  `;
}

function particles(points, radius = 18) {
  return points
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${radius}" />`)
    .join("\n");
}

function iconSvg(kind) {
  const drawings = {
    "bujok-connection": `
      <ellipse cx="510" cy="530" rx="320" ry="230" stroke-dasharray="26 26" />
      ${person(370, 455, 0.9)}
      ${person(520, 420, 0.9)}
      ${person(660, 455, 0.9)}
      ${person(445, 610, 0.9)}
      ${person(585, 610, 0.9)}
      <path d="M 510 540 L 510 465 M 510 465 L 545 500 M 510 465 L 475 500" />
    `,
    "sinjaesaeng-energy-connection": `
      <circle cx="245" cy="245" r="80" />
      <path d="M 245 115 V 65 M 245 425 V 375 M 115 245 H 65 M 425 245 H 375 M 150 150 L 110 110 M 340 340 L 380 380 M 340 150 L 380 110 M 150 340 L 110 380" />
      <path d="M 665 355 V 710" />
      <path d="M 665 355 L 570 255 M 665 355 L 795 305 M 665 355 L 625 485" />
      <path d="M 250 750 C 360 690, 470 810, 585 750 C 685 700, 790 805, 900 750" />
      <path d="M 325 575 C 450 410, 660 260, 835 400" />
      ${arrow({ x1: 835, y1: 400, x2: 855, y2: 505, head: 24 })}
    `,
    "munmyeong-connection": `
      <path d="M 145 735 H 900" />
      <path d="M 190 735 V 560 H 330 V 735" />
      <path d="M 390 735 V 455 H 555 V 735 M 430 515 H 515 M 430 585 H 515 M 430 655 H 515" />
      <path d="M 625 735 V 390 H 835 V 735 M 670 455 H 790 M 670 535 H 790 M 670 615 H 790" />
      <path d="M 210 500 L 260 430 L 310 500" />
      <circle cx="235" cy="315" r="45" />
      <path d="M 305 300 C 430 190, 615 170, 760 260" />
      ${arrow({ x1: 760, y1: 260, x2: 805, y2: 330, head: 22 })}
    `,
    "gia-connection": `
      <path d="M 250 590 C 365 690, 535 690, 650 590" />
      <path d="M 250 590 C 355 530, 545 530, 650 590" />
      <path d="M 755 300 L 845 720" />
      <path d="M 735 300 C 800 240, 875 240, 940 300" />
      <circle cx="450" cy="440" r="26" />
      <path d="M 450 466 V 555 M 400 500 H 500 M 450 555 L 410 625 M 450 555 L 490 625" />
      <path d="M 340 380 C 380 340, 420 340, 460 380" />
      <path d="M 510 380 C 550 340, 590 340, 630 380" />
    `,
    "yukseong-connection": `
      <path d="M 300 760 C 430 720, 595 720, 725 760" />
      <path d="M 505 735 V 410" />
      <path d="M 505 560 C 390 555, 340 470, 310 390 C 430 405, 495 470, 505 560" />
      <path d="M 505 500 C 625 490, 695 405, 730 320 C 595 335, 525 405, 505 500" />
      <path d="M 240 640 C 325 690, 410 690, 505 635" />
      <path d="M 790 640 C 705 690, 620 690, 505 635" />
      ${arrow({ x1: 505, y1: 815, x2: 505, y2: 250, head: 30 })}
    `,
    "kudeta-connection": `
      <path d="M 520 300 H 685 V 455 H 520 Z" />
      <path d="M 555 455 L 535 680 M 650 455 L 675 680" />
      <circle cx="605" cy="235" r="42" />
      <path d="M 570 175 L 605 120 L 640 175" />
      ${person(280, 580, 0.85)}
      ${person(370, 605, 0.85)}
      ${arrow({ x1: 395, y1: 560, x2: 520, y2: 420, head: 24 })}
      ${arrow({ x1: 395, y1: 650, x2: 540, y2: 510, head: 24 })}
      <path d="M 750 625 L 850 725 M 850 625 L 750 725" />
    `,
    "naejeon-connection": `
      <rect x="125" y="210" width="775" height="600" rx="70" />
      <path d="M 512 250 V 770" stroke-dasharray="24 24" />
      ${person(300, 475, 0.9)}
      ${person(710, 475, 0.9)}
      ${arrow({ x1: 375, y1: 545, x2: 600, y2: 545, head: 24 })}
      ${arrow({ x1: 650, y1: 615, x2: 425, y2: 615, head: 24 })}
      <path d="M 235 330 H 790" />
      <path d="M 235 330 L 280 285 L 325 330" />
      <path d="M 700 330 L 745 285 L 790 330" />
    `,
    "dokjae-connection": `
      ${person(515, 240, 1.25)}
      <path d="M 400 420 H 630" />
      ${arrow({ x1: 515, y1: 425, x2: 260, y2: 625, head: 24 })}
      ${arrow({ x1: 515, y1: 425, x2: 515, y2: 665, head: 24 })}
      ${arrow({ x1: 515, y1: 425, x2: 770, y2: 625, head: 24 })}
      ${person(245, 705, 0.72)}
      ${person(515, 735, 0.72)}
      ${person(785, 705, 0.72)}
      <path d="M 410 145 L 515 70 L 620 145" />
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
  const rowGap = card.links.length >= 3 ? 48 : 58;
  const startY = card.links.length >= 3 ? 382 : 408;
  return card.links
    .map((link, index) => {
      const y = startY + index * rowGap;
      return `
        <text class="known" x="465" y="${y}">${escapeXml(link.known)}</text>
        <text class="arrow-text" x="760" y="${y}">→</text>
        <text class="hanja" x="825" y="${y}">
          <tspan class="glyph">${escapeXml(link.target)}</tspan>
          <tspan> : ${escapeXml(link.meaning)}</tspan>
        </text>
      `;
    })
    .join("\n");
}

function overlaySvg(card, width, height) {
  const dictionaryLines = wrapKorean(card.dictionary, 31);
  const easyLines = wrapKorean(card.easy, 31);
  const titleSize = card.title.length >= 6 ? 44 : card.title.length >= 4 ? 60 : 72;
  const titleX = card.title.length >= 6 ? 405 : 465;
  const miniX = card.title.length >= 6 ? 760 : 735;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .title { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: ${titleSize}px; fill: #111; }
      .mini { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 31px; fill: #2d8b3b; }
      .known { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 32px; fill: #111; }
      .arrow-text { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 34px; fill: #111; }
      .hanja { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 32px; fill: #111; }
      .glyph { font-weight: 900; }
      .label { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 38px; fill: #cf342e; }
      .body { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 34px; fill: #111; }
      .line { stroke: #111; stroke-width: 5; stroke-linecap: round; }
    </style>
  </defs>
  <text class="title" x="${titleX}" y="330">${escapeXml(card.title)}</text>
  <text class="mini" x="${miniX}" y="330">${escapeXml(card.mini)}</text>
  ${linkRows(card)}
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
    .toFile(path.join(memoDirs[0], "review-social-word-connection-cards.png"));
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
