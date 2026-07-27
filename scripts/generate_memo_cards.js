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
    slug: "gosan-gihu",
    title: "고산 기후",
    icon: "concept-gosan-gihu.png",
    hanja: "高 높을 고 + 山 산 산 + 氣 기운 기 + 候 기후 후",
    meaning: "높은 산지에서 나타나는 서늘한 기후",
    example: "높이 올라갈수록 기온이 낮아지고 바람이 차다.",
    picture: "산 위쪽과 낮은 온도 표시를 함께 본다.",
  },
  {
    slug: "buneop",
    title: "분업",
    icon: "concept-buneop.png",
    hanja: "分 나눌 분 + 業 일 업",
    meaning: "여러 사람이 일을 나누어 맡아 함께 완성하는 것",
    example: "한 사람은 재료 준비, 한 사람은 조립, 한 사람은 확인을 맡는다.",
    picture: "각자 다른 일을 해서 하나의 결과물로 모인다.",
  },
  {
    slug: "jahoesa",
    title: "자회사",
    icon: "concept-jahoesa-v2.png",
    hanja: "子 자식 자 + 會 모일 회 + 社 회사 사",
    meaning: "큰 회사가 소유하거나 관리하는 작은 회사",
    example: "큰 회사 아래에 따로 세운 작은 회사가 일을 맡는다.",
    picture: "큰 회사에서 작은 회사로 연결되어 있다.",
  },
  {
    slug: "jisa",
    title: "지사",
    icon: "concept-jisa-v2.png",
    hanja: "支 가지 지 + 社 회사 사",
    meaning: "본사와 같은 회사가 다른 지역에 낸 사무소",
    example: "서울 본사의 부산 지사, 해외 지사처럼 지역에 둔다.",
    picture: "본사에서 여러 지역 사무소로 가지처럼 뻗는다.",
  },
  {
    slug: "damunhwa",
    title: "다문화",
    icon: "concept-damunhwa.png",
    hanja: "多 많을 다 + 文 글월 문 + 化 될 화",
    meaning: "여러 문화가 한 사회 안에서 함께 살아가는 것",
    example: "서로 다른 음식, 말, 생활 방식을 존중한다.",
    picture: "다양한 사람이 한 공동체를 이룬다.",
  },
  {
    slug: "iju",
    title: "이주",
    icon: "concept-iju.png",
    hanja: "移 옮길 이 + 住 살 주",
    meaning: "살 곳을 옮겨 다른 지역이나 나라로 가는 것",
    example: "가족이 일자리 때문에 다른 도시로 옮겨 산다.",
    picture: "한 곳에서 다른 곳으로 사람이 이동한다.",
  },
  {
    slug: "wonjumin",
    title: "원주민",
    icon: "concept-wonjumin.png",
    hanja: "原 근본 원 + 住 살 주 + 民 백성 민",
    meaning: "오래전부터 그 땅에 살아온 사람들",
    example: "그 지역의 자연과 생활 방식을 이어 온 사람들이다.",
    picture: "땅, 뿌리, 발자국으로 오래 산 곳을 나타낸다.",
  },
  {
    slug: "jaengtal",
    title: "쟁탈",
    icon: "concept-jaengtal.png",
    hanja: "爭 다툴 쟁 + 奪 빼앗을 탈",
    meaning: "서로 차지하려고 다투어 빼앗으려는 것",
    example: "한정된 자원이나 땅을 서로 차지하려고 한다.",
    picture: "양쪽에서 같은 대상을 끌어당긴다.",
  },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const titleSize = card.title.length >= 5 ? 68 : 76;
  const hanjaSize = card.hanja.length > 34 ? 40 : 45;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .title { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: ${titleSize}px; fill: #111; }
      .hanja { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: ${hanjaSize}px; fill: #111; }
      .label { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 900; font-size: 42px; fill: #cf342e; }
      .body { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 42px; fill: #111; }
      .small { font-family: "Malgun Gothic", "Arial", sans-serif; font-weight: 800; font-size: 36px; fill: #111; }
      .line { stroke: #111; stroke-width: 5; stroke-linecap: round; }
    </style>
  </defs>
  <text class="title" x="455" y="355">${escapeXml(card.title)}</text>
  <text class="hanja" x="455" y="430">${escapeXml(card.hanja)}</text>
  <line class="line" x1="455" y1="470" x2="1345" y2="470"/>
  <text class="label" x="125" y="575">뜻</text>
  <text class="body" x="220" y="575">${escapeXml(card.meaning)}</text>
  <text class="label" x="125" y="655">예시</text>
  <text class="small" x="250" y="655">${escapeXml(card.example)}</text>
  <text class="label" x="125" y="735">그림</text>
  <text class="small" x="250" y="735">${escapeXml(card.picture)}</text>
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

  return image;
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
    .toFile(path.join(outputDirs[0], "review-memo-cards.png"));
}

(async () => {
  if (!fs.existsSync(template)) {
    throw new Error(`Template image not found: ${template}`);
  }

  for (const card of cards) {
    await generateCard(card);
  }
  await makeReviewGrid();

  console.log(JSON.stringify({
    cards: cards.map((card) => `memo-${card.slug}.png`),
    outputDirs,
  }, null, 2));
})();
