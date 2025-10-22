import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL!",

    users: async () => {
      try {
        return prisma.user.findMany({
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
    },

    user: async (_: unknown, { id }: { id: string }) => {
      try {
        return prisma.user.findUnique({ where: { id } });
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
      }
    },
  },

  Mutation: {
    createUser: async (
      _: unknown,
      {
        input,
      }: { input: { email: string; username: string; password: string } }
    ) => {
      try {
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const user = await prisma.user.create({
          data: {
            email: input.email,
            username: input.username,
            password: hashedPassword,
          },
        });
        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    },

    updateUser: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: { email?: string; username?: string; password?: string };
      }
    ) => {
      try {
        let hashedPassword: string | undefined = undefined;
        if (input.password) {
          hashedPassword = await bcrypt.hash(input.password, 10);
        }
        const user = await prisma.user.update({
          where: { id },
          data: {
            email: input.email ?? undefined,
            username: input.username ?? undefined,
            password: hashedPassword,
          },
        });
        return user;
      } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
      }
    },

    deleteUser: async (_: unknown, { id }: { id: string }) => {
      try {
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
      }
    },
  },
};
