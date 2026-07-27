// 간격 반복(Spaced Repetition) — Leitner 상자 방식. 클라이언트 localStorage 저장(학생 전화번호별).
// "모르는 단어만" 원칙: 맞힌·아는 단어는 복습 간격을 늘려 뜸하게, 틀린·헷갈린 단어는 곧 다시 소환.
// 목록 페이지가 생기면 dueConcepts()로 "오늘 볼 단어"만 뽑아 쓰면 됨. (Firestore 이관은 추후.)

export interface SrsRecord {
  box: number; // 0~4 (Leitner 상자)
  dueAt: number; // 다음 복습 예정 시각(ms)
  known: boolean; // 사실상 익힘
  last: number; // 마지막 학습 시각(ms)
}

// 상자별 복습 간격(일). box 0 = 곧 다시.
const INTERVAL_DAYS = [0, 1, 3, 7, 21];
const DAY = 86_400_000;
const key = (phone: string) => `srs:${phone}`;

function load(phone: string): Record<string, SrsRecord> {
  if (typeof window === "undefined" || !phone) return {};
  try {
    return JSON.parse(localStorage.getItem(key(phone)) || "{}");
  } catch {
    return {};
  }
}
function save(phone: string, m: Record<string, SrsRecord>) {
  if (typeof window === "undefined" || !phone) return;
  localStorage.setItem(key(phone), JSON.stringify(m));
}
function dueFrom(box: number): number {
  return Date.now() + INTERVAL_DAYS[Math.min(box, INTERVAL_DAYS.length - 1)] * DAY;
}

export function getSrs(phone: string, id: string): SrsRecord | null {
  return load(phone)[id] ?? null;
}

/** 학습 결과(이해 신호등 0🔴/1🟡/2🟢)로 상자 이동 + 다음 복습 예약. */
export function applyResult(phone: string, id: string, light: number): SrsRecord {
  const m = load(phone);
  const cur = m[id] ?? { box: 0, dueAt: 0, known: false, last: 0 };
  let box = cur.box;
  if (light >= 2) box = Math.min(box + 1, 4); // 잘 알면 간격 늘림
  else if (light === 1) box = Math.max(box, 1); // 애매하면 유지
  else box = 0; // 틀리면 곧 다시
  const rec: SrsRecord = { box, dueAt: dueFrom(box), known: light >= 2 && box >= 2, last: Date.now() };
  m[id] = rec;
  save(phone, m);
  return rec;
}

/** 사전 체크 통과(재인 정답 + 자신감 높음) → 이미 앎으로 보고 복습만 예약. */
export function markKnown(phone: string, id: string): SrsRecord {
  const m = load(phone);
  const box = 3;
  const rec: SrsRecord = { box, dueAt: dueFrom(box), known: true, last: Date.now() };
  m[id] = rec;
  save(phone, m);
  return rec;
}

export function isDue(phone: string, id: string): boolean {
  const r = load(phone)[id];
  return !r || Date.now() >= r.dueAt;
}

/** 오늘 볼 단어 = 아직 안 배운 것 + 복습 예정이 된 것 (익혔지만 아직 안 된 건 제외). */
export function dueConcepts(phone: string, allIds: string[]): string[] {
  return allIds.filter((id) => isDue(phone, id));
}

export function nextReviewLabel(rec: SrsRecord): string {
  const d = Math.round((rec.dueAt - Date.now()) / DAY);
  return d <= 0 ? "오늘·곧" : `${d}일 뒤`;
}
