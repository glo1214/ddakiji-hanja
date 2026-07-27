# 딱이지 한자앱

중1 과학 한자개념어 학습 게임. **Next.js(App Router) + TypeScript + Firebase Firestore**.

## 기능

- 개념어별 4단계 학습(소리-뜻 매칭 → 뜻 추측/공개 → 구조 퍼즐 → 설명 챌린지)
- 관리자 계정 로그인 (전화번호 아이디 + 직접 지정한 비밀번호)
- 전화번호 단일 로그인 (선생님이 학생 계정을 미리 등록)
- 진행상황·점수·오답 사고패턴을 Firestore에 저장 (완료 시각 포함 → 추후 복습 기능)

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 값 채우기 (아래 참고)
npm run dev                        # http://localhost:3000
```

## Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. **Firestore Database** 생성 (Native 모드)
3. 프로젝트 설정 > 웹 앱 등록 후 config 값을 `.env.local`에 입력
4. 보안 규칙은 `firestore.rules` 참고 (콘솔 > Firestore > 규칙에 붙여넣기)

### 환경변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase 웹 config 6개 값 |
| `OPENAI_API_KEY` | 설명하기 채점·분석용 서버 키 (선택) |
| `OPENAI_MODEL` | 채점·분석 모델명 (선택) |

## 사용 흐름

1. `/teacher` 에서 최초 관리자 계정 생성
2. 관리자는 전화번호 + 비밀번호로 로그인
3. 관리자 화면에서 학생 이름 + 전화번호 등록
4. 학생은 `/login` 에서 전화번호만 입력해 로그인
5. 학습 진행 → 진행상황이 자동 저장됨

## Vercel 배포

1. 이 저장소를 [Vercel](https://vercel.com)에 import (Next.js 자동 감지)
2. 프로젝트 설정 > Environment Variables 에 위 환경변수 동일하게 등록
3. Deploy

## 데이터 모델 (Firestore)

```
admins/{phone}                       = { name, phone, passwordHash, createdAt }
students/{phone}                      = { name, phone, createdAt }
students/{phone}/progress/{conceptId} = { done, score, completedAt }
students/{phone}/wrongTags/{tag}      = { count, updatedAt }
students/{phone}/attempts/{autoId}    = 학습 단계별 답안 기록
students/{phone}/reports/{autoId}     = 사고유형 분석 리포트
```

> ⚠️ 전화번호만으로 로그인하므로 번호를 아는 사람은 누구나 접근 가능합니다. 교실용 비민감 데이터 전제이며, 강화하려면 Firebase Auth 도입을 권장합니다.
