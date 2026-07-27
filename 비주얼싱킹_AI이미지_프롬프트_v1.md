# 비주얼 싱킹 AI 이미지 프롬프트 — 데모 5개 v1

> 대상: 융해 · 응고 · 승화 (상태 변화) + 세계화 · 지역화
> 추천 툴: **Nano Banana Pro (Gemini 이미지)** — 손그림 톤 + 한국어 라벨에 강함.
> 사용법: 아래 **[공통 스타일]** 을 먼저 붙이고, 그 뒤에 개념별 **[장면]** 을 이어 붙여 생성.
> 비율: **정사각(1:1)** 또는 4:3 권장. 라벨(한글)이 깨지면 라벨 빼고 생성 → 나중에 글자만 얹기.

---

## [공통 스타일] — 모든 프롬프트 앞에 붙이기

```
Simple hand-drawn educational illustration, Korean middle-school science workbook style.
Clean black ink outlines with a slight hand-drawn wobble, warm cream/ivory background.
Flat minimal color only: soft blue for particles/atoms, warm red-orange for heat/energy arrows,
muted gray and yellow for objects. Friendly, uncluttered, lots of empty space, clear shapes.
NO photorealism, NO 3D CGI render, NO heavy gradients, NO clutter. Diagram-like and easy to read.
```

**공통 네거티브(넣을 수 있으면):**
```
no photorealism, no 3d render, no realistic photo, no extra particles, no missing particles,
particle count must stay equal on both sides, no melting the particles into nothing, no text typos
```

---

## 1. 융해 (融解) · 고체 → 액체

```
Two labeled boxes side by side with a red arrow between them.
LEFT box: about 9 blue spheres arranged in a neat, evenly spaced orderly grid (a solid).
RIGHT box: the SAME 9 blue spheres, now loosely and irregularly packed but still touching (a liquid).
Between them a bold red-orange arrow pointing right, meaning heat is added.
Same number of spheres on both sides — nothing disappears.
Korean labels: left box "고체", right box "액체", above the red arrow "열을 얻음 (+)", title on top "융해".
```
- **핵심 포인트:** 입자 수 좌우 동일 / 규칙 배열 → 느슨한 배열 / 빨간 화살표=열 흡수
- **오개념 금지:** 입자가 사라지거나 물방울로 바뀌기, 개수가 줄어들기
- **한글 라벨(깨지면 후편집용):** 고체 · 액체 · 열을 얻음 (+) · 융해

---

## 2. 응고 (凝固) · 액체 → 고체

```
Two labeled boxes side by side with a red arrow between them.
LEFT box: about 9 blue spheres loosely and irregularly packed, still touching (a liquid).
RIGHT box: the SAME 9 blue spheres, now in a neat evenly spaced orderly grid (a solid).
Between them a bold red-orange arrow pointing right, and small red arrows pointing OUTWARD
from the process, meaning heat is released.
Same number of spheres on both sides.
Korean labels: left box "액체", right box "고체", above the arrow "열을 잃음 (−)", title on top "응고".
```
- **핵심 포인트:** 느슨한 배열 → 규칙 배열 / 열 방출(밖으로 나가는 빨간 화살표)
- **오개념 금지:** 그냥 '차가움'만 강조, 입자 소멸
- **한글 라벨:** 액체 · 고체 · 열을 잃음 (−) · 응고

---

## 3. 승화 (昇華) · 고체 → 기체 (액체 건너뜀)

```
Three zones in a row. LEFT: a box of about 9 blue spheres in a neat orderly grid (solid).
MIDDLE: a faint box of a liquid crossed out with a light X, meaning this step is SKIPPED.
RIGHT: about 5 blue spheres spread far apart and scattered widely (a gas).
A bold red-orange curved arrow goes directly from the LEFT solid box, arching OVER the crossed-out
middle box, to the RIGHT gas — showing it jumps straight from solid to gas.
Korean labels: left "고체", crossed middle "액체(건너뜀)", right "기체", title on top "승화".
```
- **핵심 포인트:** 고체→기체 직행 / 중간 액체 단계를 X로 건너뜀 / 기체는 멀리 흩어짐
- **오개념 금지:** 연기=수증기로 그리기, 액체 단계 거치기
- **한글 라벨:** 고체 · 액체(건너뜀) · 기체 · 승화

---

## 4. 세계화 (世界化)

```
A hand-drawn desk globe in the center: a sphere with latitude/longitude lines and simple continents,
held in a curved metal meridian ring on a small round stand.
Around the globe, 3-4 tiny simple country buildings or flags. Curved arrows cross between the
countries and over the globe, carrying small icons: a little box (goods), a music note (culture),
a small screen (information) — showing exchange across borders in both directions.
Warm, friendly, uncluttered.
Korean labels: title on top "세계화", small labels near arrows "상품 · 문화 · 정보".
```
- **핵심 포인트:** 진짜 '지구본'(받침대+둘레 링) / 나라끼리 상품·문화·정보 교류 / 상호의존(양방향 화살표)
- **오개념 금지:** 그냥 공 하나만, 한 방향 지배로만 그리기
- **한글 라벨:** 세계화 · 상품 · 문화 · 정보

---

## 5. 지역화 (地域化)

```
A recognizable hand-drawn map of the Korean peninsula (straighter east coast, indented/complex west
coast, small islands in the south, Jeju island below). One region is highlighted with a small local
specialty icon (a green tea leaf or a festival lantern) and a small star meaning "brand".
Arrows spread OUTWARD from that region: to a couple of other spots on the map, and one dashed arrow
reaching out to a small globe drawn in the corner (meaning "to the world").
Warm, friendly, simple line art.
Korean labels: title on top "지역화", the region "지역 특색", the corner globe "세계로".
```
- **핵심 포인트:** 실제 한반도 윤곽 / 한 지역 고유 특색(특산물)이 브랜드가 되어 밖으로 / 세계로 뻗음
- **오개념 금지:** 지역화를 '고립·세계화의 반대'로만 그리기(둘은 함께 일어남)
- **한글 라벨:** 지역화 · 지역 특색 · 세계로

---

## 생성 팁
- **한 번에 하나씩** 생성하고, 입자 개수/방향이 맞는지 확인 후 다음으로.
- 한글 라벨이 깨지면: 프롬프트에서 라벨 문장을 빼고 그림만 생성 → 캔바/파워포인트로 글자만 얹기(제일 안전).
- 스타일 통일: 5장 모두 **[공통 스타일]** 을 똑같이 앞에 붙여야 톤이 맞음.
- 다 만든 뒤 파일명 예: `img_yunghae.png / eunggo.png / seunghwa.png / segyehwa.png / jiyeokhwa.png` → 앱 `public/concept-images/` 에 넣으면 제가 화면에 연결할게요.

*v1 — 데모 5개. 스타일: 승인된 손그림 워크북 톤(파란 입자·빨간 열 화살표·한글 라벨). 오개념 금지 조건 포함.*
