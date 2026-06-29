# Commit Convention

## 형식

```text
type(scope): 한국어 설명
```

## 타입

| 타입       | 용도                                              |
| ---------- | ------------------------------------------------- |
| `feat`     | 새로운 기능 추가                                  |
| `fix`      | 버그 수정                                         |
| `docs`     | 문서 수정                                         |
| `style`    | 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우 |
| `refactor` | 리팩터링                                          |
| `test`     | 테스트 코드 추가 및 리팩터링                      |
| `chore`    | 빌드, 패키지 매니저, 설정 변경                    |
| `comment`  | 주석 추가 및 변경                                 |
| `remove`   | 파일, 폴더 삭제                                   |
| `rename`   | 파일명, 폴더명 수정                               |

## 스코프

| 스코프   | 용도                                       |
| -------- | ------------------------------------------ |
| `ui`     | 공용 UI primitive, 스타일 시스템           |
| `route`  | 라우팅, 페이지, 레이아웃                   |
| `query`  | TanStack Query, 서버 상태                  |
| `test`   | Vitest, Testing Library, Playwright        |
| `config` | Vite, TypeScript, ESLint, Playwright, pnpm |
| `global` | 특정 영역에 국한되지 않는 변경             |

도메인이 생기면 도메인명을 scope로 사용한다. 예: `task`, `post`, `user`.

## 예시

```text
feat(route): 워크스페이스 대시보드 화면 추가
fix(ui): 버튼 disabled 상태 포커스 스타일 수정
test(route): 홈 화면 E2E 스모크 테스트 추가
docs(global): 작업별 에이전트 지침 문서 추가
chore(config): TypeScript 경로 alias 설정 정리
```

## 규칙

- 제목은 72자 이내로 쓴다.
- 마침표로 끝내지 않는다.
- 변경 이유가 필요하면 본문에 작성한다.
- 여러 타입이 섞이면 사용자 영향이 가장 큰 타입을 선택한다.
- 커밋에는 요청된 변경과 관련된 파일만 포함한다.

## 브랜치 전략

- `main`은 안정 브랜치다. 릴리즈가 위치한다.
- 모든 작업 브랜치는 최신 `main`에서 분기한다.
- 작업 브랜치 PR은 `main`을 대상으로 열고, 리뷰 후 `main`에 병합한다.
- 통합 브랜치(`develop`)를 운영하는 경우, 작업 브랜치는 `develop`에서 분기하고 `develop`으로 병합하며 `develop -> main` 릴리즈 PR로 승격한다.

## 브랜치 네이밍

```text
type/short-description
```

예시:

```text
feat/post-like
fix/auth-token-refresh
docs/agent-rules
refactor/post-service
```

- 커밋 타입과 동일한 prefix를 쓴다.
- `/` 뒤 설명은 소문자 kebab-case로 쓴다.
- `codex/`, `claude/` 같은 도구 prefix를 붙이지 않는다.
- 사용자가 정확한 브랜치명을 주면 그대로 쓴다. 없으면 이 형식으로 정한다.
