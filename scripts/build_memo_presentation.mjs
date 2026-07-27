import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const [workspaceDir, outputPath, projectRoot] = process.argv.slice(2);

if (!workspaceDir || !outputPath || !projectRoot) {
  throw new Error(
    "Usage: node build_memo_presentation.mjs <workspaceDir> <outputPath> <projectRoot>",
  );
}

const cards = [
  ["협약", "memo-hyeopyak.png"],
  ["시행", "memo-sihaeng.png"],
  ["열팽창", "memo-yeolpaengchang.png"],
  ["부피", "memo-bupi.png"],
  ["회로", "memo-hoero.png"],
  ["서식지", "memo-seosikji.png"],
  ["절멸", "memo-jeolmyeol.png"],
  ["멸종", "memo-myeoljong.png"],
  ["토착", "memo-tochak.png"],
  ["현격히", "memo-hyeongyeokhi.png"],
  ["팽창", "memo-paengchang.png"],
  ["밀도", "memo-mildo.png"],
  ["습윤도", "memo-seubyundo.png"],
];

const previewDir = path.join(workspaceDir, "preview");
const layoutDir = path.join(workspaceDir, "layout");
const imageDir = path.join(projectRoot, "concept-visuals", "memo-cards");

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function readImageBlob(filePath) {
  const bytes = await fs.readFile(filePath);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.mkdir(previewDir, { recursive: true });
await fs.mkdir(layoutDir, { recursive: true });

const presentation = Presentation.create({
  slideSize: { width: 1647, height: 955 },
});

for (const [title, fileName] of cards) {
  const imagePath = path.join(imageDir, fileName);
  const slide = presentation.slides.add();
  slide.background.fill = "white";
  slide.images.add({
    blob: await readImageBlob(imagePath),
    contentType: "image/png",
    alt: `${title} 개념어 메모`,
    fit: "contain",
    position: { left: 0, top: 0, width: 1647, height: 955 },
  });
}

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(
    path.join(previewDir, `${stem}.png`),
    await presentation.export({ slide, format: "png", scale: 1 }),
  );
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(
    path.join(layoutDir, `${stem}.layout.json`),
    await layout.text(),
    "utf8",
  );
}

await writeBlob(
  path.join(workspaceDir, "deck-montage.webp"),
  await presentation.export({ format: "webp", montage: true, scale: 1 }),
);

const snapshot = await presentation.inspect({
  kind: "slide,image,layout",
  maxChars: 20000,
});
await fs.writeFile(
  path.join(workspaceDir, "deck-inspect.ndjson"),
  snapshot.ndjson,
  "utf8",
);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(outputPath);

console.log(
  JSON.stringify(
    {
      outputPath,
      slideCount: cards.length,
      montage: path.join(workspaceDir, "deck-montage.webp"),
      previewDir,
      layoutDir,
    },
    null,
    2,
  ),
);
