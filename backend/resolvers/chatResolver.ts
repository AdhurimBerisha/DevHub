import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const chatResolver = {
  Query: {
    conversations: async (_: unknown, __: unknown, context: { user: any }) => {
      if (!context.user) throw new Error("Unauthorized");

      const conversations = await (prisma as any).conversation.findMany({
        where: {
          participants: {
            some: {
              userId: context.user.id,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return conversations;
    },

    conversation: async (
      _: unknown,
      { id }: { id: string },
      context: { user: any }
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      const conversation = await (prisma as any).conversation.findFirst({
        where: {
          id,
          participants: {
            some: {
              userId: context.user.id,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      return conversation;
    },

    messages: async (
      _: unknown,
      {
        conversationId,
        limit = 50,
        offset = 0,
      }: { conversationId: string; limit?: number; offset?: number },
      context: { user: any }
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      const participant = await (
        prisma as any
      ).conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: context.user.id,
        },
      });

      if (!participant) {
        throw new Error("Unauthorized: You are not part of this conversation");
      }

      const messages = await (prisma as any).message.findMany({
        where: {
          conversationId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: limit,
        skip: offset,
      });

      return messages;
    },
  },

  Conversation: {
    lastMessage: async (conversation: any) => {
      const lastMessage = await (prisma as any).message.findFirst({
        where: {
          conversationId: conversation.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return lastMessage;
    },

    unreadCount: async (
      conversation: any,
      _: unknown,
      context: { user: any }
    ) => {
      if (!context.user) return 0;

      const unreadCount = await (prisma as any).message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: context.user.id },
          readAt: null,
        },
      });

      return unreadCount;
    },
  },

  Mutation: {
    markMessagesAsRead: async (
      _: unknown,
      { conversationId }: { conversationId: string },
      context: { user: any }
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      const participant = await (
        prisma as any
      ).conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: context.user.id,
        },
      });

      if (!participant) {
        throw new Error("Unauthorized: You are not part of this conversation");
      }

      await (prisma as any).message.updateMany({
        where: {
          conversationId,
          senderId: { not: context.user.id },
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      return true;
    },
  },
};
