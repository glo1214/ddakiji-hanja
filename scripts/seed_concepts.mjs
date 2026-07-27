// 개념_시드_미래엔2022_중1_v2.json → Firestore `concepts` 컬렉션 적재.
//
// 사용법 (서비스 계정 키가 필요 — 외부 설정은 운영자 몫):
//   1) Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성 → serviceAccountKey.json
//   2) npm i -D firebase-admin
//   3) GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/seed_concepts.mjs
//      (또는 키 경로를 SERVICE_ACCOUNT 환경변수로)
//
// 참고: 앱 런타임은 개념 메타를 번들(lib/learn/concepts.ts)에서 읽으므로,
//       이 스크립트는 선생님용 교차 학생 집계 등 서버측 조회가 필요할 때만 돌리면 된다.

import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const here = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(here, "..", "개념_시드_미래엔2022_중1_v2.json");

function loadCredential() {
  const keyPath = process.env.SERVICE_ACCOUNT;
  if (keyPath) return cert(JSON.parse(readFileSync(keyPath, "utf8")));
  return applicationDefault(); // GOOGLE_APPLICATION_CREDENTIALS
}

function fallbackClosingNoun(name) {
  if (name.endsWith("량")) return "양";
  if (name.endsWith("성")) return "성질";
  if (name.endsWith("주의")) return "생각";
  if (name.endsWith("화")) return "변화";
  return "개념";
}

function mapConcept(c) {
  return {
    id: c.id,
    subject: c.subject,
    unit: c.unit ?? "",
    name: c.concept,
    kind: c["성격"] ?? "개별",
    setName: c["세트명"] ?? "",
    structureStrategy: c["구조전략"] ?? "",
    connectionStrategy: c["연결전략"] ?? "",
    correct_subject: c.correct_subject ?? c.concept,
    over_general: c.over_general ?? [],
    closing_noun: c.closing_noun ?? fallbackClosingNoun(c.concept),
    core_elements: c.core_elements ?? [c.concept],
    confusable: c.confusable ?? [],
    hanja: (c.hanja ?? []).map(([char, mean]) => ({ char, mean })),
    target_errors: c.target_errors ?? [],
  };
}

async function main() {
  initializeApp({ credential: loadCredential() });
  const db = getFirestore();

  const raw = JSON.parse(await readFile(SEED_PATH, "utf8"));
  const concepts = raw.concepts.map(mapConcept);

  const batch = db.batch();
  for (const c of concepts) {
    batch.set(db.collection("concepts").doc(c.id), c, { merge: true });
  }
  await batch.commit();
  console.log(`✓ concepts ${concepts.length}개 import 완료:`, concepts.map((c) => c.id).join(", "));
}

main().catch((e) => {
  console.error("시드 실패:", e);
  process.exit(1);
});
