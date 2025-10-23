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
import { createAuthMiddleware } from "./middleware/auth.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4001;

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

const server = new ApolloServer({
  typeDefs: [userTypeDefs, postsTypeDefs],
  resolvers: [userResolver, postsResolver],
});

const startServer = async () => {
  await connectDB();
  await server.start();

  app.use(createAuthMiddleware(prisma));

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
