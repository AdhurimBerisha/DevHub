import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

export function setupSocketHandlers(io: SocketIOServer, prisma: PrismaClient) {
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log(`✅ User ${user.username} (${user.id}) connected`);

    socket.join(`user:${user.id}`);

    socket.on("get_or_create_conversation", async (otherUserId: string) => {
      try {
        if (user.id === otherUserId) {
          socket.emit("error", "Cannot create conversation with yourself");
          return;
        }

        const existingParticipants =
          await prisma.conversationParticipant.findMany({
            where: {
              OR: [{ userId: user.id }, { userId: otherUserId }],
            },
            include: {
              conversation: {
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
              },
            },
          });

        let conversation = existingParticipants
          .map((p) => p.conversation)
          .find(
            (conv) =>
              !conv.isGroup &&
              conv.participants.length === 2 &&
              conv.participants.some((p) => p.userId === user.id) &&
              conv.participants.some((p) => p.userId === otherUserId)
          );

        if (!conversation) {
          const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, username: true },
          });

          if (!otherUser) {
            socket.emit("error", "User not found");
            return;
          }

          conversation = await prisma.conversation.create({
            data: {
              isGroup: false,
              participants: {
                create: [{ userId: user.id }, { userId: otherUserId }],
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
          });
        }

        socket.join(`conversation:${conversation.id}`);

        const otherParticipant = conversation.participants.find(
          (p) => p.userId !== user.id
        );

        let otherUserInfo = otherParticipant?.user;
        if (!otherUserInfo) {
          const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, username: true, email: true },
          });
          otherUserInfo = otherUser || undefined;
        }

        if (!otherUserInfo) {
          console.error(`Could not find other user with id: ${otherUserId}`);
          socket.emit("error", "Other user not found");
          return;
        }

        socket.emit("conversation_ready", {
          conversationId: conversation.id,
          otherUser: otherUserInfo,
        });

        console.log(
          `Conversation ${conversation.id} ready for ${user.username} and ${otherUserInfo.username}`
        );
      } catch (error) {
        console.error("Error getting/creating conversation:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message, error.stack);
        }
        socket.emit("error", "Failed to get or create conversation");
      }
    });

    socket.on("join_conversation", async (conversationId: string) => {
      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId,
            userId: user.id,
          },
        });

        if (participant) {
          socket.join(`conversation:${conversationId}`);
          socket.emit("joined_conversation", conversationId);
          console.log(
            `User ${user.username} joined conversation ${conversationId}`
          );
        } else {
          socket.emit("error", "You are not part of this conversation");
        }
      } catch (error) {
        console.error("Error joining conversation:", error);
        socket.emit("error", "Failed to join conversation");
      }
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      socket.emit("left_conversation", conversationId);
    });

    socket.on(
      "send_message",
      async (data: {
        conversationId: string;
        content: string;
        receiverId?: string;
      }) => {
        try {
          const { conversationId, content, receiverId } = data;

          const participant = await prisma.conversationParticipant.findFirst({
            where: {
              conversationId,
              userId: user.id,
            },
          });

          if (!participant) {
            socket.emit("error", "You are not part of this conversation");
            return;
          }

          const message = await prisma.message.create({
            data: {
              content,
              senderId: user.id,
              conversationId,
              receiverId: receiverId || null,
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
          });

          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });

          io.to(`conversation:${conversationId}`).emit("new_message", message);

          if (receiverId) {
            io.to(`user:${receiverId}`).emit("new_direct_message", message);
          }

          console.log(
            `Message sent in conversation ${conversationId} by ${user.username}`
          );
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on(
      "typing",
      (data: { conversationId: string; isTyping: boolean }) => {
        socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
          userId: user.id,
          username: user.username,
          isTyping: data.isTyping,
        });
      }
    );

    socket.on("mark_notification_read", async (notificationId: string) => {
      try {
        const notification = await prisma.notification.findUnique({
          where: { id: notificationId },
        });

        if (notification && notification.userId === user.id) {
          await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
          });
          socket.emit("notification_read", notificationId);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        socket.emit("error", "Failed to mark notification as read");
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User ${user.username} (${user.id}) disconnected`);
    });
  });
}
