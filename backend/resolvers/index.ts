import { PrismaClient } from "@prisma/client";
import { generateToken, hashPassword, comparePassword } from "../utils/auth";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  normalizeEmail,
} from "../utils/validator";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL!",

    users: async () => {
      try {
        return prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
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
            createdAt: true,
            updatedAt: true,
          },
        });
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
          password?: string;
          role?: string;
        };
      }
    ) => {
      try {
        if (input.email) {
          const emailValidation = validateEmail(input.email);
          if (!emailValidation.isValid) {
            throw new Error(emailValidation.message);
          }
        }

        if (input.username) {
          const usernameValidation = validateUsername(input.username);
          if (!usernameValidation.isValid) {
            throw new Error(usernameValidation.message);
          }
        }

        if (input.password) {
          const passwordValidation = validatePassword(input.password);
          if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
          }
        }

        const updateData: any = {};

        if (input.email) {
          updateData.email = normalizeEmail(input.email);
        }

        if (input.username) {
          updateData.username = input.username.trim();
        }

        if (input.password) {
          updateData.password = await hashPassword(input.password);
        }

        if (input.role) {
          updateData.role = input.role as "USER" | "ADMIN";
        }

        const user = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
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
  },
};
