import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import {
  createTestActor,
  createTestServiceType,
  createTestEngagement,
  cleanupUsers,
  cleanupEngagement,
  cleanupServiceType,
} from "./helpers.js";

describe("Task workflow", () => {
  let managerToken: string;
  let managerId: string;
  let assigneeToken: string;
  let assigneeId: string;
  let otherMemberToken: string;
  let serviceTypeId: string;
  const userIds: string[] = [];

  let currentClientId: string | null = null;
  let currentEngagementId: string | null = null;

  beforeAll(async () => {
    const manager = await createTestActor("MANAGER");
    const assignee = await createTestActor("TEAM_MEMBER");
    const otherMember = await createTestActor("TEAM_MEMBER");

    managerToken = manager.token;
    managerId = manager.user.id;
    assigneeToken = assignee.token;
    assigneeId = assignee.user.id;
    otherMemberToken = otherMember.token;
    userIds.push(manager.user.id, assignee.user.id, otherMember.user.id);

    const serviceType = await createTestServiceType();
    serviceTypeId = serviceType.id;
  });

  afterEach(async () => {
    if (currentEngagementId && currentClientId) {
      await cleanupEngagement(currentEngagementId, currentClientId);
      currentEngagementId = null;
      currentClientId = null;
    }
  });

  afterAll(async () => {
    await cleanupServiceType(serviceTypeId);
    await cleanupUsers(userIds);
  });

  async function freshAssignedTask() {
    const { client, engagement, task } = await createTestEngagement(serviceTypeId);
    currentClientId = client.id;
    currentEngagementId = engagement.id;
    await prisma.task.update({ where: { id: task.id }, data: { assignedToId: assigneeId } });
    return task.id;
  }

  it("rejects a status update from someone who is not the assignee", async () => {
    const taskId = await freshAssignedTask();

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${otherMemberToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(403);
  });

  it("rejects an invalid workflow transition", async () => {
    const taskId = await freshAssignedTask();

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${assigneeToken}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(400);
  });

  it("lets the assignee submit work and a manager approve it", async () => {
    const taskId = await freshAssignedTask();

    await request(app).patch(`/api/tasks/${taskId}/status`).set("Authorization", `Bearer ${assigneeToken}`).send({ status: "IN_PROGRESS" });
    await request(app).patch(`/api/tasks/${taskId}/status`).set("Authorization", `Bearer ${assigneeToken}`).send({ status: "READY_FOR_REVIEW" });

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("COMPLETED");
    expect(res.body.task.reviewedById).toBe(managerId);
  });

  it("blocks the assignee from approving their own submitted work", async () => {
    const taskId = await freshAssignedTask();

    await request(app).patch(`/api/tasks/${taskId}/status`).set("Authorization", `Bearer ${assigneeToken}`).send({ status: "IN_PROGRESS" });
    await request(app).patch(`/api/tasks/${taskId}/status`).set("Authorization", `Bearer ${assigneeToken}`).send({ status: "READY_FOR_REVIEW" });

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${assigneeToken}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(403);
  });
});
