import { prisma } from "../src/config/prisma.js";
import { createUser } from "../src/modules/users/user.service.js";
import { createClient } from "../src/modules/clients/client.service.js";
import { createServiceType } from "../src/modules/serviceTypes/service-type.service.js";
import { createEngagement } from "../src/modules/engagements/engagement.service.js";
import { signToken } from "../src/utils/jwt.js";

export function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export async function createTestActor(role: "ADMIN" | "MANAGER" | "TEAM_MEMBER") {
  const suffix = uniqueSuffix();
  const user = await createUser({
    name: `Test ${role} ${suffix}`,
    email: `test-${role.toLowerCase()}-${suffix}@example.com`,
    password: "password123",
    role,
  });
  const token = signToken({ sub: user.id, role });
  return { user, token };
}

export async function createTestServiceType() {
  const suffix = uniqueSuffix();
  return createServiceType({
    name: `Test Service ${suffix}`,
    isRecurring: true,
    recurrenceUnit: "MONTHLY",
    taskTemplates: [{ title: "Do the thing", order: 1, defaultDueOffsetDays: 5 }],
  });
}

export async function createTestEngagement(serviceTypeId: string, periodStart = new Date()) {
  const suffix = uniqueSuffix();
  const client = await createClient(`Test Client ${suffix}`);
  const engagement = await createEngagement({ clientId: client.id, serviceTypeId, periodStart });
  return { client, engagement, task: engagement.tasks[0]! };
}

export async function cleanupUsers(userIds: string[]) {
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

export async function cleanupEngagement(engagementId: string, clientId: string) {
  await prisma.taskHistory.deleteMany({ where: { task: { engagementId } } });
  await prisma.task.deleteMany({ where: { engagementId } });
  await prisma.engagement.delete({ where: { id: engagementId } });
  await prisma.client.delete({ where: { id: clientId } });
}

export async function cleanupServiceType(serviceTypeId: string) {
  await prisma.taskTemplate.deleteMany({ where: { serviceTypeId } });
  await prisma.serviceType.delete({ where: { id: serviceTypeId } });
}
