import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { type UserRole } from "@/api/auth";
import { request } from "@/lib/http";

export type { UserRole };

export type AdminUserSort = "LATEST" | "OLDEST";

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminUserListParams {
  page: number;
  size: number;
  sort: AdminUserSort;
  keyword?: string;
  role?: UserRole;
}

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  list: (params: AdminUserListParams) =>
    [...adminUserKeys.all, "list", params] as const,
  detail: (id: number) => [...adminUserKeys.all, id] as const,
};

function buildUserListQuery(params: AdminUserListParams): string {
  const query = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort,
  });
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.role) query.set("role", params.role);
  return query.toString();
}

async function getAdminUsers(
  params: AdminUserListParams,
): Promise<PageResponse<AdminUser>> {
  return request<PageResponse<AdminUser>>(
    `/api/admin/users?${buildUserListQuery(params)}`,
  );
}

async function getAdminUser(id: number): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${id}`);
}

async function deleteAdminUser(id: number): Promise<undefined> {
  return request<undefined>(`/api/admin/users/${id}`, { method: "DELETE" });
}

export function useAdminUsersQuery(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => getAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUserQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => getAdminUser(id),
    enabled,
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}
