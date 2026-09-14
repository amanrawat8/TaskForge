import { AlertCircle, CalendarClock, CircleDot, Hourglass, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuth } from "@/features/auth/useAuthStore";
import { useDashboard } from "@/features/dashboard/useDashboardQuery";

const STATS = [
  { key: "openTasks", label: "Open tasks", icon: CircleDot } as const,
  { key: "overdueTasks", label: "Overdue", icon: AlertCircle } as const,
  { key: "dueTodayTasks", label: "Due today", icon: CalendarClock } as const,
  { key: "waitingForClientTasks", label: "Waiting for client", icon: Hourglass } as const,
  { key: "waitingForReviewTasks", label: "Waiting for review", icon: MessageCircle } as const,
];

export function DashboardPage() {
  const { session } = useAuth();
  const { data, isPending, isError, error } = useDashboard();

  const heading = session?.user.role === "TEAM_MEMBER" ? "Your tasks" : "Team overview";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">{heading}</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of {session?.user.role === "TEAM_MEMBER" ? "your" : "the team's"} current
          workload.
        </p>
      </div>

      {isError && (
        <ErrorState
          title="Couldn't load dashboard"
          description={error instanceof Error ? error.message : undefined}
        />
      )}

      {!isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STATS.map((stat) => (
            <Card key={stat.key}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-semibold">{data?.[stat.key] ?? 0}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
