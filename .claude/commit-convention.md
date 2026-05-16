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
