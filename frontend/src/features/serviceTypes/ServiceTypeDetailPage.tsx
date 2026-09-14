import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { useServiceType } from "@/features/serviceTypes/useServiceTypesQueries";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";

export function ServiceTypeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: serviceType, isPending, isError, error } = useServiceType(id!);

  if (isPending) return <ListSkeleton rows={4} />;

  if (isError) {
    const status = getErrorStatus(error);
    return (
      <ErrorState
        title={status === 404 ? "Service type not found" : "Couldn't load service type"}
        description={status === 404 ? undefined : getErrorMessage(error)}
        backTo="/service-types"
        backLabel="Back to service types"
      />
    );
  }

  if (!serviceType) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        to="/service-types"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to service types
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg">{serviceType.name}</CardTitle>
          {serviceType.isRecurring ? (
            <Badge variant="outline">{serviceType.recurrenceUnit}</Badge>
          ) : (
            <Badge variant="outline">One-time</Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Task templates ({serviceType.taskTemplates.length})
          </p>
          <ol className="flex flex-col gap-2">
            {serviceType.taskTemplates
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((template) => (
                <li
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>
                    {template.order}. {template.title}
                  </span>
                  <span className="text-muted-foreground">
                    {template.defaultDueOffsetDays != null
                      ? `Due ${template.defaultDueOffsetDays}d after period start`
                      : "No default due date"}
                  </span>
                </li>
              ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
