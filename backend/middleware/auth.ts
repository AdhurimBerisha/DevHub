import type { RequestHandler } from "express";
import { verifyToken } from "../utils/auth.js";
import type { PrismaClient } from "@prisma/client";

export function createAuthMiddleware(prisma: PrismaClient): RequestHandler {
  return async (req: any, _res, next) => {
    try {
      const authHeader =
        req.headers?.authorization || req.headers?.Authorization;
      if (
        authHeader &&
        typeof authHeader === "string" &&
        authHeader.startsWith("Bearer ")
      ) {
        const token = authHeader.split(" ")[1];
        const payload = verifyToken(token);
        if (payload && (payload as any).userId) {
          const user = await prisma.user.findUnique({
            where: { id: (payload as any).userId },
          });
          if (user) {
            req.user = {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role,
            };
          }
        }
      }
    } catch (err) {
      console.error("Auth middleware error:", err);
      console.log("Auth header:", req.headers.authorization);
      console.log("User after verify:", req.user);
    }
    next();
  };
}
