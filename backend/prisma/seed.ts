import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";
import { createEngagement } from "../src/modules/engagements/engagement.service.js";
import { ApiError } from "../src/utils/ApiError.js";

const DEMO_PASSWORD = "password123";

async function upsertUser(name: string, email: string, role: "ADMIN" | "MANAGER" | "TEAM_MEMBER") {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role },
  });
}

async function upsertClient(name: string) {
  const existing = await prisma.client.findFirst({ where: { name } });
  return existing ?? prisma.client.create({ data: { name } });
}

// Reuses the real business logic — 409 (already exists) is expected and fine on a re-run.
async function seedEngagement(clientId: string, serviceTypeId: string, periodStart: Date) {
  try {
    return await createEngagement({ clientId, serviceTypeId, periodStart });
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 409) return null;
    throw err;
  }
}

async function main() {
  console.log("Seeding users...");
  const admin = await upsertUser("Admin User", "admin@taskmgmt.test", "ADMIN");
  const manager1 = await upsertUser("Priya Sharma", "manager1@taskmgmt.test", "MANAGER");
  const manager2 = await upsertUser("Rahul Verma", "manager2@taskmgmt.test", "MANAGER");
  const member1 = await upsertUser("Aisha Khan", "member1@taskmgmt.test", "TEAM_MEMBER");
  const member2 = await upsertUser("Dev Patel", "member2@taskmgmt.test", "TEAM_MEMBER");
  const member3 = await upsertUser("Neha Gupta", "member3@taskmgmt.test", "TEAM_MEMBER");
  const member4 = await upsertUser("Sam Wilson", "member4@taskmgmt.test", "TEAM_MEMBER");
  const members = [member1, member2, member3, member4];

  console.log("Seeding clients...");
  const clients = await Promise.all(
    ["Acme Corp", "Globex Inc", "Initech", "Umbrella Corp", "Stark Industries"].map(upsertClient),
  );

  console.log("Seeding service types...");
  const monthlyGst = await prisma.serviceType.upsert({
    where: { name: "Monthly GST Compliance" },
    update: {},
    create: {
      name: "Monthly GST Compliance",
      isRecurring: true,
      recurrenceUnit: "MONTHLY",
      taskTemplates: {
        create: [
          { title: "Collect invoices from client", order: 1, defaultDueOffsetDays: 5 },
          { title: "Reconcile GST input/output", order: 2, defaultDueOffsetDays: 8 },
          { title: "File GSTR return", order: 3, defaultDueOffsetDays: 10 },
        ],
      },
    },
  });

  const gstRegistration = await prisma.serviceType.upsert({
    where: { name: "GST Registration" },
    update: {},
    create: {
      name: "GST Registration",
      isRecurring: false,
      taskTemplates: {
        create: [
          { title: "Prepare registration documents", order: 1, defaultDueOffsetDays: 3 },
          { title: "Submit application to GST portal", order: 2, defaultDueOffsetDays: 7 },
        ],
      },
    },
  });

  const gstRefund = await prisma.serviceType.upsert({
    where: { name: "GST Refund" },
    update: {},
    create: {
      name: "GST Refund",
      isRecurring: false,
      taskTemplates: {
        create: [
          { title: "Compile refund claim", order: 1, defaultDueOffsetDays: 5 },
          { title: "File refund application", order: 2, defaultDueOffsetDays: 12 },
        ],
      },
    },
  });

  console.log("Seeding engagements + tasks...");
  const monthlyPeriod = new Date("2026-09-15");
  for (const client of clients) {
    await seedEngagement(client.id, monthlyGst.id, monthlyPeriod);
  }
  for (const client of clients.slice(0, 3)) {
    await seedEngagement(client.id, gstRegistration.id, new Date("2026-09-10"));
  }
  for (const client of clients.slice(3, 5)) {
    await seedEngagement(client.id, gstRefund.id, new Date("2026-09-12"));
  }

  console.log("Assigning tasks and varying statuses for demo...");
  const allTasks = await prisma.task.findMany({ orderBy: { createdAt: "asc" } });

  await Promise.all(
    allTasks.map((task, i) =>
      prisma.task.update({ where: { id: task.id }, data: { assignedToId: members[i % members.length]!.id } }),
    ),
  );

  if (allTasks[0]) await prisma.task.update({ where: { id: allTasks[0].id }, data: { status: "IN_PROGRESS" } });
  if (allTasks[1]) await prisma.task.update({ where: { id: allTasks[1].id }, data: { status: "READY_FOR_REVIEW" } });
  if (allTasks[2]) await prisma.task.update({ where: { id: allTasks[2].id }, data: { status: "WAITING_FOR_CLIENT" } });
  if (allTasks[3]) {
    await prisma.task.update({
      where: { id: allTasks[3].id },
      data: { status: "COMPLETED", reviewedById: manager1.id },
    });
  }

  console.log("Seed complete:", {
    admin: admin.email,
    managers: [manager1.email, manager2.email],
    teamMembers: members.map((m) => m.email),
    clients: clients.map((c) => c.name),
    serviceTypes: [monthlyGst.name, gstRegistration.name, gstRefund.name],
    totalTasks: allTasks.length,
    demoPassword: DEMO_PASSWORD,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
