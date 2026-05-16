# Post Spring Best Practice Client

React 19, TypeScript 6, Vite 8 기반의 프론트엔드 클라이언트입니다. Tailwind CSS 4, Radix UI, TanStack Query, React Router, Vitest, Playwright를 사용해 제품형 UI를 빠르게 개발하고 검증할 수 있도록 구성되어 있습니다.

## 기술 스택

| 영역            | 기술                                        |
| --------------- | ------------------------------------------- |
| Runtime         | Node.js 24 LTS                              |
| Package Manager | pnpm 10.x via Corepack                      |
| App             | React 19, TypeScript 6, Vite 8              |
| UI              | Tailwind CSS 4, Radix UI, CVA, lucide-react |
| Routing         | React Router 7                              |
| Server State    | TanStack Query 5                            |
| Test            | Vitest, Testing Library, Playwright         |

## 요구사항

- Node.js 24 LTS
- Corepack
- pnpm 10.x

Node 버전은 `.node-version`과 `.nvmrc`에 `24`로 고정되어 있습니다.

## 최초 설치

```bash
corepack enable
pnpm install
```

`pnpm` 명령을 찾지 못하면 Corepack을 먼저 활성화합니다.

```bash
corepack prepare pnpm@10.33.4 --activate
corepack enable
```

## 개발 서버 실행

```bash
pnpm dev
```

기본 접속 주소:

```text
http://127.0.0.1:5173/
```

다른 프로세스가 `5173` 포트를 사용 중이면 Vite가 다음 사용 가능한 포트를 안내합니다. 포트를 명시하고 싶으면 다음처럼 실행합니다.

```bash
pnpm dev --host 127.0.0.1 --port 5173
```

## 빌드

```bash
pnpm build
```

`tsc -b`로 타입 체크를 먼저 수행한 뒤 Vite production build를 생성합니다. 결과물은 `dist/`에 만들어집니다.

빌드 결과를 로컬에서 확인하려면 다음 명령을 사용합니다.

```bash
pnpm preview
```

## 검증 명령

```bash
pnpm format
pnpm validate
pnpm build
```

| 명령            | 역할                              |
| --------------- | --------------------------------- |
| `pnpm format`   | Prettier 포맷 확인                |
| `pnpm validate` | ESLint, TypeScript, Vitest 실행   |
| `pnpm build`    | 타입 체크와 production build 실행 |

자동 포맷이 필요할 때만 다음 명령을 사용합니다.

```bash
pnpm format:write
```

## 테스트

### Unit / Component Test

```bash
pnpm test
pnpm test:watch
```

Vitest와 Testing Library를 사용합니다. 테스트 파일은 주로 `src/**/*.test.tsx` 형태로 둡니다.

### E2E Test

처음 한 번 Playwright 브라우저를 설치합니다.

```bash
pnpm exec playwright install chromium
```

E2E 테스트 실행:

```bash
pnpm e2e
```

Playwright UI 모드:

```bash
pnpm e2e:ui
```

E2E 테스트는 `tests/e2e/`에 둡니다. `playwright.config.ts`가 Vite dev server를 자동으로 실행합니다.

## 주요 폴더 구조

```text
src/
├── components/ui/   # Radix/CVA 기반 재사용 UI primitive
├── layouts/         # 라우트 레이아웃
├── lib/             # 공용 유틸리티
├── routes/          # route-level page와 route 테스트
├── test/            # Vitest/Testing Library setup
├── main.tsx         # 앱 진입점
├── providers.tsx    # 전역 Provider 조합
└── router.tsx       # React Router 설정
tests/e2e/           # Playwright E2E 테스트
```

## 작업별 참고 문서

작업을 시작하기 전에 관련 문서를 먼저 확인합니다.

| 작업                 | 문서                           |
| -------------------- | ------------------------------ |
| 에이전트 작업 가이드 | `AGENTS.md`                    |
| 구현 · 리팩터링      | `.claude/coding-style.md`      |
| UI · 컴포넌트 · 화면 | `.claude/ui-style.md`          |
| 테스트 작성 · 수정   | `.claude/testing-style.md`     |
| 커밋 메시지          | `.claude/commit-convention.md` |

## 자주 겪는 문제

### `pnpm: command not found`

Corepack을 활성화합니다.

```bash
corepack prepare pnpm@10.33.4 --activate
corepack enable
pnpm -v
```

### Playwright 브라우저가 없다고 나올 때

Chromium 브라우저를 설치합니다.

```bash
pnpm exec playwright install chromium
```

### 개발 서버 포트가 충돌할 때

실행 중인 Vite 서버를 종료하거나 포트를 명시합니다.

```bash
pnpm dev --host 127.0.0.1 --port 5174
```

### 의존성 상태가 이상할 때

패키지 매니저는 pnpm만 사용합니다. 다른 lockfile을 만들지 말고 `pnpm-lock.yaml` 기준으로 다시 설치합니다.

```bash
pnpm install
```
