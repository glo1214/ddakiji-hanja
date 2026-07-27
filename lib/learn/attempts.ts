// 학습 흐름이 남기는 가변 데이터의 Firestore 쓰기 층 (스키마 §4).
// 개념/문항은 읽기 전용이라 번들에 두고, 학생별로 쌓이는
//   attempts · word_progress · diagnostics 만 DB에 적재한다.
//
// Firestore 레이아웃 (기존 students/{phone} 구조와 일관):
//   students/{phone}/attempts/{autoId}
//   students/{phone}/word_progress/{conceptId}
//   students/{phone}/diagnostics/current
// (선생님용 교차 학생 집계는 collectionGroup('attempts') 로 조회)

import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { normalizePhone } from "../storage";
import type { Attempt, Stage } from "./types";

/** attempts 1건 적재. UI를 막지 않도록 호출부에서 결과를 기다리되 실패는 삼킨다. */
export async function recordAttempt(phone: string, a: Attempt): Promise<string | null> {
  const id = normalizePhone(phone) || phone; // 게스트(guest-xxxx)는 그대로
  try {
    const ref = await addDoc(collection(db, "students", id, "attempts"), {
      student_id: id,
      concept_id: a.concept_id,
      stage: a.stage,
      result: a.result,
      chosen_option: a.chosen_option ?? null,
      quiz_item_id: a.quiz_item_id ?? null,
      answer_text: a.answer_text ?? null,
      tags: a.tags ?? [],
      scaffold_used: a.scaffold_used ?? false,
      hesitation_count: a.hesitation_count ?? 0,
      created_at: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error("[recordAttempt] 실패(오프라인일 수 있음):", e);
    return null;
  }
}

/** 단어별 진행 — 방문 단계 누적. */
export async function markStageVisited(
  phone: string,
  conceptId: string,
  stage: Stage,
  status: "learning" | "review" = "learning"
): Promise<void> {
  const id = normalizePhone(phone) || phone;
  try {
    await setDoc(
      doc(db, "students", id, "word_progress", conceptId),
      {
        student_id: id,
        concept_id: conceptId,
        stages_visited: arrayUnion(stage),
        status,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("[markStageVisited] 실패:", e);
  }
}

/** 진단 캐시 — 태그 빈도 누적(파생값, attempts에서 재계산 가능). */
export async function bumpDiagnostics(phone: string, tags: string[]): Promise<void> {
  if (!tags.length) return;
  const id = normalizePhone(phone) || phone;
  const tag_freq: Record<string, ReturnType<typeof increment>> = {};
  for (const t of tags) tag_freq[t] = increment(1);
  try {
    await setDoc(
      doc(db, "students", id, "diagnostics", "current"),
      { student_id: id, tag_freq, updated_at: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error("[bumpDiagnostics] 실패:", e);
  }
}
