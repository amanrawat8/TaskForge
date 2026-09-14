import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/features/clients/useClientsQueries";
import { useCreateEngagement } from "@/features/engagements/useEngagementsQueries";
import { useServiceTypes } from "@/features/serviceTypes/useServiceTypesQueries";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  clientId: z.string().min(1, "Select a client"),
  serviceTypeId: z.string().min(1, "Select a service type"),
  periodStart: z.date({ error: "Select a period start date" }),
});

type FormValues = z.infer<typeof schema>;

export function CreateEngagementPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const { data: clients } = useClients();
  const { data: serviceTypes } = useServiceTypes();
  const createEngagement = useCreateEngagement();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedServiceType = serviceTypes?.find((s) => s.id === watch("serviceTypeId"));

  const onSubmit = (values: FormValues) => {
    setFormError(null);
    createEngagement.mutate(
      {
        clientId: values.clientId,
        serviceTypeId: values.serviceTypeId,
        periodStart: values.periodStart.toISOString(),
      },
      {
        onSuccess: (engagement) => {
          toast.success("Engagement created");
          navigate(`/engagements/${engagement.id}`);
        },
        onError: (err) => setFormError(getErrorMessage(err)),
      },
    );
  };

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Link
        to="/engagements"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to engagements
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>New engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label>Client</Label>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Service type</Label>
              <Controller
                control={control}
                name="serviceTypeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes?.map((serviceType) => (
                        <SelectItem key={serviceType.id} value={serviceType.id}>
                          {serviceType.name}
                          {serviceType.isRecurring ? ` (${serviceType.recurrenceUnit})` : " (one-time)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.serviceTypeId && (
                <p className="text-sm text-destructive">{errors.serviceTypeId.message}</p>
              )}
              {selectedServiceType && (
                <p className="text-xs text-muted-foreground">
                  {selectedServiceType.isRecurring
                    ? `Recurs ${selectedServiceType.recurrenceUnit?.toLowerCase()} — the period will snap to the full ${selectedServiceType.recurrenceUnit?.toLowerCase()}.`
                    : "One-time service — the period will be the exact day you pick."}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Period start</Label>
              <Controller
                control={control}
                name="periodStart"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start font-normal">
                        <CalendarIcon className="size-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.periodStart && (
                <p className="text-sm text-destructive">{errors.periodStart.message}</p>
              )}
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/engagements">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create engagement
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
