import { apiClient } from "@/api/client";
import type { RecurrenceUnit } from "@/lib/types";

export type TaskTemplate = {
  id: string;
  title: string;
  order: number;
  defaultDueOffsetDays: number | null;
};

export type ServiceType = {
  id: string;
  name: string;
  isRecurring: boolean;
  recurrenceUnit: RecurrenceUnit | null;
  taskTemplates: TaskTemplate[];
};

export type CreateServiceTypeInput = {
  name: string;
  isRecurring: boolean;
  recurrenceUnit?: RecurrenceUnit;
  taskTemplates: { title: string; order: number; defaultDueOffsetDays?: number }[];
};

export async function listServiceTypes() {
  const { data } = await apiClient.get<{ success: true; serviceTypes: ServiceType[] }>(
    "/service-types",
  );
  return data.serviceTypes;
}

export async function getServiceTypeById(id: string) {
  const { data } = await apiClient.get<{ success: true; serviceType: ServiceType }>(
    `/service-types/${id}`,
  );
  return data.serviceType;
}

export async function createServiceType(input: CreateServiceTypeInput) {
  const { data } = await apiClient.post<{ success: true; serviceType: ServiceType }>(
    "/service-types",
    input,
  );
  return data.serviceType;
}
