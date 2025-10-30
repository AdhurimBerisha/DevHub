import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const adminResolver = {
  Query: {
    adminStats: async (_: unknown, __: unknown, context: { user: any }) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const [totalPosts, totalUsers, totalCommunities, totalPageViewsResult] =
        await Promise.all([
          prisma.post.count(),
          prisma.user.count(),
          prisma.community.count(),
          prisma.post.aggregate({
            _sum: { viewCount: true },
          }),
        ]);

      const totalPageViews = totalPageViewsResult._sum.viewCount ?? 0;

      return { totalPosts, totalUsers, totalCommunities, totalPageViews };
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

  Mutation: {
    createPost: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          title: string;
          content: string;
          published?: boolean;
          featured?: boolean;
          communityId?: number;
        };
      },
      context: { user: any }
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      try {
        const post = await prisma.post.create({
          data: {
            title: input.title,
            content: input.content,
            published: input.published ?? false,
            featured: input.featured ?? false,
            communityId: input.communityId ?? null,
            authorId: context.user.id,
          },
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

        return {
          success: true,
          message: "Post created successfully",
          post,
        };
      } catch (error) {
        console.error("Error creating post:", error);
        return {
          success: false,
          message: "Failed to create post",
          post: null,
        };
      }
    },

    updatePost: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          title?: string;
          content?: string;
          published?: boolean;
          featured?: boolean;
          communityId?: number;
        };
      },
      context: { user: any }
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      try {
        const post = await prisma.post.update({
          where: { id },
          data: input,
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

        return {
          success: true,
          message: "Post updated successfully",
          post,
        };
      } catch (error) {
        console.error("Error updating post:", error);
        return {
          success: false,
          message: "Failed to update post",
          post: null,
        };
      }
    },

    deletePost: async (
      _: unknown,
      { id }: { id: string },
      context: { user: any }
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      try {
        await prisma.post.delete({ where: { id } });
        return true;
      } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error("Failed to delete post");
      }
    },
  },
};
