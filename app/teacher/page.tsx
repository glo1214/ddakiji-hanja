"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createAdmin,
  createStudent,
  deleteStudent,
  hasAnyAdmin,
  listStudents,
  normalizePhone,
  verifyAdminLogin,
  type Admin,
} from "@/lib/storage";
import type { Student } from "../types";
import StudentReport from "./StudentReport";
import LearnAnalysis from "./LearnAnalysis";

// 관리자 로그인: 전화번호(아이디) + 직접 지정한 비밀번호. 계정은 Firestore admins/{phone}.
// 최초 접속(등록된 관리자가 없을 때)에만 계정 만들기 화면이 열린다.
const ADMIN_SESSION_KEY = "hanja-admin-session";

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  padding: "1.1rem 1.25rem",
};

type Gate = "checking" | "setup" | "login";

export default function TeacherPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [gate, setGate] = useState<Gate>("checking");

  // 저장된 관리자 세션 복구 → 없으면 관리자 존재 여부로 로그인/계정 만들기 분기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) {
        setAdmin(JSON.parse(saved) as Admin);
        return;
      }
    } catch {
      // 세션 없음 — 아래에서 로그인 분기
    }
    hasAnyAdmin()
      .then((exists) => setGate(exists ? "login" : "setup"))
      .catch(() => setGate("login"));
  }, []);

  function handleLoggedIn(a: Admin) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(a));
    setAdmin(a);
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdmin(null);
    setGate("login");
  }

  if (admin) return <TeacherDashboard admin={admin} onLogout={handleLogout} />;

  if (gate === "checking") {
    return (
      <main
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        확인 중…
      </main>
    );
  }

  return gate === "setup" ? (
    <AdminSetup onDone={handleLoggedIn} />
  ) : (
    <AdminLogin onDone={handleLoggedIn} />
  );
}

function AdminLogin({ onDone }: { onDone: (a: Admin) => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !password || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const found = await verifyAdminLogin(phone, password);
      if (found) {
        onDone(found);
      } else {
        setError("전화번호 또는 비밀번호가 올바르지 않아요.");
      }
    } catch {
      setError("로그인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 360,
        margin: "0 auto",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        padding: "1.5rem",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px" }}>
        딱이지<span style={{ color: "var(--color-accent)" }}>.</span>
      </div>
      <h1 style={{ fontSize: 20, margin: 0 }}>관리자 로그인</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호 (아이디)"
          style={{ width: "100%" }}
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          style={{ width: "100%" }}
        />
        <button type="submit" disabled={submitting || !phone.trim() || !password} style={{ width: "100%" }}>
          {submitting ? "확인 중…" : "로그인"}
        </button>
        {error && (
          <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: 0 }}>{error}</p>
        )}
      </form>
    </main>
  );
}

function AdminSetup({ onDone }: { onDone: (a: Admin) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid =
    name.trim() && normalizePhone(phone).length >= 9 && password.length >= 4 && password === confirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // 동시 접속으로 이미 만들어졌으면 계정 만들기를 막고 로그인 화면 취지로 안내
      if (await hasAnyAdmin()) {
        setError("이미 관리자 계정이 있어요. 새로고침 후 로그인해 주세요.");
        return;
      }
      await createAdmin(name.trim(), phone, password);
      onDone({ name: name.trim(), phone: normalizePhone(phone) });
    } catch {
      setError("계정 생성에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 360,
        margin: "0 auto",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        padding: "1.5rem",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px" }}>
        딱이지<span style={{ color: "var(--color-accent)" }}>.</span>
      </div>
      <h1 style={{ fontSize: 20, margin: 0 }}>관리자 계정 만들기</h1>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
        처음 오셨네요! 전화번호를 아이디로, 비밀번호를 직접 정해서 계정을 만들어요.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          style={{ width: "100%" }}
        />
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호 (예: 01012345678)"
          style={{ width: "100%" }}
        />
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (4자 이상)"
          style={{ width: "100%" }}
        />
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="비밀번호 확인"
          style={{ width: "100%" }}
        />
        <button type="submit" disabled={!valid || submitting} style={{ width: "100%" }}>
          {submitting ? "만드는 중…" : "계정 만들고 시작하기"}
        </button>
        {confirm && password !== confirm && (
          <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: 0 }}>
            비밀번호가 서로 달라요.
          </p>
        )}
        {error && (
          <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: 0 }}>{error}</p>
        )}
      </form>
    </main>
  );
}

