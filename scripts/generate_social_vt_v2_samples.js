const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const projectRoot = path.join(__dirname, "..");
const outDir = path.join(projectRoot, "outputs", "vt-social-v2-samples");

function arrow(x1, y1, x2, y2, h = 22) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const l = a + Math.PI * 0.82;
  const r = a - Math.PI * 0.82;
  const lx = x2 + Math.cos(l) * h;
  const ly = y2 + Math.sin(l) * h;
  const rx = x2 + Math.cos(r) * h;
  const ry = y2 + Math.sin(r) * h;
  return `<path d="M${x1} ${y1}L${x2} ${y2}M${lx.toFixed(1)} ${ly.toFixed(1)}L${x2} ${y2}L${rx.toFixed(1)} ${ry.toFixed(1)}"/>`;
}

function person(x, y, s = 1) {
  const r = 14 * s;
  return `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x} ${y + r}V${y + 62 * s}M${x - 28 * s} ${y + 34 * s}H${x + 28 * s}M${x} ${y + 62 * s}L${x - 22 * s} ${y + 96 * s}M${x} ${y + 62 * s}L${x + 22 * s} ${y + 96 * s}"/>`;
}

function sun(x, y, r = 24) {
  return `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x} ${y - r - 16}V${y - r - 40}M${x} ${y + r + 16}V${y + r + 40}M${x - r - 16} ${y}H${x - r - 40}M${x + r + 16} ${y}H${x + r + 40}M${x - 34} ${y - 34}L${x - 52} ${y - 52}M${x + 34} ${y - 34}L${x + 52} ${y - 52}M${x - 34} ${y + 34}L${x - 52} ${y + 52}M${x + 34} ${y + 34}L${x + 52} ${y + 52}"/>`;
}

function cloud(x, y) {
  return `<path d="M${x} ${y}C${x + 12} ${y - 34},${x + 54} ${y - 34},${x + 68} ${y - 6}C${x + 96} ${y - 22},${x + 134} ${y + 2},${x + 126} ${y + 34}H${x - 8}C${x - 34} ${y + 34},${x - 28} ${y + 2},${x} ${y}Z"/>`;
}

