import { Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/auth.js";

export function createSocketAuthMiddleware(prisma: PrismaClient) {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const payload = verifyToken(token);
      if (!payload || !payload.userId) {
        return next(new Error("Authentication error: Invalid token"));
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, email: true, role: true },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  };
}
