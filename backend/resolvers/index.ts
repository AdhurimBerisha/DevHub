import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
      }: {
        input: {
          email: string;
          username: string;
          password: string;
          role?: string;
        };
      }
    ) => {
      try {
        console.log("CreateUser input:", input);
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const roleValue = (input.role as "USER" | "ADMIN") || "USER";
        console.log("Role value being saved:", roleValue);
        const user = await prisma.user.create({
          data: {
            email: input.email,
            username: input.username,
            password: hashedPassword,
            role: roleValue,
          },
        });
        console.log("Created user:", user);

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || "fallback-secret-key",
          { expiresIn: "7d" }
        );

        return {
          success: true,
          message: "User created successfully",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        };
      } catch (error) {
        console.error("Error creating user:", error);
        return {
          success: false,
          message: "Failed to create user",
          user: null,
          token: null,
        };
      }
    },

    updateUser: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          email?: string;
          username?: string;
          password?: string;
          role?: string;
        };
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
            role: input.role ? (input.role as "USER" | "ADMIN") : undefined,
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

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } }
    ) => {
      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (!user) {
          return {
            success: false,
            message: "Invalid email or password",
            user: null,
            token: null,
          };
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          input.password,
          user.password
        );
        if (!isValidPassword) {
          return {
            success: false,
            message: "Invalid email or password",
            user: null,
            token: null,
          };
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || "fallback-secret-key",
          { expiresIn: "7d" }
        );

        return {
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        };
      } catch (error) {
        console.error("Error during login:", error);
        return {
          success: false,
          message: "Login failed",
          user: null,
          token: null,
        };
      }
    },
  },
};
