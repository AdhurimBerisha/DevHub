import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const friendResolver = {
  Query: {
    friends: async (_: unknown, { userId }: { userId: string }) => {
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, status: "ACCEPTED" },
            { receiverId: userId, status: "ACCEPTED" },
          ],
        },
        include: {
          requester: true,
          receiver: true,
        },
      });

      return friendships.map((f) =>
        f.requesterId === userId ? f.receiver : f.requester
      );
    },

    friendRequests: async (_: unknown, __: unknown, context: { user: any }) => {
      if (!context.user) throw new Error("Unauthorized");

      return prisma.friendship.findMany({
        where: { receiverId: context.user.id, status: "PENDING" },
        include: { requester: true, receiver: true },
      });
    },
  },

  Mutation: {
    sendFriendRequest: async (
      _: unknown,
      { receiverId }: { receiverId: string },
      context: { user: any }
    ) => {
      if (!context.user) throw new Error("Unauthorized");
      if (context.user.id === receiverId)
        throw new Error("Cannot send friend request to yourself");

      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: context.user.id, receiverId },
            { requesterId: receiverId, receiverId: context.user.id },
          ],
        },
      });

      if (existing)
        return {
          success: false,
          message: "Friend request already exists",
          friendship: existing,
        };

      const friendship = await prisma.friendship.create({
        data: {
          requesterId: context.user.id,
          receiverId,
        },
        include: { requester: true, receiver: true },
      });

      return { success: true, message: "Friend request sent", friendship };
    },

    respondToFriendRequest: async (
      _: unknown,
      {
        friendshipId,
        status,
      }: { friendshipId: string; status: "ACCEPTED" | "REJECTED" },
      context: { user: any }
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      const request = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!request || request.receiverId !== context.user.id)
        throw new Error("Friend request not found");

      const updated = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status },
        include: { requester: true, receiver: true },
      });

      return {
        success: true,
        message: `Friend request ${status.toLowerCase()}`,
        friendship: updated,
      };
    },
  },
};
