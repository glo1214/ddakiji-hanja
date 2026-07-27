"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

export default function DemoEntryPage() {
  const router = useRouter();
  const { demoLogin } = useAuth();

  useEffect(() => {
    demoLogin();
    router.replace("/learn/sci22_30");
  }, [demoLogin, router]);

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/gloon-logo-cropped.png"
          alt="글로온"
          style={{ width: 260, maxWidth: "100%", height: "auto", mixBlendMode: "multiply", marginBottom: 14 }}
        />
        <p style={{ color: "var(--color-text-secondary)" }}>학생 체험을 준비하고 있어요…</p>
      </div>
    </main>
  );
}