function globe(x, y, r, mode = "both") {
  let g = `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  if (mode !== "vertical") {
    g += `<path d="M${x - r} ${y}H${x + r}M${x - r * 0.82} ${y - r * 0.45}H${x + r * 0.82}M${x - r * 0.82} ${y + r * 0.45}H${x + r * 0.82}"/>`;
  }
  if (mode !== "horizontal") {
    g += `<path d="M${x} ${y - r}V${y + r}M${x - r * 0.45} ${y - r * 0.88}C${x - r * 0.12} ${y - r * 0.35},${x - r * 0.12} ${y + r * 0.35},${x - r * 0.45} ${y + r * 0.88}M${x + r * 0.45} ${y - r * 0.88}C${x + r * 0.12} ${y - r * 0.35},${x + r * 0.12} ${y + r * 0.35},${x + r * 0.45} ${y + r * 0.88}"/>`;
  }
  return g;
}

function scale() {
  return `<path d="M256 128V350M180 350H332M106 190H406M106 190L62 300H150Z M406 190L362 300H450Z"/>`;
}

const icons = {
  "vt-gihu-v2.svg": `
    <rect x="70" y="90" width="145" height="175" rx="16"/>
    <path d="M70 145H215M110 90V145M175 90V145"/>
    ${sun(142, 202, 18)}
    <rect x="255" y="90" width="145" height="175" rx="16"/>
    <path d="M255 145H400M295 90V145M360 90V145"/>
    ${cloud(295, 190)}
    <path d="M315 250L300 282M355 250L340 282"/>
    ${arrow(235, 315, 278, 315)}
    <path d="M110 395H420M140 370V420M200 360V420M260 345V420M320 330V420M380 315V420"/>
    <path d="M135 350C205 330,282 330,395 300"/>
  `,
  "vt-wido-v2.svg": globe(256, 256, 165, "horizontal") + `<path d="M91 256H421" stroke-width="20"/><path d="M120 180H392M120 332H392"/>`,
  "vt-gyeongdo-v2.svg": globe(256, 256, 165, "vertical") + `<path d="M256 91V421" stroke-width="20"/><path d="M176 115C232 186,232 326,176 397M336 115C280 186,280 326,336 397"/>`,
  "vt-munhwa-sangdae-v2.svg": `
    ${scale()}
    <circle cx="106" cy="300" r="30"/>
    <path d="M376 262L416 330H336Z"/>
    <path d="M256 420C210 382,196 330,212 276M256 420C302 382,316 330,300 276"/>
    <circle cx="256" cy="248" r="42"/>
    <path d="M228 248C246 228,268 228,284 248C266 270,246 270,228 248Z"/>
    <circle cx="256" cy="248" r="8"/>
  `,
  "vt-segyehwa-v2.svg": `
    ${globe(256,256,160,"both")}
    <circle cx="164" cy="204" r="16"/><circle cx="320" cy="156" r="16"/><circle cx="370" cy="305" r="16"/><circle cx="206" cy="352" r="16"/>
    <path d="M164 204L320 156L370 305L206 352L164 204M320 156L206 352" stroke-width="16"/>
  `,
  "vt-jeongchi-v2.svg": `
    ${person(110, 215, .78)}
    ${person(402, 215, .78)}
    ${arrow(162, 282, 225, 282)}
    ${arrow(350, 282, 287, 282)}
    <circle cx="256" cy="270" r="38"/>
    <path d="M256 308V390M205 350H307M190 420C235 455,280 455,325 420"/>
  `,
  "vt-huisoseong-v2.svg": `
    <circle cx="256" cy="160" r="44"/>
    <path d="M256 205V310M170 255H342"/>
    <path d="M125 405C165 350,215 330,256 310C305 333,355 350,395 405"/>
    <circle cx="256" cy="390" r="26"/>
    <path d="M88 215C130 165,176 150,224 162M424 215C382 165,336 150,288 162"/>
    <path d="M78 438H434"/>
  `,
  "vt-gihoebiyong-v2.svg": `
    <path d="M256 430V265"/>
    <path d="M256 265C205 230,155 185,110 100"/>
    <path d="M256 265C315 225,365 178,415 90"/>
    ${arrow(256, 430, 256, 265)}
    <circle cx="110" cy="100" r="28"/>
    <path d="M386 64L444 122M444 64L386 122"/>
    <path d="M210 370L302 370"/>
  `,
};

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-hidden="true">
<rect width="512" height="512" fill="#fff"/>
<g fill="none" stroke="#111" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
${body}
</g>
</svg>
`;
}

async function contactSheet(files) {
  const thumb = 180;
  const gap = 22;
  const cols = 4;
  const rows = Math.ceil(files.length / cols);
  const composites = [];
  const width = cols * thumb + (cols + 1) * gap;
  const height = rows * thumb + (rows + 1) * gap;

  for (let i = 0; i < files.length; i += 1) {
    const input = await sharp(path.join(outDir, files[i]))
      .resize(thumb, thumb, { fit: "contain", background: "#fff" })
      .png()
      .toBuffer();
    composites.push({
      input,
      left: gap + (i % cols) * (thumb + gap),
      top: gap + Math.floor(i / cols) * (thumb + gap),
    });
  }

  await sharp({ create: { width, height, channels: 3, background: "#fff" } })
    .composite(composites)
    .png()
    .toFile(path.join(outDir, "vt-social-v2-samples-contact-sheet.png"));
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const files = Object.keys(icons);
  for (const file of files) {
    fs.writeFileSync(path.join(outDir, file), svg(icons[file]), "utf8");
  }
  await contactSheet(files);
  console.log(JSON.stringify({
    count: files.length,
    outDir,
    contactSheet: path.join(outDir, "vt-social-v2-samples-contact-sheet.png"),
    files,
  }, null, 2));
})();
