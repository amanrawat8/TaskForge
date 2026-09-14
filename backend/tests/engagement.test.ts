import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { createTestActor, createTestServiceType, cleanupUsers, cleanupServiceType } from "./helpers.js";
import { createClient } from "../src/modules/clients/client.service.js";

describe("Engagement creation", () => {
  let managerToken: string;
  let serviceTypeId: string;
  let clientId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    const manager = await createTestActor("MANAGER");
    managerToken = manager.token;
    userIds.push(manager.user.id);

    const serviceType = await createTestServiceType();
    serviceTypeId = serviceType.id;

    const client = await createClient(`Dup Test Client ${Date.now()}`);
    clientId = client.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { engagement: { clientId } } });
    await prisma.engagement.deleteMany({ where: { clientId } });
    await prisma.client.delete({ where: { id: clientId } });
    await cleanupServiceType(serviceTypeId);
    await cleanupUsers(userIds);
  });

  it("creates an engagement and generates tasks from the service type's templates", async () => {
    const res = await request(app)
      .post("/api/engagements")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ clientId, serviceTypeId, periodStart: "2027-03-15" });

    expect(res.status).toBe(201);
    expect(res.body.engagement.tasks).toHaveLength(1);
  });

  it("rejects a duplicate recurring engagement for the same client/service/period", async () => {
    const res = await request(app)
      .post("/api/engagements")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ clientId, serviceTypeId, periodStart: "2027-03-20" });

    expect(res.status).toBe(409);
  });
});
