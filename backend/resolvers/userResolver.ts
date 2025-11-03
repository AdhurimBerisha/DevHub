import { PrismaClient } from "@prisma/client";
import { generateToken, hashPassword, comparePassword } from "../utils/auth";
import { verifyGoogleToken } from "../utils/googleAuth";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  normalizeEmail,
} from "../utils/validator";
import emailService from "../utils/email.js";
import crypto from "crypto";

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
          avatar: true,
          emailVerified: true,
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

      return allUsers
        .filter((u) => u.id !== context.user.id)
        .map((u) => {
          const friendship = friendships.find(
            (f) =>
              (f.requesterId === context.user.id && f.receiverId === u.id) ||
              (f.receiverId === context.user.id && f.requesterId === u.id)
          );

          return {
            ...u,
            isFriend: Boolean(friendship),
            friendshipId: friendship?.id || null,
          };
        });
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
            avatar: true,
            emailVerified: true,
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
            avatar: true,
            emailVerified: true,
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

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);

        const user = await prisma.user.create({
          data: {
            email,
            username: input.username.trim(),
            password: hashedPassword,
            role: roleValue,
            emailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: tokenExpires,
            authProvider: "email",
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        try {
          await emailService.sendVerificationEmail(
            user.email,
            verificationToken,
            user.username
          );
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
        }

        const token = generateToken(user.id, user.email, user.role);

        return {
          success: true,
          message:
            "User created successfully. Please check your email to verify your account.",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            emailVerified: user.emailVerified,
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
          avatar?: string;
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
        if (input.avatar) updateData.avatar = input.avatar;

        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            gender: true,
            avatar: true,
            emailVerified: true,
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
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            role: true,
            emailVerified: true,
            authProvider: true,
            createdAt: true,
            updatedAt: true,
          },
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

        if (!user.emailVerified && user.authProvider === "email") {
          return {
            success: false,
            message:
              "Please verify your email before logging in. Check your inbox for the verification link.",
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
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
            emailVerified: user.emailVerified,
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

    loginWithGoogle: async (_: unknown, { token }: { token: string }) => {
      try {
        const googleUser = await verifyGoogleToken(token);

        if (!googleUser) {
          return {
            success: false,
            message: "Invalid Google token",
            user: null,
            token: null,
          };
        }

        if (!googleUser.email_verified) {
          return {
            success: false,
            message: "Google email not verified",
            user: null,
            token: null,
          };
        }

        const email = normalizeEmail(googleUser.email);

        let user = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { googleId: googleUser.sub }],
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            googleId: true,
            authProvider: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            password: true,
          },
        });

        if (user) {
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: googleUser.sub,
                authProvider: "google",
                avatar: user.avatar || googleUser.picture,
                emailVerified: true,
              },
              select: {
                id: true,
                email: true,
                username: true,
                role: true,
                googleId: true,
                authProvider: true,
                avatar: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                password: true,
              },
            });
          } else {
            if (!user.avatar && googleUser.picture) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  avatar: googleUser.picture,
                  emailVerified: true,
                },
                select: {
                  id: true,
                  email: true,
                  username: true,
                  role: true,
                  googleId: true,
                  authProvider: true,
                  avatar: true,
                  emailVerified: true,
                  createdAt: true,
                  updatedAt: true,
                  password: true,
                },
              });
            }
          }
        } else {
          const baseUsername =
            googleUser.given_name?.toLowerCase().replace(/\s/g, "") ||
            email.split("@")[0] ||
            `user${Date.now()}`;

          let username = baseUsername;
          let counter = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email,
              username,
              googleId: googleUser.sub,
              authProvider: "google",
              avatar: googleUser.picture,
              password: "",
              emailVerified: true,
            },
          });
        }

        if (!user) {
          return {
            success: false,
            message: "Failed to create or retrieve user",
            user: null,
            token: null,
          };
        }

        const jwtToken = generateToken(user.id, user.email, user.role);

        return {
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            emailVerified: user.emailVerified || true,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token: jwtToken,
        };
      } catch (error: any) {
        console.error("Error during Google login:", error);
        return {
          success: false,
          message: error.message || "An error occurred during Google login",
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

    verifyEmail: async (
      _: unknown,
      { token }: { token: string },
      context: { user?: any }
    ) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            emailVerificationToken: token,
            emailVerificationTokenExpires: {
              gt: new Date(),
            },
          },
        });

        if (!user) {
          return {
            success: false,
            message: "Invalid or expired verification token",
            user: null,
            token: null,
          };
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationTokenExpires: null,
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const jwtToken = generateToken(
          updatedUser.id,
          updatedUser.email,
          updatedUser.role
        );

        return {
          success: true,
          message: "Email verified successfully",
          user: updatedUser,
          token: jwtToken,
        };
      } catch (error: any) {
        console.error("Error verifying email:", error);
        return {
          success: false,
          message: error.message || "Failed to verify email",
          user: null,
          token: null,
        };
      }
    },

    resendVerificationEmail: async (
      _: unknown,
      __: unknown,
      context: { user: any }
    ) => {
      if (!context.user) {
        return {
          success: false,
          message: "Authentication required",
          user: null,
          token: null,
        };
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: context.user.id },
        });

        if (!user) {
          return {
            success: false,
            message: "User not found",
            user: null,
            token: null,
          };
        }

        if (user.emailVerified) {
          return {
            success: false,
            message: "Email is already verified",
            user: null,
            token: null,
          };
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: tokenExpires,
          },
        });

        await emailService.sendVerificationEmail(
          user.email,
          verificationToken,
          user.username
        );

        return {
          success: true,
          message: "Verification email sent successfully",
          user: null,
          token: null,
        };
      } catch (error: any) {
        console.error("Error resending verification email:", error);
        return {
          success: false,
          message: error.message || "Failed to resend verification email",
          user: null,
          token: null,
        };
      }
    },
  },
};
