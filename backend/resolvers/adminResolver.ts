import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const adminResolver = {
  Query: {
    adminStats: async (_: unknown, __: unknown, context: { user: any }) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const [totalPosts, totalUsers, totalCommunities] =
        await Promise.all([
          prisma.post.count(),
          prisma.user.count(),
          prisma.community.count(),
        ]);

      return { totalPosts, totalUsers, totalCommunities };
    },

    recentPosts: async (
      _: unknown,
      { limit = 5 }: { limit?: number },
      context: { user: any }
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const posts = await prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return posts;
    },
  },

  Mutation: {},
};
