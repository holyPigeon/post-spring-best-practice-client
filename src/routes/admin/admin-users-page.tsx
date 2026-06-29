import { Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import {
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
  type AdminUser,
  type AdminUserSort,
  type UserRole,
} from "@/api/admin";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/http";

import { AdminErrorState } from "./admin-error-state";

const PAGE_SIZE = 20;

const SELECT_CLASS =
  "h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2";

const sortOptions: { value: AdminUserSort; label: string }[] = [
  { value: "LATEST", label: "가입 최신순" },
  { value: "OLDEST", label: "가입 오래된순" },
];

type RoleFilter = "ALL" | UserRole;

const roleFilterOptions: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "전체 권한" },
  { value: "ADMIN", label: "관리자" },
  { value: "USER", label: "사용자" },
];

interface AdminUsersLocationState {
  flash?: string;
}

function roleLabel(role: UserRole): string {
  return role === "ADMIN" ? "관리자" : "사용자";
}

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<AdminUserSort>("LATEST");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  useEffect(() => {
    // 검색어는 입력이 멈춘 뒤(디바운스) 서버로 보내고, 새 검색은 1페이지부터 본다.
    const timer = setTimeout(() => {
      setKeyword(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const usersQuery = useAdminUsersQuery({
    page,
    size: PAGE_SIZE,
    sort,
    keyword: keyword || undefined,
    role: roleFilter === "ALL" ? undefined : roleFilter,
  });
  const deleteMutation = useDeleteAdminUserMutation();
  const location = useLocation();
  const navigate = useNavigate();

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [flash, setFlash] = useState<string | null>(
    (location.state as AdminUsersLocationState | null)?.flash ?? null,
  );

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    // 한 번 읽은 플래시는 history state에서 지워 뒤로가기 시 다시 뜨지 않게 한다.
    if ((location.state as AdminUsersLocationState | null)?.flash) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    // 삭제로 현재 페이지가 비면 이전 페이지로 물러난다.
    const data = usersQuery.data;
    if (
      data &&
      data.content.length === 0 &&
      data.totalElements > 0 &&
      page > 0
    ) {
      setPage((current) => Math.max(current - 1, 0));
    }
  }, [usersQuery.data, page]);

  function handleSortChange(value: AdminUserSort) {
    setSort(value);
    setPage(0);
  }

  function handleRoleFilterChange(value: RoleFilter) {
    setRoleFilter(value);
    setPage(0);
  }

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

  const deleteError =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.isError
        ? "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."
        : undefined;

  const isFiltered = keyword.length > 0 || roleFilter !== "ALL";

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
            총 {usersQuery.data.totalElements}명
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
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                권한
                <select
                  aria-label="권한 필터"
                  value={roleFilter}
                  onChange={(event) =>
                    handleRoleFilterChange(event.target.value as RoleFilter)
                  }
                  className={SELECT_CLASS}
                >
                  {roleFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                정렬
                <select
                  aria-label="정렬 기준"
                  value={sort}
                  onChange={(event) =>
                    handleSortChange(event.target.value as AdminUserSort)
                  }
                  className={SELECT_CLASS}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {usersQuery.data.totalElements === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                {isFiltered
                  ? "검색 결과가 없습니다"
                  : "표시할 사용자가 없습니다"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {isFiltered
                  ? "다른 검색어나 필터를 사용해 보세요."
                  : "새 사용자가 가입하면 여기에 표시됩니다."}
              </p>
            </div>
          ) : (
            <>
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
                    {usersQuery.data.content.map((user) => (
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

              {usersQuery.data.totalPages > 1 && (
                <Pagination
                  page={usersQuery.data.page}
                  totalPages={usersQuery.data.totalPages}
                  onPageChange={setPage}
                  disabled={usersQuery.isFetching}
                />
              )}
            </>
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
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </section>
  );
}
