export type Role = "ADMIN" | "MANAGER" | "TEAM_MEMBER";

export type TaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY_FOR_REVIEW"
  | "CHANGES_REQUESTED"
  | "WAITING_FOR_CLIENT"
  | "COMPLETED";

export type RecurrenceUnit = "MONTHLY" | "QUARTERLY" | "YEARLY";

export type EngagementStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
