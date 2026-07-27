const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const projectRoot = path.join(__dirname, "..");
const outDir = path.join(projectRoot, "public", "concept-images");
const previewDir = path.join(projectRoot, "outputs");

function a(x1, y1, x2, y2, h = 18) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const left = angle + Math.PI * 0.82;
  const right = angle - Math.PI * 0.82;
  const lx = x2 + Math.cos(left) * h;
  const ly = y2 + Math.sin(left) * h;
  const rx = x2 + Math.cos(right) * h;
  const ry = y2 + Math.sin(right) * h;
  return `<path d="M${x1} ${y1}L${x2} ${y2}M${lx.toFixed(1)} ${ly.toFixed(1)}L${x2} ${y2}L${rx.toFixed(1)} ${ry.toFixed(1)}"/>`;
}

function ca(cx, cy, r, start, end) {
  const sx = cx + r * Math.cos(start);
  const sy = cy + r * Math.sin(start);
  const ex = cx + r * Math.cos(end);
  const ey = cy + r * Math.sin(end);
  const large = Math.abs(end - start) > Math.PI ? 1 : 0;
  const sweep = end > start ? 1 : 0;
  return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}A${r} ${r} 0 ${large} ${sweep} ${ex.toFixed(1)} ${ey.toFixed(1)}"/>`;
}

function person(x, y, s = 1) {
  const r = 12 * s;
  return `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x} ${y + r}V${y + 56 * s}M${x - 22 * s} ${y + 32 * s}H${x + 22 * s}M${x} ${y + 56 * s}L${x - 20 * s} ${y + 86 * s}M${x} ${y + 56 * s}L${x + 20 * s} ${y + 86 * s}"/>`;
}

function people(points, s = 0.72) {
  return points.map(([x, y]) => person(x, y, s)).join("");
}

function building(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x + w * 0.3} ${y + 40}H${x + w * 0.7}M${x + w * 0.3} ${y + 90}H${x + w * 0.7}M${x + w * 0.3} ${y + 140}H${x + w * 0.7}"/>`;
}

function house(x, y, w = 90, h = 70) {
  return `<path d="M${x} ${y + h}V${y + 28}L${x + w / 2} ${y}L${x + w} ${y + 28}V${y + h}Z"/>`;
}

function tree(x, y, s = 1) {
  return `<path d="M${x} ${y}V${y + 95 * s}M${x} ${y + 24 * s}C${x - 40 * s} ${y + 12 * s},${x - 52 * s} ${y - 38 * s},${x - 2 * s} ${y - 48 * s}C${x + 50 * s} ${y - 40 * s},${x + 42 * s} ${y + 16 * s},${x} ${y + 24 * s}M${x} ${y + 50 * s}C${x + 52 * s} ${y + 34 * s},${x + 68 * s} ${y - 20 * s},${x + 8 * s} ${y - 32 * s}"/>`;
}

function pine(x, y, s = 1) {
  return `<path d="M${x} ${y - 85 * s}L${x - 48 * s} ${y}H${x + 48 * s}Z M${x} ${y - 130 * s}L${x - 38 * s} ${y - 50 * s}H${x + 38 * s}Z M${x} ${y}V${y + 45 * s}"/>`;
}

function sun(x, y, r = 34) {
  return `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x} ${y - r - 28}V${y - r - 62}M${x} ${y + r + 28}V${y + r + 62}M${x - r - 28} ${y}H${x - r - 62}M${x + r + 28} ${y}H${x + r + 62}M${x - 48} ${y - 48}L${x - 72} ${y - 72}M${x + 48} ${y - 48}L${x + 72} ${y - 72}M${x - 48} ${y + 48}L${x - 72} ${y + 72}M${x + 48} ${y + 48}L${x + 72} ${y + 72}"/>`;
}

function cloud(x, y) {
  return `<path d="M${x} ${y}C${x + 15} ${y - 42},${x + 65} ${y - 42},${x + 82} ${y - 8}C${x + 116} ${y - 25},${x + 160} ${y},${x + 150} ${y + 38}H${x - 10}C${x - 42} ${y + 38},${x - 34} ${y},${x} ${y}Z"/>`;
}

