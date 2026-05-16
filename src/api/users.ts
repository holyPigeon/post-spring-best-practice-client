import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { request } from "@/lib/http";

export interface User {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  nickname: string;
  password: string;
}

export interface UpdateUserRequest {
  nickname: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

export const userKeys = {
  all: ["users"] as const,
  detail: (id: number) => [...userKeys.all, id] as const,
};

async function getUsers(): Promise<User[]> {
  return request<User[]>("/api/users");
}

async function getUser(id: number): Promise<User> {
  return request<User>(`/api/users/${id}`);
}

async function createUser(data: CreateUserRequest): Promise<User> {
  return request<User>("/api/users", {
    method: "POST",
    body: data,
    auth: false,
  });
}

async function updateUser(id: number, data: UpdateUserRequest): Promise<User> {
  return request<User>(`/api/users/${id}`, { method: "PUT", body: data });
}

async function updatePassword(
  id: number,
  data: UpdatePasswordRequest,
): Promise<undefined> {
  return request<undefined>(`/api/users/${id}/password`, {
    method: "PATCH",
    body: data,
  });
}

async function deleteUser(id: number): Promise<undefined> {
  return request<undefined>(`/api/users/${id}`, { method: "DELETE" });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: getUsers,
  });
}

export function useUserQuery(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      updateUser(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(userKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePasswordRequest }) =>
      updatePassword(id, data),
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
