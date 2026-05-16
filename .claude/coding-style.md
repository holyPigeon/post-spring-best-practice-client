# Coding Style — Frontend Instruction Set

Base: Toss-like product frontend style. Stack: React 19, TypeScript 6, Vite 8.

## File Structure

| 위치                 | 역할                                           |
| -------------------- | ---------------------------------------------- |
| `src/routes/`        | route-level page, route error, page-local test |
| `src/layouts/`       | shell, navigation, shared route layout         |
| `src/components/ui/` | reusable UI primitive only                     |
| `src/lib/`           | framework-light utility                        |
| `src/providers.tsx`  | app-wide provider composition                  |
| `tests/e2e/`         | Playwright browser scenarios                   |

Dependency direction: `routes → layouts/components → lib`. Never import route code from shared UI.

## TypeScript Rules

- `strict` 기준을 깨지 않는다.
- `any` 금지. 불가피한 외부 입력은 `unknown`으로 받고 좁힌다.
- import는 `@/*` alias를 우선한다.
- type import는 같은 import 안에서 `type` modifier를 사용한다.
- 공개 prop type은 명시한다. 컴포넌트 내부 추론만으로 외부 API를 숨기지 않는다.
- enum보다 union type 또는 readonly object map을 우선한다.
- nullable 값은 렌더 직전에 처리하지 말고 데이터 경계에서 좁힌다.

```ts
import { Button, type ButtonProps } from "@/components/ui/button";

type Status = "idle" | "loading" | "success" | "error";
```

## React Rules

- 컴포넌트는 named export를 기본으로 한다.
- props는 작게 유지한다. 화면 전체 데이터를 통째로 넘기지 않는다.
- 파생 상태는 state로 저장하지 않는다.
- `useEffect`는 외부 시스템 동기화에만 사용한다. 렌더 계산에는 사용하지 않는다.
- 이벤트 핸들러는 사용자 의도를 드러내는 이름을 사용한다.
- route-level 데이터와 UI primitive를 섞지 않는다.

```tsx
type SaveButtonProps = {
  isPending: boolean;
  onSave: () => void;
};

export function SaveButton({ isPending, onSave }: SaveButtonProps) {
  return (
    <Button disabled={isPending} onClick={onSave}>
      저장
    </Button>
  );
}
```

## Routing Rules

- 라우트 정의는 `src/router.tsx`에서 관리한다.
- route-level page는 `src/routes/{name}-page.tsx`에 둔다.
- 페이지의 로딩, 빈 상태, 에러 상태는 사용자 관점의 문구와 액션을 포함한다.
- 라우트 추가 시 최소 렌더링 테스트 또는 E2E 스모크 테스트를 추가한다.

## State & Server Data

- 서버 상태는 TanStack Query를 사용한다.
- UI-only 상태는 가장 가까운 컴포넌트에 둔다.
- 전역 상태는 실제로 여러 라우트가 공유할 때만 추가한다.
- query key는 도메인 단위 tuple로 만든다.

```ts
const taskKeys = {
  all: ["tasks"] as const,
  detail: (taskId: string) => [...taskKeys.all, taskId] as const,
};
```

## Error Handling

- 사용자에게 보이는 에러는 복구 액션을 함께 제공한다.
- route error는 `RouteError`처럼 라우터 경계에서 처리한다.
- 네트워크 에러, empty state, 권한 없음은 서로 다른 상태로 표현한다.
- `console.log`를 남기지 않는다. 디버그 로그는 커밋 전 제거한다.

## Refactoring Rules

- 중복 제거보다 의미 분리를 우선한다.
- 추상화는 3회 이상 반복되거나 변경 이유가 명확히 갈릴 때 추가한다.
- shared UI에 제품 도메인 문구를 넣지 않는다.
- 파일 이동 시 import alias와 테스트 경로를 함께 갱신한다.
