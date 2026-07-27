# 딱이지 한자앱 — 기획 요약 & 개발 핸드오프 v1

코드 작업 시작용 한 장 요약. 상세는 각 문서 참고.

---

## 0. 한 문단 개요
한자 뜻으로 개념어를 배우는 앱. 학생은 단계(느낌→개념→따라해보기→크게보기→**설명하기**)를 거치고,
객관식·주관식 답에서 **오류 유형(①~⑥)** 을 태깅해 누적한다. 누적 데이터로 학생의 약점(예: 범주화)을
진단하고 처방한다. 유형은 **진입점(4유형)** 과 **처방 렌즈(뇌유형)** 두 축으로 다룬다.

---

## 1. 문서 지도
| 문서 | 내용 |
|------|------|
| `주관식_오류_택소노미_v1.md` | 오류 6분류 ①~⑥ 정의·신호·처방 |
| `학생_데이터모델_설명하기입력_v1.md` | 데이터 3층, 설명하기 2단 캡처, 정답 메타 |
| `개념_메타데이터_시드_중등_v1.{csv,json}` | 개념 9개 시드 (앱 입력 데이터) |
| `객관식x주관식_교차분석_v1.md` | 보기 태깅, 2×2 매트릭스, 태그 일치 |
| `앱_단계_설계_v1.md` | 5단계 흐름·건너뛰기·유형 개입·데이터 |
| `유형_진단_설계_v1.md` | 4유형 판정(초기 6문항+행동), 뇌유형 추론 |
| `콘텐츠_관성_풀세트_v1.md` | 한 개념 전체 콘텐츠 실물(템플릿) |
| `리포트_목업_선생님용_v1.html` | 선생님 리포트 화면 목업 |

---

## 2. 제품 흐름 (한 장)
```
초기 6문항 → 진입점(4유형) 추정
   │
학생: [느낌] [개념] [따라해보기·객관식] [크게보기]  (선택, 유형별 비계)
                                   └────────────┐
                                        ★[설명하기·주관식]★ (필수)
                                                  │
   각 단계 → 이벤트/시도 기록 ─► 오류 태그 누적 ─► 진단·처방
                                              └─► 뇌유형(렌즈) 추론 → 처방 톤
```
원칙: 유형은 길을 **나누지 않는다**. 진입점·강조·해석만 바꾼다. 설명하기만 필수.

---

## 3. 핵심 개념 3가지 (구현 시 상수로)
- **오류 태그**: ①범주 ②용어 ③구조 ④핵심 ⑤혼동 ⑥표현
- **4유형(진입점)**: 느낌먼저 / 개념정리 / 따라해보기 / 크게보기 → 단계 enum과 1:1
- **뇌유형(렌즈, 비공개)**: 전체↔순차, 직관↔감각 → 태그 패턴에서 추론, 처방 톤만 조정

---

## 4. 데이터 스키마 초안

```
concepts            # 시드 JSON에서 import
  id (PK)           # 예: sci_03
  subject           # 과학 | 사회 | 국어·문법
  name              # 관성
  correct_subject   # 물체            (①기준)
  over_general[]    # [힘, 운동, 에너지]  (① 감지)
  closing_noun      # 성질            (② 감지)
  core_elements[]   # [...]           (④ 체크리스트)
  confusable[]      # [힘, 가속도]      (⑤ 감지)
  hanja[]           # [{char:慣, mean:익숙할}, ...]
  target_errors[]   # 참고용

quiz_items          # 따라해보기 객관식
  id (PK)
  concept_id (FK)
  prompt
  options[]         # [{text, is_correct, tag}]  ← tag가 교차분석 핵심
  type              # 정의형 | 적용형 | 변별형

students
  id (PK)
  name, grade
  entry_type        # 4유형 (초기 추정 → 행동으로 갱신)
  lens_type         # 뇌유형 (추론, nullable)
  created_at

sessions            # 정량(#1)
  id (PK)
  student_id (FK)
  started_at, ended_at
  active_seconds    # 무활동 타임아웃 보정

word_progress       # 단어별 진행
  id (PK)
  student_id, concept_id (FK)
  stages_visited[]  # [개념, 따라해보기, 설명하기]
  status            # learning | review

attempts            # ★ 모든 분석의 원천
  id (PK)
  student_id, concept_id (FK)
  stage             # objective | subjective
  result            # correct/incorrect (obj) | explained/failed (subj)
  chosen_option     # obj: 고른 보기 index
  answer_text       # subj: 답안 원문
  tags[]            # ①~⑥ (복수)  ← obj는 보기 tag, subj는 태깅 결과
  scaffold_used     # subj: 2단 비계 호출 여부
  hesitation_count  # subj: 멈칫·수정 횟수
  created_at

diagnostics         # 파생(캐시 가능)
  student_id (FK)
  tag_freq{}        # {①:3, ②:2, ...}
  matrix{}          # 개념별 A/B/C/D
  prescription      # 처방 1순위 텍스트
  updated_at
```

`attempts` 한 테이블만 잘 쌓으면 2×2 매트릭스·태그 빈도·처방이 전부 파생된다.

---

## 5. 자동 태깅 구현 메모 (주관식)
입력: `answer_text` + 해당 `concepts` 메타.
방식 추천 — **규칙 + LLM 하이브리드**:
- 규칙(싸고 확실): '것/거' 빈도·`hesitation_count` → ② 신호 / `core_elements` 문자열 매칭 → ④ / `over_general`·`confusable` 등장 → ①·⑤ 후보.
- LLM(최종 판정): 6개 태그 정의 + 그 개념의 `correct_subject/closing_noun/core_elements/confusable`를 주고
  "해당하는 태그를 복수로, 근거 한 줄과 함께" 출력하게. 규칙 신호를 힌트로 동봉.
- 출력: `tags[]` + 태그별 근거 → `attempts`에 저장.
- 주의: 비계는 멈칫·요청 감지 후에만(측정 오염 방지).

---

## 6. 추천 빌드 순서
1. 스키마 + 시드 import (`concepts`)
2. 학생 5단계 화면 흐름 (설명하기 필수 게이트)
3. 객관식: `quiz_items` 데이터 구동 — 보기 tag만 기록하면 끝 (제일 쉬움)
4. 주관식 태깅 서비스 (5번 메모)
5. `diagnostics` 집계 + 선생님 리포트 (목업 그대로)
6. 유형 진단 (초기 6문항 → 행동 갱신)

---

## 7. 시작 전 정해둘 것 (코드에서 굳힐 빈칸)
- 콘텐츠: 관성 외 8개 풀세트 채우기 (시드 1줄 → 풀세트 1개)
- 기술 스택 / 단어 데이터량
- `quiz_items` 실제 문항 작성 (시드 메타로 보기 자동 생성 가능)
- 행동→유형 갱신의 N회 임계값, 태그→뇌유형 매핑 비율

*v1 — 이 문서가 코드 작업의 진입점. 변경은 각 원본 문서에 반영 후 여기 동기화.*
