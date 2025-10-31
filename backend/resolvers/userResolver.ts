import { PrismaClient } from "@prisma/client";
import { generateToken, hashPassword, comparePassword } from "../utils/auth";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  normalizeEmail,
} from "../utils/validator";

const prisma = new PrismaClient();

export const userResolver = {
  Query: {
    hello: () => "Hello from GraphQL!",

    users: async (_: unknown, __: unknown, context: { user: any }) => {
      if (!context.user) throw new Error("Unauthorized");

      const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: context.user.id, status: "ACCEPTED" },
            { receiverId: context.user.id, status: "ACCEPTED" },
          ],
        },
      });

      const friendIds = friendships.map((f) =>
        f.requesterId === context.user.id ? f.receiverId : f.requesterId
      );

      return allUsers.map((u) => ({
        ...u,
        isFriend: friendIds.includes(u.id),
      }));
    },

    user: async (_: unknown, { id }: { id: string }) => {
      try {
        return prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            gender: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
      }
    },
    currentUser: async (_: unknown, __: unknown, context: { user: any }) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      try {
        return await prisma.user.findUnique({
          where: { id: context.user.id },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            gender: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } catch (error) {
        console.error("Error fetching current user:", error);
        throw new Error("Failed to fetch user profile");
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
        const emailValidation = validateEmail(input.email);
        if (!emailValidation.isValid) {
          return {
            success: false,
            message: emailValidation.message,
            user: null,
            token: null,
          };
        }

        const usernameValidation = validateUsername(input.username);
        if (!usernameValidation.isValid) {
          return {
            success: false,
            message: usernameValidation.message,
            user: null,
            token: null,
          };
        }

        const passwordValidation = validatePassword(input.password);
        if (!passwordValidation.isValid) {
          return {
            success: false,
            message: passwordValidation.message,
            user: null,
            token: null,
          };
        }

        const email = normalizeEmail(input.email);

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return {
            success: false,
            message: "User with this email already exists",
            user: null,
            token: null,
          };
        }

        const hashedPassword = await hashPassword(input.password);
        const roleValue = (input.role as "USER" | "ADMIN") || "USER";

        const user = await prisma.user.create({
          data: {
            email,
            username: input.username.trim(),
            password: hashedPassword,
            role: roleValue,
          },
        });

        const token = generateToken(user.id, user.email, user.role);

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
          currentPassword?: string;
          password?: string;
          role?: string;
          gender?: string;
        };
      },
      context: { user: any }
    ) => {
      try {
        if (!context.user || context.user.id !== id) {
          throw new Error("Unauthorized");
        }

        const updateData: any = {};

        if (input.password) {
          if (!input.currentPassword) {
            throw new Error("Current password is required");
          }

          const user = await prisma.user.findUnique({ where: { id } });
          if (!user) throw new Error("User not found");

          const isMatch = await comparePassword(
            input.currentPassword,
            user.password
          );
          if (!isMatch) throw new Error("Current password is incorrect");

          const passwordValidation = validatePassword(input.password);
          if (!passwordValidation.isValid)
            throw new Error(passwordValidation.message);

          updateData.password = await hashPassword(input.password);
        }

        if (input.email) {
          const emailValidation = validateEmail(input.email);
          if (!emailValidation.isValid)
            throw new Error(emailValidation.message);
          updateData.email = normalizeEmail(input.email);
        }

        if (input.username) {
          const usernameValidation = validateUsername(input.username);
          if (!usernameValidation.isValid)
            throw new Error(usernameValidation.message);
          updateData.username = input.username.trim();
        }

        if (input.role) updateData.role = input.role as "USER" | "ADMIN";
        if (input.gender) updateData.gender = input.gender;

        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            gender: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return updatedUser;
      } catch (error: any) {
        console.error("Error updating user:", error);
        throw new Error(error.message || "Failed to update user");
      }
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } }
    ) => {
      try {
        const emailValidation = validateEmail(input.email);
        if (!emailValidation.isValid) {
          return {
            success: false,
            message: "Invalid email or password",
            user: null,
            token: null,
          };
        }

        const email = normalizeEmail(input.email);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return {
            success: false,
            message: "Invalid email or password",
            user: null,
            token: null,
          };
        }

        const isValidPassword = await comparePassword(
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

        const token = generateToken(user.id, user.email, user.role);

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
          message: "An error occurred during login",
          user: null,
          token: null,
        };
      }
    },

    deleteUser: async (
      _: unknown,
      { id }: { id: string },
      context: { user: any }
    ) => {
      if (!context.user || context.user.id !== id) {
        return false;
      }

      try {
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (error) {
        console.error("Error deleting user:", error);
        return false;
      }
    },
  },
};
