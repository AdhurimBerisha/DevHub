import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const notificationsResolver = {
  Query: {
    notifications: async (
      _: unknown,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");

      try {
        const notifications = await prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          include: {
            triggeredBy: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
            post: {
              select: {
                id: true,
                title: true,
                authorId: true,
              },
            },
            comment: {
              select: {
                id: true,
                content: true,
                post: {
                  select: {
                    id: true,
                  },
                },
                authorId: true,
              },
            },
          },
        });

        return notifications;
      } catch (error: any) {
        console.error("Error fetching notifications:", error);
        
        // Check if it's a table doesn't exist error
        if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
          console.warn("Notifications table does not exist. Please run database migration.");
          return []; // Return empty array instead of throwing error
        }
        
        throw new Error("Failed to fetch notifications");
      }
    },

    unreadNotificationCount: async (
      _: unknown,
      __: unknown,
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");

      try {
        const count = await prisma.notification.count({
          where: {
            userId: user.id,
            read: false,
          },
        });

        return count;
      } catch (error: any) {
        console.error("Error counting unread notifications:", error);
        
        // Check if it's a table doesn't exist error
        if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
          console.warn("Notifications table does not exist. Please run database migration.");
          return 0; // Return 0 instead of throwing error
        }
        
        throw new Error("Failed to count unread notifications");
      }
    },
  },

  Mutation: {
    markNotificationRead: async (
      _: unknown,
      { id }: { id: string },
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");

      try {
        const notification = await prisma.notification.findUnique({
          where: { id },
        });

        if (!notification) {
          throw new Error("Notification not found");
        }

        if (notification.userId !== user.id) {
          throw new Error("Not authorized to mark this notification as read");
        }

        await prisma.notification.update({
          where: { id },
          data: { read: true },
        });

        return true;
      } catch (error) {
        console.error("Error marking notification as read:", error);
        throw new Error("Failed to mark notification as read");
      }
    },

    markAllNotificationsRead: async (
      _: unknown,
      __: unknown,
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");

      try {
        await prisma.notification.updateMany({
          where: {
            userId: user.id,
            read: false,
          },
          data: {
            read: true,
          },
        });

        return true;
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw new Error("Failed to mark all notifications as read");
      }
    },
  },
};

