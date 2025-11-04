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
import uploadRouter from "./routes/upload.js";
import emailService from "./utils/email.js";

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 4001;

// Allow your frontend origins
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:5173",
      "http://localhost:8080",
      "https://dev-hub-sandy.vercel.app",
    ];

const corsOptions = cors<cors.CorsRequest>({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Remove trailing slashes for comparison
    const normalizedOrigin = origin.replace(/\/$/, "");

    if (
      allowedOrigins.some((allowed) => {
        const normalizedAllowed = allowed.replace(/\/$/, "");
        return (
          normalizedOrigin === normalizedAllowed ||
          normalizedOrigin.startsWith(normalizedAllowed)
        );
      })
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
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200,
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

const server = createApolloServer(prisma, io);

io.use(createSocketAuthMiddleware(prisma));
setupSocketHandlers(io, prisma);

const startServer = async () => {
  await connectDB();

  // Prevent email timeout from breaking deployment
  try {
    await emailService.testConnection();
    console.log("✅ Email service connected successfully");
  } catch (error: any) {
    console.error("⚠️ Email service connection failed:", error.message);
  }

  await server.start();

  // Apply CORS globally to handle preflight requests
  app.use(corsOptions);

  app.use(express.json());
  app.use(createAuthMiddleware(prisma));

  app.use("/api/upload", uploadRouter);

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }: { req: any }) => ({
        prisma,
        user: req.user || null,
        io,
      }),
    })
  );

  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // ✅ Important fix for Render
  await new Promise<void>((resolve) =>
    httpServer.listen(PORT, "0.0.0.0", resolve)
  );

  console.log(`🚀 Server ready at http://0.0.0.0:${PORT}/graphql`);
  console.log(`💬 Socket.IO server running on port ${PORT}`);
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
