import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type UserRole } from "@/api/auth";
import { request } from "@/lib/http";

export type { UserRole };

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  detail: (id: number) => [...adminUserKeys.all, id] as const,
};

async function getAdminUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>("/api/admin/users");
}

async function getAdminUser(id: number): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${id}`);
}

async function deleteAdminUser(id: number): Promise<undefined> {
  return request<undefined>(`/api/admin/users/${id}`, { method: "DELETE" });
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminUserKeys.all,
    queryFn: getAdminUsers,
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
