import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
  type AdminUser,
  type UserRole,
} from "@/api/admin";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/format";

import { AdminErrorState } from "./admin-error-state";

type SortKey = "recent" | "oldest" | "email";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recent", label: "가입 최신순" },
  { value: "oldest", label: "가입 오래된순" },
  { value: "email", label: "이메일순" },
];

interface AdminUsersLocationState {
  flash?: string;
}

function roleLabel(role: UserRole): string {
  return role === "ADMIN" ? "관리자" : "사용자";
}

function sortUsers(list: AdminUser[], sort: SortKey): AdminUser[] {
  const copy = [...list];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "email":
      return copy.sort((a, b) => a.email.localeCompare(b.email));
    case "recent":
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function AdminUsersPage() {
  const usersQuery = useAdminUsersQuery();
  const deleteMutation = useDeleteAdminUserMutation();
  const location = useLocation();

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [flash, setFlash] = useState<string | null>(
    (location.state as AdminUsersLocationState | null)?.flash ?? null,
  );

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  const visibleUsers = useMemo(() => {
    if (!usersQuery.data) return [];
    const keyword = query.trim().toLowerCase();
    const filtered = keyword
      ? usersQuery.data.filter(
          (user) =>
            user.email.toLowerCase().includes(keyword) ||
            user.nickname.toLowerCase().includes(keyword),
        )
      : usersQuery.data;
    return sortUsers(filtered, sort);
  }, [usersQuery.data, query, sort]);

  function openDelete(user: AdminUser) {
    deleteMutation.reset();
    setDeleteTarget(user);
  }

  function closeDelete() {
    deleteMutation.reset();
    setDeleteTarget(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const { email, id } = deleteTarget;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setFlash(`${email} 계정을 삭제했습니다.`);
      },
    });
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-950">사용자 관리</h1>
          <p className="mt-1 text-sm text-slate-600">
            가입한 사용자를 확인하고 계정을 정리합니다.
          </p>
        </div>
        {usersQuery.isSuccess && (
          <span className="text-sm text-slate-500">
            {usersQuery.data.length}명
          </span>
        )}
      </header>

      {flash && (
        <Alert tone="success" onDismiss={() => setFlash(null)}>
          {flash}
        </Alert>
      )}

      {usersQuery.isPending ? (
        <div
          role="status"
          className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
        >
          사용자 목록을 불러오는 중입니다…
        </div>
      ) : usersQuery.isError ? (
        <AdminErrorState
          error={usersQuery.error}
          onRetry={() => usersQuery.refetch()}
        />
      ) : usersQuery.data.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-900">
            표시할 사용자가 없습니다
          </p>
          <p className="mt-1 text-sm text-slate-500">
            새 사용자가 가입하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative sm:max-w-xs sm:flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="search"
                aria-label="사용자 검색"
                placeholder="이메일 또는 닉네임 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              정렬
              <select
                aria-label="정렬 기준"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visibleUsers.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      이메일
                    </th>
                    <th scope="col" className="px-4 py-3">
                      닉네임
                    </th>
                    <th scope="col" className="px-4 py-3">
                      권한
                    </th>
                    <th scope="col" className="px-4 py-3">
                      가입일
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="font-medium text-slate-950 underline-offset-2 hover:underline"
                        >
                          {user.email}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {user.nickname}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={user.role === "ADMIN" ? "info" : "neutral"}
                        >
                          {roleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/admin/users/${user.id}`}>보기</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`${user.email} 삭제`}
                            onClick={() => openDelete(user)}
                          >
                            <Trash2
                              aria-hidden
                              className="size-4 text-red-600"
                            />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        tone="danger"
        title="사용자를 삭제할까요?"
        description={
          deleteTarget
            ? `${deleteTarget.email} 계정을 삭제하면 되돌릴 수 없습니다.`
            : undefined
        }
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
