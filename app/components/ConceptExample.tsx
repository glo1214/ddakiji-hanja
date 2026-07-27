/**
 * 개념어 예시 그림 — 단색 손그림 픽토그램.
 * "그려보기" 단계에서 아이들이 보고 따라 그릴 예시. 개념이 없으면 null.
 */

const INK = "#1e1c18";

function Saengtaegye() {
  // 생태계: 해 → 토끼 → 분해(버섯) → 식물 → 해 (순환)
  return (
    <svg viewBox="0 0 320 210" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="생태계 예시">
      <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* 해 */}
        <circle cx="160" cy="40" r="13" />
        <g>
          <line x1="160" y1="18" x2="160" y2="10" />
          <line x1="160" y1="70" x2="160" y2="62" />
          <line x1="182" y1="40" x2="190" y2="40" />
          <line x1="130" y1="40" x2="138" y2="40" />
          <line x1="176" y1="24" x2="182" y2="18" />
          <line x1="144" y1="24" x2="138" y2="18" />
          <line x1="176" y1="56" x2="182" y2="62" />
          <line x1="144" y1="56" x2="138" y2="62" />
        </g>
        {/* 식물 (왼쪽) */}
        <path d="M62,138 L62,104" />
        <path d="M62,112 C 48,104 44,116 60,118" />
        <path d="M62,104 C 76,96 80,108 64,112" />
        <path d="M46,138 Q62,144 80,138" />
        {/* 토끼 (오른쪽) */}
        <ellipse cx="246" cy="112" rx="18" ry="12" />
        <circle cx="262" cy="100" r="11" />
        <path d="M258,90 C 256,80 260,80 261,90" />
        <path d="M266,90 C 268,80 272,82 270,91" />
        <circle cx="263" cy="100" r="1.6" fill={INK} />
        <circle cx="231" cy="112" r="4" />
        <line x1="240" y1="123" x2="240" y2="132" />
        <line x1="250" y1="123" x2="250" y2="132" />
        {/* 분해자 (버섯·포자, 아래) */}
        <path d="M150,176 C 144,168 162,168 156,176 Z" />
        <line x1="152" y1="176" x2="152" y2="184" />
        <path d="M170,180 C 166,174 178,174 174,180 Z" />
        <line x1="171" y1="180" x2="171" y2="186" />
        <circle cx="136" cy="170" r="2.4" />
        <circle cx="186" cy="172" r="2.4" />
        <circle cx="160" cy="166" r="1.8" />
        {/* 순환 화살표 */}
        <path d="M188,50 C 214,58 230,72 238,90" />
        <path d="M238,90 l-7,-2 m7,2 l-2,-7" />
        <path d="M244,130 C 230,150 206,162 182,166" />
        <path d="M182,166 l6,-4 m-6,4 l5,5" />
        <path d="M120,168 C 100,160 84,150 76,134" />
        <path d="M76,134 l7,2 m-7,-2 l2,7" />
        <path d="M66,90 C 76,70 100,56 132,50" />
        <path d="M132,50 l-7,1 m7,-1 l-4,-5" />
      </g>
    </svg>
  );
}

function Byeonyi() {
  // 변이: 같은 강낭콩 씨앗인데 색·크기·무늬가 조금씩 다름
  const bean = (cx: number, cy: number, s: number, marks: "dot" | "line" | "plain") => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <path d="M-13,-18 C 1,-31 23,-15 18,5 C 14,23 -9,26 -20,10 C -29,-2 -24,-12 -13,-18 Z" />
      <path d="M-6,-12 C -13,-3 -11,9 -2,15" strokeWidth="1.6" />
      {marks === "dot" && (
        <>
          <circle cx="5" cy="-6" r="1.7" fill={INK} stroke="none" />
          <circle cx="9" cy="6" r="1.5" fill={INK} stroke="none" />
        </>
      )}
      {marks === "line" && (
        <>
          <path d="M3,-12 C 8,-4 8,5 1,13" strokeWidth="1.6" />
          <path d="M10,-8 C 14,-1 13,7 8,12" strokeWidth="1.6" />
        </>
      )}
    </g>
  );
  return (
    <svg viewBox="0 0 320 150" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="변이 예시">
      <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M36,38 C 92,20 228,20 284,38" strokeDasharray="5 8" />
        <path d="M36,118 C 92,136 228,136 284,118" strokeDasharray="5 8" />
        {bean(56, 78, 0.9, "plain")}
        {bean(112, 78, 1.05, "dot")}
        {bean(170, 76, 0.82, "line")}
        {bean(224, 80, 1.16, "plain")}
        {bean(274, 76, 0.95, "dot")}
      </g>
    </svg>
  );
}

