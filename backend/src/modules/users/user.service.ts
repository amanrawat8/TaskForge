import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { isUniqueConstraintError } from "../../utils/prismaErrors.js";

const safeSelect = { id: true, name: true, email: true, role: true, createdAt: true };

export async function createUser(data: { name: string; email: string; password: string; role: "ADMIN" | "MANAGER" | "TEAM_MEMBER" }) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  try {
    return await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role },
      select: safeSelect,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) throw new ApiError(409, "Email already in use");
    throw err;
  }
}

export async function listUsers(role?: "ADMIN" | "MANAGER" | "TEAM_MEMBER") {
  return prisma.user.findMany({
    ...(role ? { where: { role } } : {}),
    select: safeSelect,
    orderBy: { createdAt: "desc" },
  });
}


