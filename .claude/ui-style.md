# UI Style Guide

Base: product UI for repeated daily work. Stack: Tailwind CSS 4, Radix UI, CVA, lucide-react.

## Visual Direction

- SaaS, CRM, 운영 도구처럼 조용하고 빠르게 스캔되는 화면을 만든다.
- 과한 hero, 장식용 gradient, stock-like visual을 기본으로 쓰지 않는다.
- 정보 밀도는 높이되 간격과 위계를 명확히 한다.
- 카드 반경은 8px 이하를 기본으로 한다.
- 한 가지 색 계열만 반복하는 팔레트는 피한다.

## Component Rules

| 상황             | 선택             |
| ---------------- | ---------------- |
| 접근성 primitive | Radix UI         |
| 버튼 variant     | CVA              |
| class 조합       | `cn()`           |
| 아이콘           | `lucide-react`   |
| 스타일           | Tailwind utility |

- `components/ui`는 primitive 역할만 한다.
- 제품 도메인 컴포넌트는 route 또는 feature 위치에 둔다.
- 버튼, input, dialog, menu 등 상호작용 컴포넌트는 keyboard focus와 disabled 상태를 포함한다.
- 카드 안에 카드를 중첩하지 않는다. 반복 item, modal, framed tool에만 card를 사용한다.

## Tailwind Rules

- class 병합은 `cn()`을 사용한다.
- variant가 2개 이상이면 CVA를 사용한다.
- 임의 값은 레이아웃 안정성이 필요한 경우에만 사용한다.
- 고정 형식 UI는 `min-*`, `max-*`, `aspect-*`, grid track으로 크기 변동을 막는다.
- viewport width 기반 font-size는 사용하지 않는다.

```tsx
const badgeVariants = cva("inline-flex rounded-md px-2 py-1 text-xs", {
  variants: {
    tone: {
      neutral: "bg-slate-100 text-slate-700",
      success: "bg-emerald-100 text-emerald-800",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});
```

## Accessibility

- 버튼은 명령형 이름을 갖는다.
- 아이콘-only 버튼에는 `aria-label`을 반드시 둔다.
- 장식 아이콘은 `aria-hidden`을 둔다.
- 클릭 가능한 `div` 금지. 의미 있는 HTML 요소를 사용한다.
- focus-visible 상태를 제거하지 않는다.
- 색상만으로 상태를 전달하지 않는다.

## Layout

- 모바일과 데스크톱에서 텍스트가 부모를 넘치지 않게 한다.
- 주요 action은 화면 상단 또는 해당 작업 영역 가까이에 둔다.
- list/table/card item은 비교하기 쉬운 정렬 기준을 유지한다.
- loading, empty, error 상태에서도 레이아웃이 크게 흔들리지 않게 한다.

## Copy

- UI 문구는 짧고 행동 중심으로 쓴다.
- 화면 안에 기능 설명서나 개발자용 안내를 길게 넣지 않는다.
- 버튼 텍스트는 결과를 말한다: `저장`, `새 작업`, `다시 시도`.
- 테스트 fixture 문구와 실제 UI 문구가 충돌하지 않게 한다.
