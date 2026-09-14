import { apiClient } from "@/api/client";
import type { SessionUser } from "@/lib/types";

type LoginResponse = {
  success: true;
  token: string;
  user: SessionUser;
};

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  return { token: data.token, user: data.user };
}
