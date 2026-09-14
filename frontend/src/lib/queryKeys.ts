export const queryKeys = {
  dashboard: () => ["dashboard"] as const,
  clients: {
    all: () => ["clients"] as const,
  },
  serviceTypes: {
    all: () => ["serviceTypes"] as const,
    detail: (id: string) => ["serviceTypes", "detail", id] as const,
  },
  engagements: {
    all: (filters?: { clientId?: string }) => ["engagements", filters ?? {}] as const,
    detail: (id: string) => ["engagements", "detail", id] as const,
  },
  tasks: {
    all: (filters?: { status?: string; assignedToId?: string }) => ["tasks", filters ?? {}] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
  },
  users: {
    all: (role?: string) => ["users", role ?? "all"] as const,
  },
};
