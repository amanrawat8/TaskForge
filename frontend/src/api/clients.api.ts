import { apiClient } from "@/api/client";

export type Client = {
  id: string;
  name: string;
  createdAt: string;
};

export async function listClients() {
  const { data } = await apiClient.get<{ success: true; clients: Client[] }>("/clients");
  return data.clients;
}

export async function createClient(name: string) {
  const { data } = await apiClient.post<{ success: true; client: Client }>("/clients", { name });
  return data.client;
}
