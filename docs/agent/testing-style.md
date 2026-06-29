# Testing Style Guide

> Frontend stack: Vitest, Testing Library, user-event, Playwright.

## 1. 테스트 계층 선택

| 대상         | 도구            | Scope                                |
| ------------ | --------------- | ------------------------------------ |
| Pure utility | Vitest          | 입출력, 경계값                       |
| UI component | Testing Library | 렌더링, 접근성 role, 사용자 행동     |
| Route page   | Testing Library | provider/router 포함 렌더링          |
| Browser flow | Playwright      | 핵심 라우팅과 실제 브라우저 상호작용 |

원칙: 브라우저가 필요 없으면 Vitest. 실제 navigation, focus, viewport, network-like flow가 중요하면 Playwright.

## 2. 네이밍

```ts
describe("Button", () => {
  it("renders and handles clicks", async () => {
    // ...
  });
});
```

- `describe`: 컴포넌트, route, utility 이름.
- `it`: 사용자가 관찰하는 결과 중심.
- 한글 UI 문구는 assertion에 그대로 사용한다.
- 내부 구현 이름을 테스트 설명으로 쓰지 않는다.

## 3. Testing Library 원칙

- `getByRole`을 최우선으로 사용한다.
- 사용자 상호작용은 `userEvent`를 사용한다.
- `fireEvent`는 low-level DOM 이벤트가 목적일 때만 사용한다.
- 테스트는 DOM 구조보다 접근 가능한 이름과 role을 검증한다.

```tsx
it("submits the form", async () => {
  const user = userEvent.setup();

  render(<TaskForm onSubmit={onSubmit} />);

  await user.type(screen.getByRole("textbox", { name: "제목" }), "릴리즈 점검");
  await user.click(screen.getByRole("button", { name: "저장" }));

  expect(onSubmit).toHaveBeenCalledWith({ title: "릴리즈 점검" });
});
```

## 4. given / when / then

```tsx
it("shows an empty state when there are no tasks", () => {
  // given
  const tasks: Task[] = [];

  // when
  render(<TaskList tasks={tasks} />);

  // then
  expect(screen.getByText("작업이 없습니다")).toBeInTheDocument();
});
```

- `when`은 가능하면 한 가지 행동만 둔다.
- 여러 행동을 검증해야 하면 테스트를 나눈다.
- `expect`는 사용자가 보는 결과를 우선한다.

## 5. Mock 전략

| 상황             | 선택                | 이유                  |
| ---------------- | ------------------- | --------------------- |
| 순수 UI          | 실제 props          | 구현과 덜 결합        |
| callback 확인    | `vi.fn()`           | 사용자 행동 결과 검증 |
| network boundary | fake handler/client | 실제 흐름과 유사      |
| 시간, 랜덤       | fake timer/seed     | 결정적 테스트         |

- TanStack Query를 쓰는 테스트는 테스트 전용 `QueryClient`를 생성한다.
- query cache는 테스트 간 공유하지 않는다.
- 이미 화면에 드러난 결과를 내부 함수 호출로 중복 검증하지 않는다.

## 6. Playwright 원칙

- E2E는 핵심 사용자 플로우만 둔다.
- 테스트는 `tests/e2e/*.spec.ts`에 둔다.
- locator는 role/name 중심으로 작성한다.
- visual timing에 기대지 말고 `expect(locator).toBeVisible()`처럼 상태를 기다린다.
- 브라우저 테스트가 필요한 변경이면 `pnpm e2e`를 실행한다.

```ts
test("loads the workspace dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "제품 워크스페이스" }),
  ).toBeVisible();
});
```

## 7. 테스트 데이터

- 테스트마다 필요한 데이터만 명시한다.
- 같은 fixture가 3개 이상 테스트에서 반복되면 factory 함수로 분리한다.
- fixture는 실제 제품 문구와 헷갈리지 않게 최소화한다.
- snapshot은 구조가 안정적이고 리뷰 가치가 있을 때만 사용한다.

## 8. 검증 명령

```bash
pnpm test
pnpm validate
pnpm e2e
```

런타임 코드 변경은 최소 `pnpm validate`. 라우팅, 브라우저 동작, 접근성 interaction 변경은 `pnpm e2e`까지 실행한다.