function globe(x = 256, y = 256, r = 160, mode = "both") {
  let body = `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  if (mode !== "vertical") {
    body += `<path d="M${x - r} ${y}H${x + r}M${x - r * 0.86} ${y - r * 0.48}H${x + r * 0.86}M${x - r * 0.86} ${y + r * 0.48}H${x + r * 0.86}"/>`;
  }
  if (mode !== "horizontal") {
    body += `<path d="M${x} ${y - r}V${y + r}M${x - r * 0.5} ${y - r * 0.86}C${x - r * 0.08} ${y - r * 0.35},${x - r * 0.08} ${y + r * 0.35},${x - r * 0.5} ${y + r * 0.86}M${x + r * 0.5} ${y - r * 0.86}C${x + r * 0.08} ${y - r * 0.35},${x + r * 0.08} ${y + r * 0.35},${x + r * 0.5} ${y + r * 0.86}"/>`;
  }
  return body;
}

function scales(x = 256, y = 170, spread = 150) {
  return `<path d="M${x} ${y}V${y + 210}M${x - 80} ${y + 210}H${x + 80}M${x - spread} ${y + 50}H${x + spread}M${x - spread} ${y + 50}L${x - spread - 55} ${y + 160}H${x - spread + 55}Z M${x + spread} ${y + 50}L${x + spread - 55} ${y + 160}H${x + spread + 55}Z"/>`;
}

function hand(x, y, flip = 1) {
  return `<path d="M${x} ${y}C${x + 36 * flip} ${y - 35},${x + 78 * flip} ${y - 35},${x + 118 * flip} ${y}M${x + 118 * flip} ${y}L${x + 168 * flip} ${y}M${x + 38 * flip} ${y - 8}L${x + 68 * flip} ${y - 38}"/>`;
}

const icons = {
  "vt-gihu.svg": `<rect x="120" y="120" width="272" height="248" rx="18"/><path d="M120 185H392M185 120V185M327 120V185"/><circle cx="180" cy="245" r="24"/><path d="M245 286C274 235,318 328,360 260M170 330H335"/>`,
  "vt-jihyeong.svg": `<path d="M64 360H448"/><path d="M95 360L190 205L285 360M210 360L315 145L430 360"/><path d="M65 405C135 370,188 438,260 405C330 372,384 435,448 405"/>`,
  "vt-wido.svg": globe(256, 256, 170, "horizontal") + `<path d="M86 256H426"/>`,
  "vt-gyeongdo.svg": globe(256, 256, 170, "vertical") + `<path d="M256 86V426"/>`,
  "vt-gangsuryang.svg": cloud(126, 112) + `<path d="M168 220L145 270M230 220L207 270M292 220L269 270"/><path d="M190 325H330L306 440H214Z"/><path d="M214 390H306M330 325H370"/>`,
  "vt-gyejeolpung.svg": sun(145, 150, 30) + `<path d="M320 126L360 166M360 126L320 166M340 98V194M292 146H388"/>` + ca(256, 256, 180, -2.7, -0.25) + a(415, 210, 450, 255) + ca(256, 256, 180, 0.45, 2.9) + a(92, 305, 55, 255),
  "vt-yeoldae-gihu.svg": `<path d="M70 362H442"/><path d="M256 105V430"/><path d="M256 220C175 220,140 276,112 338M256 220C335 220,374 274,410 338"/><circle cx="140" cy="110" r="35"/><path d="M322 142L300 205M352 148L320 220M384 164L338 236M155 258L135 320M205 258L185 320M372 258L352 320"/>`,
  "vt-geonjo-gihu.svg": sun(395, 105, 30) + `<path d="M70 382H440M88 382L140 322L195 382M210 382L270 285L345 382M112 430L175 395L230 430M245 430L300 395L375 430"/><path d="M170 300V190M170 240C130 240,125 200,125 178M170 245C220 245,225 200,225 178"/>`,
  "vt-ondae-gihu.svg": `<circle cx="256" cy="256" r="170"/>${sun(256, 96, 20)}<path d="M376 185C410 215,415 265,385 300"/><path d="M303 402C255 430,205 415,175 385"/><path d="M126 210C100 250,102 305,136 340"/><path d="M190 150C225 130,292 130,325 150"/>`,
  "vt-naengdae-gihu.svg": pine(145, 342, 0.95) + pine(250, 330, 1.15) + pine(360, 345, 0.95) + `<path d="M65 408H450M155 112L195 152M195 112L155 152M175 92V172M135 132H215"/>`,
  "vt-handae-gihu.svg": `<path d="M55 386H460"/><path d="M90 386L160 250L235 386M220 386L312 210L430 386"/><path d="M150 120L198 168M198 120L150 168M174 95V192M125 144H223"/><path d="M82 430C145 400,206 460,270 430C336 400,390 458,450 430"/>`,
  "vt-inggu-mildo.svg": `<rect x="64" y="118" width="175" height="275"/><rect x="273" y="118" width="175" height="275"/>${people([[105,155],[155,155],[205,155],[105,235],[155,235],[205,235],[105,315],[155,315],[205,315]],0.42)}${people([[320,180],[397,250],[336,330]],0.42)}`,
  "vt-dosihwa.svg": house(70, 285, 90, 70) + tree(185, 275, 0.5) + a(230, 310, 315, 310) + building(330, 210, 55, 145) + building(400, 145, 65, 210) + people([[352,380],[420,382]],0.45),
  "vt-ichon-hyangdo.svg": house(62, 300, 85, 65) + tree(173, 286, 0.45) + person(238, 290, 0.55) + a(270, 315, 355, 260) + building(370, 205, 55, 165) + building(435, 160, 55, 210),
  "vt-inggu-gujo.svg": `<path d="M256 88V420M150 420H362"/><path d="M256 130H210M256 130H302M256 175H185M256 175H327M256 220H160M256 220H352M256 265H140M256 265H372M256 310H165M256 310H347M256 355H195M256 355H317"/>`,
  "vt-jawon.svg": `<path d="M145 105C93 172,85 220,145 262C205 220,197 172,145 105Z"/>${tree(292, 250,0.9)}<path d="M346 385L410 290L462 385Z"/><circle cx="256" cy="256" r="202"/>`,
  "vt-saneop.svg": `<path d="M95 360V250M65 300C90 260,120 260,145 300M95 250L62 210M95 250L128 210"/><path d="M210 370V240L275 285V240L340 285V370Z"/><circle cx="425" cy="265" r="35"/><path d="M425 300V380M382 335H468"/>${a(150,320,205,320,14)}${a(340,320,390,320,14)}`,
  "vt-munhwa.svg": `${people([[170,185],[256,150],[342,185]],0.55)}<path d="M125 330C190 390,325 390,390 330M150 330V265H220V330M280 330V250H360V330"/><circle cx="256" cy="292" r="34"/>`,
  "vt-munhwa-sangdae.svg": scales(256,125,125) + `<circle cx="131" cy="285" r="28"/><path d="M353 285L381 237L409 285Z"/>`,
  "vt-jamunhwa-jungsim.svg": `<circle cx="256" cy="200" r="64"/>${person(256,250,0.7)}${a(230,315,150,390,16)}${a(282,315,365,390,16)}${people([[128,395],[385,395]],0.45)}<path d="M210 130H302"/>`,
  "vt-munhwa-sadae.svg": `${person(165,345,0.55)}<path d="M210 290L330 180"/><circle cx="380" cy="145" r="60"/><path d="M345 145H415M380 110V180"/><path d="M120 430H230M320 245H455"/>`,
  "vt-damunhwa.svg": `<circle cx="256" cy="256" r="75"/><circle cx="130" cy="160" r="30"/><path d="M345 132L388 202H302Z"/><rect x="108" y="320" width="62" height="62"/><path d="M370 320C420 330,420 390,370 400C320 390,320 330,370 320Z"/>${a(154,182,205,220,12)}${a(340,204,300,230,12)}${a(165,330,210,288,12)}${a(343,330,303,290,12)}`,
  "vt-munhwa-hoegilhwa.svg": `<circle cx="120" cy="175" r="30"/><path d="M220 145L260 210H180Z"/><path d="M120 325C165 300,190 365,130 380C90 360,90 335,120 325Z"/><rect x="365" y="145" width="70" height="70"/><rect x="365" y="255" width="70" height="70"/><rect x="365" y="365" width="70" height="70"/>${a(160,180,340,180)}${a(250,190,340,290)}${a(160,350,340,395)}`,
  "vt-munhwa-yunghap.svg": `<circle cx="135" cy="240" r="45"/><path d="M145 368L188 292L231 368Z"/>${a(200,250,292,278)}${a(230,340,300,310)}<path d="M366 238L389 292L448 298L403 336L416 392L366 362L316 392L329 336L284 298L343 292Z"/>`,
  "vt-segyehwa.svg": globe(256,256,165,"both") + `<circle cx="165" cy="205" r="12"/><circle cx="310" cy="160" r="12"/><circle cx="360" cy="300" r="12"/><circle cx="205" cy="340" r="12"/><path d="M165 205L310 160L360 300L205 340L165 205M310 160L205 340"/>`,
  "vt-jiyeokhwa.svg": `<path d="M250 85C180 85,135 140,135 205C135 290,250 395,250 395C250 395,365 290,365 205C365 140,320 85,250 85Z"/><circle cx="250" cy="205" r="48"/>${house(210,250,80,60)}<path d="M85 430C150 385,215 455,280 415C335 380,390 420,435 390"/>`,
  "vt-segye-simin.svg": globe(256,220,110,"both") + `${people([[145,340],[256,370],[367,340]],0.55)}<path d="M145 325C185 415,325 415,367 325"/>`,
  "vt-sanghojagyong.svg": `<circle cx="150" cy="256" r="72"/><circle cx="362" cy="256" r="72"/>${a(220,220,292,220)}${a(292,292,220,292)}`,
  "vt-jiri-pyosije.svg": `<path d="M135 255H330V390H135Z"/><path d="M160 255C160 180,230 150,280 205C335 160,410 205,392 280C438 320,400 390,330 390"/><path d="M360 115C315 115,290 150,290 185C290 235,360 300,360 300C360 300,430 235,430 185C430 150,405 115,360 115Z"/><circle cx="360" cy="182" r="20"/>`,
  "vt-galdeung.svg": `${a(95,175,395,395)}${a(417,175,115,395)}<path d="M180 235C245 190,275 300,335 250M180 330C245 375,275 265,335 315"/>`,
  "vt-gongjon.svg": `<circle cx="150" cy="260" r="42"/><path d="M255 215L310 310H200Z"/><rect x="360" y="220" width="75" height="75"/><path d="M100 365C180 425,330 425,430 365"/><path d="M80 200C170 95,340 95,432 200"/>`,
  "vt-nanmin.svg": house(72,180,92,70) + `<path d="M72 250L164 180M164 250L72 180"/>${person(250,285,0.75)}<path d="M305 350L360 315L395 360L340 395Z"/>${a(410,335,455,335)}<path d="M95 420H455"/>`,
  "vt-pyeongyeon.svg": `<circle cx="175" cy="210" r="60"/><circle cx="310" cy="210" r="60"/><path d="M235 210H250M123 180L85 145M362 180L400 145"/><path d="M175 290L105 405M310 290L385 405"/><path d="M95 405C145 365,215 365,255 405"/>`,
  "vt-chabyeol.svg": `${people([[130,230],[210,230],[290,230],[370,230]],0.5)}<path d="M95 350H400M400 350V260"/>${person(438,230,0.5)}<path d="M390 300L440 260"/>`,
  "vt-sahoehwa.svg": `${person(120,300,0.58)}${a(170,310,245,260)}${people([[275,190],[355,230],[310,320]],0.5)}<path d="M235 370C305 430,390 405,430 340"/>`,
  "vt-jaesahoehwa.svg": `${person(145,300,0.62)}${a(205,310,300,310)}<path d="M315 190H430V390H315Z"/><path d="M350 250H395M350 305H395"/>${ca(240,250,95,-2.2,0.8)}${a(300,320,320,355,14)}`,
  "vt-sahoejeok-jiwi.svg": `<path d="M95 395H420M145 395V325H245V395M245 395V250H345V395M345 395V175H445V395"/>${person(195,245,0.5)}${person(295,170,0.5)}${person(395,95,0.5)}<rect x="174" y="310" width="42" height="24"/><rect x="274" y="235" width="42" height="24"/><rect x="374" y="160" width="42" height="24"/>`,
  "vt-yeokhal.svg": `${person(185,220,0.65)}<rect x="165" y="285" width="45" height="30"/>${a(240,260,325,205)}<path d="M340 145H430V245H340Z"/><path d="M340 195H430"/>${a(240,300,335,350)}<circle cx="380" cy="360" r="42"/>`,
  "vt-sahoe-jipdan.svg": `<ellipse cx="256" cy="256" rx="180" ry="145"/>${people([[170,195],[256,170],[342,195],[210,295],[305,295]],0.52)}<path d="M170 250L256 225L342 250M210 330L305 330"/>${person(450,370,0.4)}`,
  "vt-gyubeom.svg": `<path d="M90 390H425M120 390V315H225V390M225 390V240H330V390M330 390V165H435V390"/><path d="M145 340C180 315,200 315,225 340M250 270L305 270M360 218H405M382 190V245"/>`,
  "vt-jeongchi.svg": `${a(90,210,220,260)}${a(420,210,290,260)}${person(256,260,0.68)}<path d="M178 355C220 410,295 410,335 355"/><path d="M210 320H302"/>`,
  "vt-minjujuui.svg": `<rect x="160" y="290" width="205" height="120"/><path d="M205 290L262 245L320 290M262 245V120M218 150V240M306 150V240M120 260C145 220,170 220,195 260M330 260C355 220,380 220,405 260"/>`,
  "vt-ingwon.svg": `<path d="M256 80C330 130,395 132,430 130C430 275,370 385,256 435C142 385,82 275,82 130C117 132,182 130,256 80Z"/>${people([[170,225],[256,225],[342,225]],0.54)}<path d="M145 350H367"/>`,
  "vt-heonbeop.svg": `<path d="M256 92L430 405H82Z"/><path d="M145 290H367M185 215H327"/><path d="M228 150H284"/>`,
  "vt-jaepan.svg": scales(250,105,120) + `<path d="M365 365L430 430M395 335L460 400M360 430H470"/>`,
  "vt-huisoseong.svg": `<circle cx="145" cy="170" r="28"/><circle cx="95" cy="245" r="28"/><circle cx="185" cy="250" r="28"/><circle cx="135" cy="325" r="28"/><circle cx="220" cy="350" r="28"/>${a(255,260,340,260)}<path d="M380 210C335 270,335 335,390 375C445 335,445 270,380 210Z"/>`,
  "vt-gihoebiyong.svg": `<path d="M105 410C160 330,205 285,256 250C315 290,365 335,425 410M256 250V105"/>${a(256,105,256,70)}<path d="M256 250C190 235,150 195,120 135M256 250C330 230,375 190,410 120"/><path d="M392 100L428 136M428 100L392 136"/>`,
  "vt-suyo.svg": `<path d="M150 260H315L285 385H180Z"/><path d="M170 260C180 190,275 190,295 260"/><circle cx="206" cy="425" r="18"/><circle cx="270" cy="425" r="18"/>${a(390,150,390,300)}<circle cx="390" cy="355" r="20"/><circle cx="425" cy="355" r="20"/><circle cx="460" cy="355" r="20"/>`,
  "vt-gonggeup.svg": `<path d="M120 150H350V380H120Z"/><path d="M120 225H350M120 300H350"/><rect x="145" y="170" width="45" height="35"/><rect x="220" y="170" width="45" height="35"/><rect x="145" y="245" width="45" height="35"/><rect x="220" y="245" width="45" height="35"/><rect x="145" y="320" width="45" height="35"/><rect x="220" y="320" width="45" height="35"/>${a(425,365,425,170)}`,
  "vt-buneop.svg": `${person(95,230,0.48)}<rect x="65" y="330" width="75" height="55"/>${a(145,360,205,360)}${person(245,230,0.48)}<circle cx="245" cy="358" r="35"/>${a(290,360,350,360)}${person(390,230,0.48)}<path d="M360 390H440L400 315Z"/>`,
};

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-hidden="true">
<rect width="512" height="512" fill="#fff"/>
<g fill="none" stroke="#111" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
${body}
</g>
</svg>
`;
}

