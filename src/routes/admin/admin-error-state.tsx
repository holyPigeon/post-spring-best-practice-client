import { ApiError } from "@/lib/http";
import { Button } from "@/components/ui/button";

interface AdminErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

interface ErrorCopy {
  title: string;
  description: string;
  retryable: boolean;
}

function describeError(status: number | undefined): ErrorCopy {
  switch (status) {
    case 401:
      return {
        title: "로그인이 필요합니다",
        description: "관리자 계정으로 로그인한 뒤 다시 시도하세요.",
        retryable: false,
      };
    case 403:
      return {
        title: "접근 권한이 없습니다",
        description: "이 페이지는 관리자만 사용할 수 있습니다.",
        retryable: false,
      };
    case 404:
      return {
        title: "사용자를 찾을 수 없습니다",
        description: "이미 삭제되었거나 존재하지 않는 사용자입니다.",
        retryable: false,
      };
    default:
      return {
        title: "문제가 발생했습니다",
        description: "잠시 후 다시 시도해 주세요.",
        retryable: true,
      };
  }
}

export function AdminErrorState({ error, onRetry }: AdminErrorStateProps) {
  const status = error instanceof ApiError ? error.status : undefined;
  const { title, description, retryable } = describeError(status);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-8 text-center">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {retryable && onRetry && (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      )}
    </section>
  );
}
