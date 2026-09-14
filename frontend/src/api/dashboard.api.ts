import { apiClient } from "@/api/client";

export type DashboardSummary = {
  openTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  waitingForClientTasks: number;
  waitingForReviewTasks: number;
};

export async function getDashboard() {
  const { data } = await apiClient.get<{ success: true; dashboard: DashboardSummary }>(
    "/dashboard",
  );
  return data.dashboard;
}