function Beonsik() {
  // 번식: 하나 → 둘 → 넷 (수가 늘어남)
  const cell = (cx: number, cy: number, r: number) => (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" />
      <circle cx={cx} cy={cy} r="2.2" fill={INK} stroke="none" />
    </>
  );
  return (
    <svg viewBox="0 0 320 140" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="번식 예시">
      <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {cell(48, 70, 18)}
        <path d="M78,70 l24,0 M102,70 l-7,-4 m7,4 l-7,4" />
        {cell(135, 56, 14)}
        {cell(150, 88, 14)}
        <path d="M178,70 l24,0 M202,70 l-7,-4 m7,4 l-7,4" />
        {cell(238, 54, 13)}
        {cell(268, 54, 13)}
        {cell(238, 86, 13)}
        {cell(268, 86, 13)}
      </g>
    </svg>
  );
}

function Photosynthesis() {
  // 광합성: 빛·물·이산화탄소 → 잎 → 산소·포도당
  return (
    <svg viewBox="0 0 320 170" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="광합성 예시">
      <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* 해 */}
        <circle cx="44" cy="34" r="11" />
        <line x1="44" y1="17" x2="44" y2="11" />
        <line x1="61" y1="34" x2="67" y2="34" />
        <line x1="56" y1="22" x2="61" y2="17" />
        <line x1="32" y1="22" x2="27" y2="17" />
        {/* 물방울 */}
        <path d="M44,78 C 53,89 53,98 44,100 C 35,98 35,89 44,78 Z" />
        {/* 이산화탄소 */}
        <circle cx="36" cy="130" r="7" />
        <circle cx="52" cy="130" r="7" />
        {/* 잎 */}
        <path d="M150,86 C 165,56 205,56 215,86 C 205,116 165,116 150,86 Z" />
        <path d="M150,86 C 178,82 198,82 215,86" strokeWidth="1.8" />
        <path d="M183,60 L183,112" strokeWidth="1.8" />
        {/* 산소 */}
        <circle cx="278" cy="48" r="8" />
        <circle cx="296" cy="58" r="8" />
        {/* 포도당(큐브) */}
        <path d="M272,120 h22 v22 h-22 Z" />
        <path d="M272,120 l9,-8 h22 l-9,8" />
        <path d="M294,120 l9,-8 v22 l-9,8" />
        {/* 화살표 */}
        <path d="M58,42 C 90,52 110,64 138,76 M138,76 l-8,-1 m8,1 l-3,-7" />
        <path d="M58,90 l78,-2 M136,88 l-7,-4 m7,4 l-7,4" />
        <path d="M62,128 C 92,120 110,108 138,96 M138,96 l-8,1 m8,-1 l-3,7" />
        <path d="M224,76 C 244,66 256,60 268,56 M268,56 l-7,1 m7,-1 l-4,-6" />
        <path d="M224,98 C 244,108 256,114 268,120 M268,120 l-7,-2 m7,2 l-2,-7" />
      </g>
    </svg>
  );
}

const MAP: Record<string, () => React.ReactElement> = {
  sci_saengtaegye: Saengtaegye,
  sci_byeonyi: Byeonyi,
  sci22_17: Byeonyi,
  sci_beonsik: Beonsik,
  sci_photosynthesis: Photosynthesis,
};

export default function ConceptExample({ conceptId }: { conceptId: string }) {
  const Comp = MAP[conceptId];
  if (!Comp) return null;
  return <Comp />;
}

export function hasExample(conceptId: string): boolean {
  return conceptId in MAP;
}
