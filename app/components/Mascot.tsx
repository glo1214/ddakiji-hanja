/**
 * 딱이지 마스코트 — 느낌표(!) · 물음표(?) 듀오.
 * 크림 채움 + 얇은 잉크 외곽선. 표정(mood)으로 감정 코칭에 쓰인다.
 *   ? = 호기심·질문 담당 / ! = 아하·정답 담당
 */

export type MascotType = "question" | "exclaim";
export type MascotMood = "default" | "happy" | "soft";

const INK = "#1e1c18";
const CREAM = "#f7f5ef";

interface MascotProps {
  type: MascotType;
  mood?: MascotMood;
  /** 높이(px). 너비는 비율에 맞춰 자동. */
  size?: number;
  title?: string;
  className?: string;
}

// 표정: 입 모양
function Mouth({ mood, cx, cy }: { mood: MascotMood; cx: number; cy: number }) {
  if (mood === "happy") {
    return (
      <path
        d={`M${cx - 7},${cy - 1} C ${cx - 3},${cy + 6} ${cx + 3},${cy + 6} ${cx + 7},${cy - 1} Z`}
        fill={INK}
        stroke={INK}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
    );
  }
  return (
    <path
      d={`M${cx - 6},${cy} C ${cx - 2},${cy + 4} ${cx + 4},${cy + 4} ${cx + 7},${cy - 1}`}
      fill="none"
      stroke={INK}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  );
}

// 표정: 눈 (soft = 감은 눈, 토닥용)
function Eyes({
  mood,
  left,
  right,
  r,
}: {
  mood: MascotMood;
  left: [number, number];
  right: [number, number];
  r: number;
}) {
  if (mood === "soft") {
    return (
      <g fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round">
        <path d={`M${left[0] - 4},${left[1]} C ${left[0] - 1},${left[1] + 3} ${left[0] + 2},${left[1] + 3} ${left[0] + 4},${left[1]}`} />
        <path d={`M${right[0] - 4},${right[1]} C ${right[0] - 1},${right[1] + 3} ${right[0] + 2},${right[1] + 3} ${right[0] + 4},${right[1]}`} />
      </g>
    );
  }
  return (
    <g fill={INK} stroke="none">
      <circle cx={left[0]} cy={left[1]} r={r} />
      <circle cx={right[0]} cy={right[1]} r={r} />
    </g>
  );
}

export default function Mascot({
  type,
  mood = "default",
  size = 96,
  title,
  className,
}: MascotProps) {
  if (type === "question") {
    const vbW = 80;
    const vbH = 126;
    const hookPath =
      "M138,106 C 124,98 124,72 140,64 C 158,55 178,67 178,90 C 178,106 164,114 156,116 C 153,124 152,132 151,142";
    return (
      <svg
        className={className}
        width={(size * vbW) / vbH}
        height={size}
        viewBox="111 48 80 126"
        role="img"
        aria-label={title ?? "물음표 마스코트"}
        xmlns="http://www.w3.org/2000/svg"
      >
        {title ? <title>{title}</title> : null}
        {/* 더블스트로크: 잉크(굵게) 위에 크림(가늘게) → 외곽선 있는 리본 */}
        <path d={hookPath} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <path d={hookPath} fill="none" stroke={CREAM} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        {mood !== "soft" && (
          <path d="M138,80 L148,77" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
        )}
        <Eyes mood={mood} left={[144, 88]} right={[159, 86]} r={3.2} />
        <Mouth mood={mood} cx={151} cy={98} />
        <circle cx={151} cy={160} r={9} fill={CREAM} stroke={INK} strokeWidth={3} />
      </svg>
    );
  }

  // exclaim
  const vbW = 48;
  const vbH = 124;
  return (
    <svg
      className={className}
      width={(size * vbW) / vbH}
      height={size}
      viewBox="306 52 48 124"
      role="img"
      aria-label={title ?? "느낌표 마스코트"}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M312,70 C 312,57 348,57 348,70 L342,124 C 341,137 319,137 318,124 Z"
        fill={CREAM}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Eyes mood={mood} left={[322, 91]} right={[338, 91]} r={3.6} />
      <Mouth mood={mood} cx={330} cy={105} />
      <circle cx={330} cy={159} r={10} fill={CREAM} stroke={INK} strokeWidth={3} />
    </svg>
  );
}
