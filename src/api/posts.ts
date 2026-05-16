import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { request } from "@/lib/http";

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  author: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}

export const postKeys = {
  all: ["posts"] as const,
  detail: (id: number) => [...postKeys.all, id] as const,
};

async function getPosts(): Promise<Post[]> {
  return request<Post[]>("/api/posts");
}

async function getPost(id: number): Promise<Post> {
  return request<Post>(`/api/posts/${id}`);
}

async function createPost(data: CreatePostRequest): Promise<Post> {
  return request<Post>("/api/posts", { method: "POST", body: data });
}

async function updatePost(id: number, data: UpdatePostRequest): Promise<Post> {
  return request<Post>(`/api/posts/${id}`, { method: "PUT", body: data });
}

async function deletePost(id: number): Promise<undefined> {
  return request<undefined>(`/api/posts/${id}`, { method: "DELETE" });
}

export function usePostsQuery() {
  return useQuery({
    queryKey: postKeys.all,
    queryFn: getPosts,
  });
}

export function usePostQuery(id: number) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPost(id),
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostRequest }) =>
      updatePost(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(postKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
