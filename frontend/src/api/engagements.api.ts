import { apiClient } from "@/api/client";
import type { Task } from "@/api/tasks.api";
import type { EngagementStatus } from "@/lib/types";

export type Engagement = {
  id: string;
  clientId: string;
  serviceTypeId: string;
  periodStart: string;
  periodEnd: string;
  status: EngagementStatus;
  createdAt: string;
  client?: { id: string; name: string };
  serviceType?: { id: string; name: string; isRecurring: boolean; recurrenceUnit: string | null };
  tasks?: Task[];
};

export type CreateEngagementInput = {
  clientId: string;
  serviceTypeId: string;
  periodStart: string;
};

export async function listEngagements(filters: { clientId?: string }) {
  const { data } = await apiClient.get<{ success: true; engagements: Engagement[] }>(
    "/engagements",
    { params: filters },
  );
  return data.engagements;
}

export async function getEngagementById(id: string) {
  const { data } = await apiClient.get<{ success: true; engagement: Engagement }>(
    `/engagements/${id}`,
  );
  return data.engagement;
}

export async function createEngagement(input: CreateEngagementInput) {
  const { data } = await apiClient.post<{ success: true; engagement: Engagement }>(
    "/engagements",
    input,
  );
  return data.engagement;
}

export async function generateNextEngagement(id: string) {
  const { data } = await apiClient.post<{ success: true; engagement: Engagement }>(
    `/engagements/${id}/generate-next`,
  );
  return data.engagement;
}
