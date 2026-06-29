# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Language

- 기본 응답은 한국어로 한다.
- 사용자가 명시적으로 요청할 때만 다른 언어를 쓴다.
- 코드, 명령어, 로그, API 이름, 파일 경로, 식별자, 에러 메시지는 원문이 더 명확하면 그대로 둔다.
- 코드 리뷰 제목과 설명은 한국어로 쓴다. `P1`, `P2` 같은 우선순위 라벨은 그대로 둔다.

## Quick Reference

| 작업                 | 먼저 읽을 파일                      |
| -------------------- | ----------------------------------- |
| 구현 · 리팩터링      | `docs/agent/coding-style.md`        |
| UI · 컴포넌트 · 화면 | `docs/agent/ui-style.md`            |
| 테스트 작성 · 수정   | `docs/agent/testing-style.md`       |
| 커밋 · 브랜치        | `docs/agent/commit-convention.md`   |
| 에이전트 문서 수정   | `docs/agent/documentation-style.md` |
| 실행 · 검증 명령     | `AGENTS.md`의 Build & Run           |

작업 시작 전에 관련 문서를 먼저 읽는다. 여러 작업이 섞여 있으면 관련 문서를 모두 읽고, 더 구체적인 문서의 규칙을 우선한다.

## Environment

- Node.js 24 LTS
- pnpm 10.x via Corepack
- React 19, TypeScript 6, Vite 8
- Tailwind CSS 4, Radix UI, TanStack Query 5, React Router 7
- Vitest, Testing Library, Playwright

패키지 매니저는 `pnpm`만 사용한다. `npm install`, `yarn`, lockfile 혼용 금지.

## Build & Run

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Testing

```bash
pnpm validate
pnpm test
pnpm e2e
pnpm e2e:ui
```

`pnpm validate`는 lint, typecheck, unit test를 실행한다. Playwright는 별도 브라우저와 dev server가 필요하므로 E2E 변경 시 `pnpm e2e`까지 실행한다.

## Format

```bash
pnpm format
pnpm format:write
```

자동 수정이 필요한 경우에만 `pnpm format:write`를 사용한다.

## Project Structure

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

의존 방향: `routes → layouts/components → lib`, `providers → external clients`, `components/ui → lib`. `components/ui`는 route, provider, API 클라이언트를 import하지 않는다.

## Working Rules

- 앱 코드 변경 전 `docs/agent/coding-style.md`를 확인한다.
- UI를 만들거나 수정할 때 `docs/agent/ui-style.md`를 확인한다.
- 테스트를 추가하거나 고칠 때 `docs/agent/testing-style.md`를 확인한다.
- 커밋 메시지나 브랜치를 만들 때 `docs/agent/commit-convention.md`를 확인한다.
- 에이전트 문서(`AGENTS.md`, `CLAUDE.md`, `docs/agent/*.md`)를 수정할 때 `docs/agent/documentation-style.md`를 확인한다.
- 런타임 코드를 바꿨다면 최소 `pnpm validate`를 실행한다.
- 화면 동작, 라우팅, 브라우저 상호작용을 바꿨다면 `pnpm e2e`까지 실행한다.
