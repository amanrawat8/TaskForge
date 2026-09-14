import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCreateServiceType } from "@/features/serviceTypes/useServiceTypesQueries";
import { getErrorMessage } from "@/lib/errors";

const templateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  defaultDueOffsetDays: z.string().optional(),
});

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    isRecurring: z.boolean(),
    recurrenceUnit: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
    taskTemplates: z.array(templateSchema).min(1, "Add at least one task"),
  })
  .refine((data) => !data.isRecurring || !!data.recurrenceUnit, {
    message: "Recurrence unit is required for a recurring service",
    path: ["recurrenceUnit"],
  });

type FormValues = z.infer<typeof schema>;

export function CreateServiceTypePage() {
  const navigate = useNavigate();
  const createServiceType = useCreateServiceType();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isRecurring: false,
      taskTemplates: [{ title: "", defaultDueOffsetDays: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "taskTemplates" });
  const isRecurring = watch("isRecurring");

  const onSubmit = (values: FormValues) => {
    createServiceType.mutate(
      {
        name: values.name,
        isRecurring: values.isRecurring,
        ...(values.isRecurring && values.recurrenceUnit
          ? { recurrenceUnit: values.recurrenceUnit }
          : {}),
        taskTemplates: values.taskTemplates.map((t, index) => ({
          title: t.title,
          order: index + 1,
          ...(t.defaultDueOffsetDays ? { defaultDueOffsetDays: Number(t.defaultDueOffsetDays) } : {}),
        })),
      },
      {
        onSuccess: (serviceType) => {
          toast.success("Service type created");
          navigate(`/service-types/${serviceType.id}`);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

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
        <CardHeader>
          <CardTitle>New service type</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service-type-name">Name</Label>
              <Input id="service-type-name" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <Checkbox
                    id="is-recurring"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label htmlFor="is-recurring">This service recurs on a schedule</Label>
            </div>

            {isRecurring && (
              <div className="flex flex-col gap-1.5">
                <Label>Recurrence</Label>
                <Controller
                  control={control}
                  name="recurrenceUnit"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.recurrenceUnit && (
                  <p className="text-sm text-destructive">{errors.recurrenceUnit.message}</p>
                )}
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Task templates</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ title: "", defaultDueOffsetDays: "" })}
                >
                  <Plus className="size-4" />
                  Add task
                </Button>
              </div>

              {errors.taskTemplates?.root && (
                <p className="text-sm text-destructive">{errors.taskTemplates.root.message}</p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <span className="mt-2 w-5 shrink-0 text-sm text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <Input
                      placeholder="Task title"
                      aria-invalid={!!errors.taskTemplates?.[index]?.title}
                      {...register(`taskTemplates.${index}.title` as const)}
                    />
                    {errors.taskTemplates?.[index]?.title && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.taskTemplates[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Due offset (days)"
                    className="w-40"
                    {...register(`taskTemplates.${index}.defaultDueOffsetDays` as const)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/service-types">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create service type
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
