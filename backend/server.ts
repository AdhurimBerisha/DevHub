import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { createServer } from "http";

import express from "express";
import cors from "cors";
import { userTypeDefs } from "./schema/userSchema.js";
import { userResolver } from "./resolvers/userResolver.js";
import { postsTypeDefs } from "./schema/postsSchema.js";
import { postsResolver } from "./resolvers/postsResolver.js";
import { verifyToken } from "./utils/auth.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4001;

// Initialize Prisma Client
const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs: [userTypeDefs, postsTypeDefs],
  resolvers: [userResolver, postsResolver],
});

const startServer = async () => {
  await connectDB();
  await server.start();

  // Auth middleware: parse Authorization header and attach user to req
  app.use(async (req: any, _res, next) => {
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
        if (payload && payload.userId) {
          // fetch user from DB to attach full user object
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
          });
          if (user) {
            // attach minimal user info expected by resolvers
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
      // ignore errors and proceed without user
      console.error("Error parsing auth token:", err);
    }
    next();
  });

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }: { req: any }) => ({
        prisma,
        user: req.user || null,
      }),
    })
  );

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(
    `📊 GraphQL Playground available at http://localhost:${PORT}/graphql`
  );
};

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down gracefully...");
  await server.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down gracefully...");
  await server.stop();
  await prisma.$disconnect();
  process.exit(0);
});