function TeacherDashboard({ admin, onLogout }: { admin: Admin; onLogout: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<Student | null>(null);
  const [analysis, setAnalysis] = useState<Student | null>(null);
  const canCreateStudent = name.trim().length > 0 && normalizePhone(phone).length >= 9;

  async function refresh() {
    try {
      setStudents(await listStudents());
    } catch {
      setMessage({ kind: "err", text: "학생 목록을 불러오지 못했어요." });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // 학년별 그룹 (학년순, 같은 학년은 이름순)
  const groups = useMemo(() => {
    const map = new Map<string, Student[]>();
    for (const s of students) {
      const key = s.grade?.trim() || "학년 미지정";
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "ko"))
      .map(([g, list]) => [g, list.sort((a, b) => a.name.localeCompare(b.name, "ko"))] as const);
  }, [students]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!canCreateStudent || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      await createStudent(name.trim(), phone.trim(), grade.trim());
      setMessage({ kind: "ok", text: `${name.trim()} 학생을 등록했어요.` });
      setName("");
      setPhone("");
      // 학년은 연속 등록 편의를 위해 유지
      await refresh();
    } catch {
      setMessage({ kind: "err", text: "등록에 실패했어요. 다시 시도해 주세요." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s: Student) {
    if (!window.confirm(`${s.name} 학생을 삭제할까요? 진행상황도 함께 지워져요.`)) return;
    try {
      await deleteStudent(s.phone);
      await refresh();
    } catch {
      setMessage({ kind: "err", text: "삭제에 실패했어요." });
    }
  }

  if (report) {
    return (
      <StudentReport
        student={report}
        onBack={() => {
          setReport(null);
          refresh();
        }}
      />
    );
  }

  if (analysis) {
    return <LearnAnalysis student={analysis} onBack={() => setAnalysis(null)} />;
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "1.5rem 1.25rem 2.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
            딱이지<span style={{ color: "var(--color-accent)" }}>.</span>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              <i className="ti ti-user-shield" aria-hidden="true" style={{ marginRight: 4 }}></i>
              {admin.name} 선생님
            </span>
            <button onClick={onLogout} style={{ fontSize: 13, padding: "5px 10px" }}>
              로그아웃
            </button>
          </span>
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>학생 계정 관리</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          이름·전화번호·반을 등록하면, 학생은 그 번호로 로그인할 수 있어요.
        </p>
      </div>

      <form onSubmit={handleCreate} style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="학생 이름"
          style={{ width: "100%" }}
        />
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호 (예: 01012345678)"
          style={{ width: "100%" }}
        />
        <input
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="학년 (예: 1학년) — 선택"
          style={{ width: "100%" }}
        />
        <button
          type="submit"
          disabled={saving || !canCreateStudent}
          style={{ width: "100%" }}
        >
          {saving ? "등록 중…" : "학생 등록"}
        </button>
        {message && (
          <p
            style={{
              fontSize: 13,
              margin: 0,
              color:
                message.kind === "ok"
                  ? "var(--color-text-success)"
                  : "var(--color-text-danger)",
            }}
          >
            {message.text}
          </p>
        )}
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
          등록된 학생 ({students.length}명)
        </p>

        {students.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
            아직 등록된 학생이 없어요.
          </p>
        ) : (
          groups.map(([cls, list]) => (
            <div key={cls} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
                {cls} · {list.length}명
              </p>
              {list.map((s) => (
                <div
                  key={s.phone}
                  onClick={() => setReport(s)}
                  role="button"
                  tabIndex={0}
                  title={`${s.name} 학습 보고서 보기`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--color-background-secondary)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "10px 12px",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontWeight: 500 }}>
                    <i className="ti ti-file-text" aria-hidden="true" style={{ marginRight: 6, color: "var(--color-text-tertiary)" }}></i>
                    {s.name}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{s.phone}</span>
                    <button
                      aria-label={`${s.name} 개념 학습 분석`}
                      title="개념 학습 분석(교차분석)"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnalysis(s);
                      }}
                      style={{
                        padding: "5px 8px",
                        borderRadius: "var(--border-radius-md)",
                        color: "var(--color-text-info)",
                        lineHeight: 1,
                      }}
                    >
                      <i className="ti ti-chart-dots" style={{ fontSize: 16 }} aria-hidden="true"></i>
                    </button>
                    <button
                      aria-label={`${s.name} 삭제`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(s);
                      }}
                      style={{
                        padding: "5px 8px",
                        borderRadius: "var(--border-radius-md)",
                        color: "var(--color-text-danger)",
                        lineHeight: 1,
                      }}
                    >
                      <i className="ti ti-trash" style={{ fontSize: 16 }} aria-hidden="true"></i>
                    </button>
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
