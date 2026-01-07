import prisma from "../prisma/prisma.js";

export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log("Prisma connected to MySQL successfully");
  } catch (error) {
    console.error("Prisma connection error:", error);
    process.exit(1);
  }
};
