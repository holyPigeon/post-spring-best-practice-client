import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number; // 0-based 현재 페이지
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

type PageItem = number | "ellipsis";

const SIBLINGS = 1;

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let value = start; value <= end; value += 1) result.push(value);
  return result;
}

// current, total은 1-based. 양 끝과 현재 주변만 보이고 나머지는 ellipsis로 축약한다.
function buildPageItems(current: number, total: number): PageItem[] {
  const visibleCount = SIBLINGS * 2 + 5;
  if (total <= visibleCount) {
    return range(1, total);
  }

  const left = Math.max(current - SIBLINGS, 1);
  const right = Math.min(current + SIBLINGS, total);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + 2 * SIBLINGS), "ellipsis", total];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis", ...range(total - (2 + 2 * SIBLINGS), total)];
  }
  return [1, "ellipsis", ...range(left, right), "ellipsis", total];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const current = page + 1;
  const items = buildPageItems(current, totalPages);

  return (
    <nav
      aria-label="페이지 탐색"
      className="flex items-center justify-center gap-1"
    >
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className="px-2 text-sm text-slate-400"
          >
            …
          </span>
        ) : (
          <Button
            key={`page-${item}`}
            variant={item === current ? "primary" : "ghost"}
            size="sm"
            aria-label={`페이지 ${item}`}
            aria-current={item === current ? "page" : undefined}
            disabled={disabled}
            onClick={() => onPageChange(item - 1)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </Button>
    </nav>
  );
}
