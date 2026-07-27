import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Progress,
  WrongTagCounts,
  ConceptProgress,
  Student,
} from "@/app/types";

/**
 * Firestore 데이터 모델
 *   admins/{phone}                         = { name, phone, passwordHash, createdAt }
 *   students/{phone}                       = { name, phone, createdAt }
 *   students/{phone}/progress/{conceptId}  = { done, score, completedAt }
 *   students/{phone}/wrongTags/{tag}       = { count, updatedAt }
 *
 * 전화번호(숫자만)를 문서 ID로 사용한다.
 */

/** 전화번호를 숫자만 남겨 문서 ID로 정규화 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function requirePhoneId(phone: string): string {
  const id = normalizePhone(phone);
  if (!id) throw new Error("전화번호가 올바르지 않습니다.");
  return id;
}

// ---------- 관리자 계정 ----------
// 전화번호를 아이디로, 직접 지정한 비밀번호(SHA-256 해시 저장)로 로그인한다.
// 클라이언트 측 간이 인증 — 교실용(비민감 데이터) 전제. firestore.rules 메모 참고.

export interface Admin {
  name: string;
  phone: string;
}

async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 등록된 관리자가 한 명이라도 있는지 — 최초 실행 시 계정 만들기 화면 분기용. */
export async function hasAnyAdmin(): Promise<boolean> {
  const snap = await getDocs(query(collection(db, "admins"), limit(1)));
  return !snap.empty;
}

export async function createAdmin(
  name: string,
  phone: string,
  password: string
): Promise<void> {
  const id = requirePhoneId(phone);
  await setDoc(doc(db, "admins", id), {
    name,
    phone: id,
    passwordHash: await hashPassword(password),
    createdAt: serverTimestamp(),
  });
}

/** 전화번호+비밀번호 검증. 일치하면 관리자 정보, 아니면 null. */
export async function verifyAdminLogin(
  phone: string,
  password: string
): Promise<Admin | null> {
  const id = normalizePhone(phone);
  if (!id) return null;
  const snap = await getDoc(doc(db, "admins", id));
  if (!snap.exists()) return null;
  const data = snap.data();
  if ((data.passwordHash as string) !== (await hashPassword(password))) return null;
  return { name: (data.name as string) ?? "", phone: id };
}

// ---------- 학생 계정 (선생님이 생성) ----------
export async function createStudent(
  name: string,
  phone: string,
  grade = ""
): Promise<void> {
  const id = requirePhoneId(phone);
  await setDoc(
    doc(db, "students", id),
    { name, phone: id, grade, createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getStudent(phone: string): Promise<Student | null> {
  const id = normalizePhone(phone);
  if (!id) return null;
  const snap = await getDoc(doc(db, "students", id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    name: (data.name as string) ?? "",
    phone: id,
    grade: (data.grade as string) ?? "",
    reportComment: (data.reportComment as string) ?? "",
    entry_type: data.entry_type as Student["entry_type"],
    lens_type: (data.lens_type as string) ?? undefined,
  };
}

/** 유형 진단 결과(4유형 진입점) 저장. */
export async function saveEntryType(
  phone: string,
  entryType: NonNullable<Student["entry_type"]>
): Promise<void> {
  const id = requirePhoneId(phone);
  await setDoc(
    doc(db, "students", id),
    { entry_type: entryType, entry_updated_at: serverTimestamp() },
    { merge: true }
  );
}

/** 선생님 보고서 코멘트 저장(학부모 전달용). */
export async function saveReportComment(
  phone: string,
  comment: string
): Promise<void> {
  const id = requirePhoneId(phone);
  await setDoc(
    doc(db, "students", id),
    { reportComment: comment, reportUpdatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function listStudents(): Promise<Student[]> {
  const snap = await getDocs(collection(db, "students"));
  return snap.docs.map((d) => ({
    name: (d.data().name as string) ?? "",
    phone: d.id,
    grade: (d.data().grade as string) ?? "",
  }));
}

/** 학생의 하위 컬렉션 전체 문서를 일괄 삭제. */
async function deleteSubcollections(id: string, names: string[]): Promise<void> {
  const snaps = await Promise.all(names.map((n) => getDocs(collection(db, "students", id, n))));
  const batch = writeBatch(db);
  snaps.forEach((snap) => snap.forEach((d) => batch.delete(d.ref)));
  await batch.commit();
}

/** 학생 계정 삭제 (진행상황·오답태그 + 학습흐름 기록까지 함께 제거) */
export async function deleteStudent(phone: string): Promise<void> {
  const id = requirePhoneId(phone);
  await resetProgress(phone);
  // 학습 5단계 흐름이 남기는 하위 컬렉션도 함께 제거 (lib/learn/attempts.ts, profile.ts)
  await deleteSubcollections(id, ["attempts", "word_progress", "diagnostics", "behavior"]);
  await deleteDoc(doc(db, "students", id));
}

// ---------- 진행상황 ----------
export async function loadProgress(phone: string): Promise<Progress> {
  const id = normalizePhone(phone);
  if (!id) return {};
  const snap = await getDocs(collection(db, "students", id, "progress"));
  const out: Progress = {};
  snap.forEach((d) => {
    const data = d.data();
    out[d.id] = {
      done: !!data.done,
      score: (data.score as number) ?? 0,
      completedAt: data.completedAt?.toMillis?.(),
    };
  });
  return out;
}

export async function saveConceptProgress(
  phone: string,
  conceptId: string,
  p: ConceptProgress
): Promise<void> {
  const id = requirePhoneId(phone);
  await setDoc(doc(db, "students", id, "progress", conceptId), {
    done: p.done,
    score: p.score,
    completedAt: serverTimestamp(),
  });
}

// ---------- 오답 사고패턴 태그 ----------
export async function loadWrongTags(phone: string): Promise<WrongTagCounts> {
  const id = normalizePhone(phone);
  if (!id) return {};
  const snap = await getDocs(collection(db, "students", id, "wrongTags"));
  const out: WrongTagCounts = {};
  snap.forEach((d) => {
    out[d.id] = (d.data().count as number) ?? 0;
  });
  return out;
}

export async function saveWrongTag(
  phone: string,
  tag: string,
  count: number
): Promise<void> {
  const id = requirePhoneId(phone);
  await setDoc(doc(db, "students", id, "wrongTags", tag), {
    count,
    updatedAt: serverTimestamp(),
  });
}

// ---------- 초기화 ----------
export async function resetProgress(phone: string): Promise<void> {
  const id = normalizePhone(phone);
  if (!id) return;
  const [pSnap, tSnap] = await Promise.all([
    getDocs(collection(db, "students", id, "progress")),
    getDocs(collection(db, "students", id, "wrongTags")),
  ]);
  const batch = writeBatch(db);
  pSnap.forEach((d) => batch.delete(d.ref));
  tSnap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
