import { ArrowLeft, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
  useAdminUserQuery,
  useDeleteAdminUserMutation,
  type UserRole,
} from "@/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/http";

import { AdminErrorState } from "./admin-error-state";

function roleLabel(role: UserRole): string {
  return role === "ADMIN" ? "관리자" : "사용자";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export function AdminUserDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const userId = Number(params.userId);
  const isValidId = Number.isInteger(userId) && userId > 0;

  const userQuery = useAdminUserQuery(userId, isValidId);
  const deleteMutation = useDeleteAdminUserMutation();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isValidId) {
    return (
      <AdminErrorState error={new ApiError(404, "잘못된 사용자입니다.")} />
    );
  }

  if (userQuery.isPending) {
    return (
      <div
        role="status"
        className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
      >
        사용자 정보를 불러오는 중입니다…
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <AdminErrorState
        error={userQuery.error}
        onRetry={() => userQuery.refetch()}
      />
    );
  }

  const user = userQuery.data;

  function openDelete() {
    deleteMutation.reset();
    setIsConfirming(true);
  }

  function closeDelete() {
    deleteMutation.reset();
    setIsConfirming(false);
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(user.id, {
      onSuccess: () => navigate("/admin"),
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ArrowLeft aria-hidden className="size-4" />
            목록
          </Link>
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={openDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 aria-hidden className="size-4" />
          삭제
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-950">
            {user.nickname}
          </h1>
          <Badge tone={user.role === "ADMIN" ? "info" : "neutral"}>
            {roleLabel(user.role)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">{user.email}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="ID">{user.id}</Field>
          <Field label="권한">{roleLabel(user.role)}</Field>
          <Field label="가입일">{formatDateTime(user.createdAt)}</Field>
          <Field label="수정일">{formatDateTime(user.updatedAt)}</Field>
        </dl>
      </div>

      <ConfirmDialog
        open={isConfirming}
        tone="danger"
        title="사용자를 삭제할까요?"
        description={`${user.email} 계정을 삭제하면 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."
            : undefined
        }
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </section>
  );
}
