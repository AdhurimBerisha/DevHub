import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const communitiesResolver = {
  Query: {
    communities: async (
      _: unknown,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      { user }: { user: any }
    ) => {
      try {
        // Use Prisma _count to get member counts efficiently
        const communities = await prisma.community.findMany({
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });

        // If there is a user, fetch membership rows for all returned communities in one query
        let memberSet = new Set<number>();
        if (user) {
          const ids = communities.map((c) => c.id);
          if (ids.length > 0) {
            const memberships = await prisma.communityMember.findMany({
              where: { userId: user.id, communityId: { in: ids } },
              select: { communityId: true },
            });
            memberships.forEach((m) => memberSet.add(m.communityId));
          }
        }

        return communities.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          private: c.private,
          owner: c.owner,
          isMember: user ? memberSet.has(c.id) : false,
          memberCount: (c as any)._count?.members ?? 0,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
      } catch (error) {
        console.error("Error fetching communities:", error);
        throw new Error("Failed to fetch communities");
      }
    },
    community: async (
      _: unknown,
      { id }: { id: string },
      { user }: { user: any }
    ) => {
      try {
        const idNum = Number(id);
        const c = await prisma.community.findUnique({
          where: { id: idNum },
          include: {
            owner: {
              select: { id: true, username: true, email: true },
            },
            _count: { select: { members: true } },
          },
        });

        if (!c) return null;

        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          private: c.private,
          owner: c.owner,
          isMember: user
            ? !!(await prisma.communityMember.findUnique({
                where: {
                  userId_communityId: { userId: user.id, communityId: idNum },
                },
              }))
            : false,
          memberCount: (c as any)._count?.members ?? 0,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      } catch (error) {
        console.error("Error fetching community:", error);
        throw new Error("Failed to fetch community");
      }
    },
  },
  Mutation: {
    joinCommunity: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user }: { user: any }
    ) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      const communityIdNum = Number(communityId);
      try {
        const community = await prisma.community.findUnique({
          where: { id: communityIdNum },
        });

        if (!community) {
          return { success: false, message: "Community not found" };
        }

        // Check existing membership using compound unique
        const existing = await prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId: user.id,
              communityId: communityIdNum,
            },
          },
        });

        if (existing) {
          return { success: false, message: "Already a member" };
        }

        await prisma.communityMember.create({
          data: {
            userId: user.id,
            communityId: communityIdNum,
          },
        });

        return { success: true, message: "Joined community" };
      } catch (error) {
        console.error("Error joining community:", error);
        return { success: false, message: "Failed to join community" };
      }
    },

    leaveCommunity: async (
      _: unknown,
      { communityId }: { communityId: string },
      { user }: { user: any }
    ) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      const communityIdNum = Number(communityId);
      try {
        const deleted = await prisma.communityMember.deleteMany({
          where: { userId: user.id, communityId: communityIdNum },
        });

        if (deleted.count === 0) {
          return { success: false, message: "Not a member" };
        }

        return { success: true, message: "Left community" };
      } catch (error) {
        console.error("Error leaving community:", error);
        return { success: false, message: "Failed to leave community" };
      }
    },
    updateCommunity: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          slug?: string;
          description?: string;
          private?: boolean;
        };
      },
      { user }: { user: any }
    ) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      const idNum = Number(id);
      try {
        const existing = await prisma.community.findUnique({
          where: { id: idNum },
        });
        if (!existing)
          return { success: false, message: "Community not found" };
        if (existing.ownerId !== user.id)
          return { success: false, message: "Not authorized" };

        const updated = await prisma.community.update({
          where: { id: idNum },
          data: {
            name: input.name ?? existing.name,
            slug: input.slug ?? existing.slug,
            description: input.description ?? existing.description,
            private: input.private ?? existing.private,
          },
        });

        return {
          success: true,
          message: "Community updated",
          community: updated,
        } as any;
      } catch (error) {
        console.error("Error updating community:", error);
        return { success: false, message: "Failed to update community" };
      }
    },
  },
};
