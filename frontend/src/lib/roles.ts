import type { Role } from "@/lib/types";

export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TEAM_MEMBER: "TEAM_MEMBER",
} as const satisfies Record<Role, Role>;

export const canManageClients = (role: Role) => role === "ADMIN";
export const canManageServiceTypes = (role: Role) => role === "ADMIN";
export const canManageUsers = (role: Role) => role === "ADMIN";
export const canManageEngagements = (role: Role) => role === "ADMIN" || role === "MANAGER";
export const canViewClientsEngagements = canManageEngagements;
export const canReassignTasks = (role: Role) => role === "ADMIN" || role === "MANAGER";
