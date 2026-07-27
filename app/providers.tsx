"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getStudent } from "@/lib/storage";
import type { Student } from "./types";

interface AuthContextValue {
  student: Student | null;
  loading: boolean;
  /** 전화번호로 로그인 시도. 등록된 학생이면 true. */
  login: (phone: string) => Promise<boolean>;
  /** 발표·학생 1명 테스트용: 등록 없이 로컬 데모 학생으로 시작. */
  demoLogin: () => void;
  logout: () => void;
  /** 현재 학생 정보 일부 갱신(예: 유형 진단 결과). 상태+localStorage 동기화. */
  updateStudent: (patch: Partial<Student>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "hanja-current-student";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // 저장된 로그인 세션 복구
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStudent(JSON.parse(saved) as Student);
    } catch {
      // 무시: 비어있으면 로그아웃 상태로 시작
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(phone: string): Promise<boolean> {
    const found = await getStudent(phone);
    if (!found) return false;
    setStudent(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    return true;
  }

  const demoLogin = useCallback(() => {
    const demoStudent: Student = {
      name: "데모 학생",
      phone: "demo-student",
      grade: "중1",
      isDemo: true,
      entry_type: "느낌먼저",
    };
    setStudent(demoStudent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoStudent));
  }, []);

  function logout() {
    setStudent(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function updateStudent(patch: Partial<Student>) {
    setStudent((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ student, loading, login, demoLogin, logout, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