async function makeContactSheet(files) {
  const thumb = 128;
  const gap = 18;
  const cols = 10;
  const rows = Math.ceil(files.length / cols);
  const width = cols * thumb + (cols + 1) * gap;
  const height = rows * thumb + (rows + 1) * gap;
  const composites = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const buffer = await sharp(path.join(outDir, file))
      .resize(thumb, thumb, { fit: "contain", background: "#fff" })
      .png()
      .toBuffer();
    const x = gap + (i % cols) * (thumb + gap);
    const y = gap + Math.floor(i / cols) * (thumb + gap);
    composites.push({ input: buffer, left: x, top: y });
  }

  fs.mkdirSync(previewDir, { recursive: true });
  await sharp({ create: { width, height, channels: 3, background: "#fff" } })
    .composite(composites)
    .png()
    .toFile(path.join(previewDir, "vt-social-50-contact-sheet.png"));
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const files = Object.keys(icons);
  for (const file of files) {
    fs.writeFileSync(path.join(outDir, file), svg(icons[file]), "utf8");
  }
  await makeContactSheet(files);
  console.log(JSON.stringify({
    count: files.length,
    outDir,
    contactSheet: path.join(previewDir, "vt-social-50-contact-sheet.png"),
    files,
  }, null, 2));
})();
