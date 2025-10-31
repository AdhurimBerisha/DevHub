import "dotenv/config";
import express from "express";
import { expressMiddleware } from "@as-integrations/express4";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";

import { createApolloServer } from "./config/apollo.js";
import { prisma, connectDB } from "./config/database.js";
import { createSocketAuthMiddleware } from "./socket/auth.js";
import { setupSocketHandlers } from "./socket/handlers.js";
import { createAuthMiddleware } from "./middleware/auth.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4001;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:8080"];

const corsOptions = cors<cors.CorsRequest>({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.some(
        (allowed) => origin === allowed || origin.startsWith(allowed)
      )
    ) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== "production") {
      const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});

const socketCorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, success?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.some(
        (allowed) => origin === allowed || origin.startsWith(allowed)
      )
    ) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== "production") {
      const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  credentials: true,
};

const io = new SocketIOServer(httpServer, {
  cors: socketCorsOptions,
});

const server = createApolloServer(prisma);

io.use(createSocketAuthMiddleware(prisma));

setupSocketHandlers(io, prisma);

const startServer = async () => {
  await connectDB();
  await server.start();

  app.use(createAuthMiddleware(prisma));

  app.use(
    "/graphql",
    corsOptions,
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
  console.log(`💬 Socket.IO server ready on port ${PORT}`);
};

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

const shutdown = async () => {
  console.log("🛑 Shutting down gracefully...");
  await server.stop();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
