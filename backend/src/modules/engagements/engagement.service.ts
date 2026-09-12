import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { isUniqueConstraintError } from "../../utils/prismaErrors.js";
import { normalizePeriod, addDays } from "../../utils/period.js";

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

  const { periodStart, periodEnd } = normalizePeriod(
    serviceType.isRecurring ? serviceType.recurrenceUnit : null,
    data.periodStart,
  );

  try {
    return await prisma.$transaction(async (tx) => {
      const engagement = await tx.engagement.create({
        data: { clientId: data.clientId, serviceTypeId: data.serviceTypeId, periodStart, periodEnd },
      });

      await tx.task.createMany({
        data: serviceType.taskTemplates.map((template) => ({
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
