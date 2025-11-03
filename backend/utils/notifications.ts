import { PrismaClient, NotificationType } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";

/**
 * Creates or updates a vote notification for a post or comment
 * Returns the notification if created/updated, null otherwise
 */
export async function createOrUpdateVoteNotification({
  userId,
  postId,
  commentId,
  triggeredById,
  type,
  prisma,
  io,
}: {
  userId: string;
  postId: string | null;
  commentId: string | null;
  triggeredById: string;
  type: NotificationType;
  prisma: PrismaClient;
  io?: SocketIOServer;
}): Promise<any> {
  // Don't notify if user votes on their own content
  if (userId === triggeredById) {
    return null;
  }

  try {
    // Check if notification already exists
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        postId: postId || null,
        commentId: commentId || null,
        triggeredById,
        type,
      },
    });

    let notification;
    if (existing) {
      // Update to mark as unread and refresh timestamp
      notification = await prisma.notification.update({
        where: { id: existing.id },
        data: { read: false, createdAt: new Date() },
        include: {
          triggeredBy: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
    } else {
      // Create new notification
      notification = await prisma.notification.create({
        data: {
          userId,
          postId: postId || null,
          commentId: commentId || null,
          triggeredById,
          type,
        },
        include: {
          triggeredBy: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
    }

    // Emit real-time notification via Socket.IO
    if (io) {
      io.to(`user:${userId}`).emit("new_notification", {
        id: notification.id,
        type: notification.type,
        read: notification.read,
        postId: notification.postId,
        commentId: notification.commentId,
        triggeredBy: notification.triggeredBy,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error("Error creating/updating notification:", error);
    return null;
  }
}

/**
 * Deletes vote notifications for a specific vote
 */
export async function deleteVoteNotification({
  userId,
  postId,
  commentId,
  triggeredById,
  prisma,
}: {
  userId: string;
  postId: string | null;
  commentId: string | null;
  triggeredById: string;
  prisma: PrismaClient;
}): Promise<void> {
  try {
    await prisma.notification.deleteMany({
      where: {
        userId,
        postId: postId || null,
        commentId: commentId || null,
        triggeredById,
        type: {
          in: [
            NotificationType.POST_UPVOTE,
            NotificationType.POST_DOWNVOTE,
            NotificationType.COMMENT_UPVOTE,
            NotificationType.COMMENT_DOWNVOTE,
          ],
        },
      },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}

