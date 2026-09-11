import { prisma } from "../../config/prisma.js";


export async function createClient(name: string) {
    return prisma.client.create({
        data: { name }
    });
}


export async function listClients() {
    return prisma.client.findMany({
        orderBy: { createdAt: "desc"}
    });
}

