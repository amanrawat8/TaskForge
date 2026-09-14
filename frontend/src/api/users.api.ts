import { apiClient } from "@/api/client";
import type { Role } from "@/lib/types";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export async function listUsers(role?: Role) {
  const { data } = await apiClient.get<{ success: true; users: User[] }>("/users", {
    params: role ? { role } : undefined,
  });
  return data.users;
}

export async function createUser(input: CreateUserInput) {
  const { data } = await apiClient.post<{ success: true; user: User }>("/users", input);
  return data.user;
}
