import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { isUniqueConstraintError } from "../../utils/prismaErrors.js";
import { normalizePeriod, addDays } from "../../utils/period.js";

type RecurrenceUnit = "MONTHLY" | "QUARTERLY" | "YEARLY" | null;

type ServiceTypeWithTemplates = {
  id: string;
  isRecurring: boolean;
  recurrenceUnit: RecurrenceUnit;
  taskTemplates: { id: string; title: string; order: number; defaultDueOffsetDays: number | null }[];
};

async function createEngagementForPeriod(params: {
  clientId: string;
  serviceType: ServiceTypeWithTemplates;
  referenceDate: Date;
}) {
  const { periodStart, periodEnd } = normalizePeriod(
    params.serviceType.isRecurring ? params.serviceType.recurrenceUnit : null,
    params.referenceDate,
  );

  try {
    return await prisma.$transaction(async (tx) => {
      const engagement = await tx.engagement.create({
        data: { clientId: params.clientId, serviceTypeId: params.serviceType.id, periodStart, periodEnd },
      });

      await tx.task.createMany({
        data: params.serviceType.taskTemplates.map((template) => ({
          engagementId: engagement.id,
          templateId: template.id,
          title: template.title,
          dueDate:
            template.defaultDueOffsetDays != null
              ? addDays(periodStart, template.defaultDueOffsetDays)
              : null,
        })),
      });

      return tx.engagement.findUniqueOrThrow({
        where: { id: engagement.id },
        include: { tasks: true, client: true, serviceType: true },
      });
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new ApiError(409, "An engagement for this client, service, and period already exists");
    }
    throw err;
  }
}

type CreateEngagementInput = {
  clientId: string;
  serviceTypeId: string;
  periodStart: Date;
};

export async function createEngagement(data: CreateEngagementInput) {
  const serviceType = await prisma.serviceType.findUnique({
    where: { id: data.serviceTypeId },
    include: { taskTemplates: { orderBy: { order: "asc" } } },
  });
  if (!serviceType) throw new ApiError(404, "Service type not found");

  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) throw new ApiError(404, "Client not found");

  return createEngagementForPeriod({ clientId: data.clientId, serviceType, referenceDate: data.periodStart });
}

export async function generateNextEngagement(engagementId: string) {
  const current = await prisma.engagement.findUnique({
    where: { id: engagementId },
    include: { serviceType: { include: { taskTemplates: { orderBy: { order: "asc" } } } } },
  });
  if (!current) throw new ApiError(404, "Engagement not found");
  if (!current.serviceType.isRecurring) {
    throw new ApiError(400, "Service type is not recurring — cannot generate a next period");
  }

  const nextReferenceDate = addDays(current.periodEnd, 1);

  return createEngagementForPeriod({
    clientId: current.clientId,
    serviceType: current.serviceType,
    referenceDate: nextReferenceDate,
  });
}

export async function listEngagements(filters: { clientId?: string }) {
  return prisma.engagement.findMany({
    ...(filters.clientId ? { where: { clientId: filters.clientId } } : {}),
    include: { client: true, serviceType: true, tasks: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEngagementById(id: string) {
  const engagement = await prisma.engagement.findUnique({
    where: { id },
    include: { client: true, serviceType: true, tasks: true },
  });
  if (!engagement) throw new ApiError(404, "Engagement not found");
  return engagement;
}
