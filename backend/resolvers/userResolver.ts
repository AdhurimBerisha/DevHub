import { PrismaClient } from "@prisma/client";
import { generateToken, hashPassword, comparePassword } from "../utils/auth.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  normalizeEmail,
} from "../utils/validator.js";
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
            pendingEmail: true,
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
      },
      context: { res: any }
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

        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });

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
          token: null,
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

          const normalizedNewEmail = normalizeEmail(input.email);

          const currentUser = await prisma.user.findUnique({
            where: { id },
            select: { email: true, username: true },
          });

          if (!currentUser) throw new Error("User not found");

          if (normalizedNewEmail !== currentUser.email) {
            const emailExists = await prisma.user.findUnique({
              where: { email: normalizedNewEmail },
              select: { id: true },
            });

            if (emailExists) {
              throw new Error("Email is already in use");
            }

            const emailChangeToken = crypto.randomBytes(32).toString("hex");
            const tokenExpires = new Date();
            tokenExpires.setHours(tokenExpires.getHours() + 24);

            updateData.pendingEmail = normalizedNewEmail;
            updateData.emailChangeToken = emailChangeToken;
            updateData.emailChangeTokenExpires = tokenExpires;

            try {
              await emailService.sendEmailChangeVerificationEmail(
                normalizedNewEmail,
                emailChangeToken,
                currentUser.username,
                currentUser.email
              );
            } catch (emailError) {
              console.error(
                "Failed to send email change verification email:",
                emailError
              );
            }

            try {
              await emailService.sendEmailChangeNotificationEmail(
                currentUser.email,
                currentUser.username,
                normalizedNewEmail
              );
            } catch (emailError) {
              console.error(
                "Failed to send email change notification:",
                emailError
              );
            }
          }
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
            pendingEmail: true,
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
      { input }: { input: { email: string; password: string } },
      context: { user: any; res: any }
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

        context.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });

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
          token: null,
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

    loginWithGoogle: async (
      _: unknown,
      { token }: { token: string },
      context: { res: any }
    ) => {
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

        context.res.cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });

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
          token: null,
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
      context: { user?: any; res: any }
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

        context.res.cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });

        return {
          success: true,
          message: "Email verified successfully",
          user: updatedUser,
          token: null,
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

    forgotPassword: async (
      _: unknown,
      { email }: { email: string },
      context: { user?: any }
    ) => {
      try {
        const normalizedEmail = normalizeEmail(email);

        if (!validateEmail(normalizedEmail)) {
          return {
            success: false,
            message: "Invalid email address",
            user: null,
            token: null,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            username: true,
            authProvider: true,
          },
        });

        if (!user || user.authProvider !== "email") {
          return {
            success: true,
            message:
              "If an account with that email exists, a password reset link has been sent.",
            user: null,
            token: null,
          };
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 1);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordResetToken: resetToken,
            passwordResetTokenExpires: tokenExpires,
          },
        });

        try {
          await emailService.sendPasswordResetEmail(
            user.email,
            resetToken,
            user.username
          );
        } catch (emailError) {
          console.error("Failed to send password reset email:", emailError);
        }

        return {
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent.",
          user: null,
          token: null,
        };
      } catch (error: any) {
        console.error("Error in forgotPassword:", error);
        return {
          success: false,
          message: "Failed to process password reset request",
          user: null,
          token: null,
        };
      }
    },

    resetPassword: async (
      _: unknown,
      { token, password }: { token: string; password: string },
      context: { user?: any; res: any }
    ) => {
      try {
        if (!validatePassword(password)) {
          return {
            success: false,
            message: "Password must be at least 8 characters long",
            user: null,
            token: null,
          };
        }

        const user = await prisma.user.findFirst({
          where: {
            passwordResetToken: token,
            passwordResetTokenExpires: {
              gt: new Date(),
            },
          },
        });

        if (!user) {
          return {
            success: false,
            message: "Invalid or expired password reset token",
            user: null,
            token: null,
          };
        }

        const hashedPassword = await hashPassword(password);

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetTokenExpires: null,
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

        context.res.cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });

        return {
          success: true,
          message: "Password reset successfully",
          user: updatedUser,
          token: null,
        };
      } catch (error: any) {
        console.error("Error resetting password:", error);
        return {
          success: false,
          message: error.message || "Failed to reset password",
          user: null,
          token: null,
        };
      }
    },

    verifyEmailChange: async (
      _: unknown,
      { token }: { token: string },
      context: { user?: any; res: any }
    ) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            emailChangeToken: token,
            emailChangeTokenExpires: {
              gt: new Date(),
            },
          },
        });

        if (!user || !user.pendingEmail) {
          return {
            success: false,
            message: "Invalid or expired email change token",
            user: null,
            token: null,
          };
        }

        const emailExists = await prisma.user.findUnique({
          where: { email: user.pendingEmail },
          select: { id: true },
        });

        if (emailExists) {
          return {
            success: false,
            message: "Email is already in use",
            user: null,
            token: null,
          };
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: user.pendingEmail,
            pendingEmail: null,
            emailChangeToken: null,
            emailChangeTokenExpires: null,
            emailVerified: true,
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            emailVerified: true,
            pendingEmail: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const jwtToken = generateToken(
          updatedUser.id,
          updatedUser.email,
          updatedUser.role
        );

        context.res.cookie("token", jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });

        return {
          success: true,
          message: "Email changed successfully",
          user: updatedUser,
          token: null,
        };
      } catch (error: any) {
        console.error("Error verifying email change:", error);
        return {
          success: false,
          message: error.message || "Failed to verify email change",
          user: null,
          token: null,
        };
      }
    },

    cancelEmailChange: async (
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
        const updatedUser = await prisma.user.update({
          where: { id: context.user.id },
          data: {
            pendingEmail: null,
            emailChangeToken: null,
            emailChangeTokenExpires: null,
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            emailVerified: true,
            pendingEmail: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          message: "Email change cancelled successfully",
          user: updatedUser,
          token: null,
        };
      } catch (error: any) {
        console.error("Error cancelling email change:", error);
        return {
          success: false,
          message: error.message || "Failed to cancel email change",
          user: null,
          token: null,
        };
      }
    },

    logout: async (_: unknown, __: unknown, context: { res: any }) => {
      context.res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return {
        success: true,
        message: "Logged out successfully",
      };
    },
  },
};
