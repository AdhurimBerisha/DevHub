import { ApolloServer } from "@apollo/server";
import { PrismaClient } from "@prisma/client";
import { userTypeDefs } from "../schema/userSchema.js";
import { userResolver } from "../resolvers/userResolver.js";
import { postsTypeDefs } from "../schema/postsSchema.js";
import { postsResolver } from "../resolvers/postsResolver.js";
import { communitiesTypeDefs } from "../schema/communitiesSchema.js";
import { communitiesResolver } from "../resolvers/communitiesResolver.js";
import { adminTypeDefs } from "../schema/adminSchema.js";
import { adminResolver } from "../resolvers/adminResolver.js";
import { friendResolver } from "../resolvers/friendsResolver.js";
import { chatTypeDefs } from "../schema/chatSchema.js";
import { chatResolver } from "../resolvers/chatResolver.js";
import { notificationsTypeDefs } from "../schema/notificationsSchema.js";
import { notificationsResolver } from "../resolvers/notificationsResolver.js";

import { Server as SocketIOServer } from "socket.io";

export function createApolloServer(prisma: PrismaClient, io?: SocketIOServer) {
  return new ApolloServer({
    typeDefs: [
      userTypeDefs,
      postsTypeDefs,
      communitiesTypeDefs,
      adminTypeDefs,
      chatTypeDefs,
      notificationsTypeDefs,
    ],
    resolvers: {
      Query: {
        ...userResolver.Query,
        ...postsResolver.Query,
        ...communitiesResolver.Query,
        ...adminResolver.Query,
        ...friendResolver.Query,
        ...chatResolver.Query,
        ...notificationsResolver.Query,
      },
      Mutation: {
        ...userResolver.Mutation,
        ...postsResolver.Mutation,
        ...communitiesResolver.Mutation,
        ...adminResolver.Mutation,
        ...friendResolver.Mutation,
        ...chatResolver.Mutation,
        ...notificationsResolver.Mutation,
      },
      Conversation: {
        ...chatResolver.Conversation,
      },
      Post: {
        ...postsResolver.Post,
        community: async (post: any) => {
          if (!post.communityId) {
            console.log("Post has no communityId:", post.id);
            return null;
          }
          try {
            const community = await prisma.community.findUnique({
              where: { id: post.communityId },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
              },
            });
            if (!community) return null;
            let memberCount = 0;
            try {
              memberCount = await prisma.communityMember.count({
                where: { communityId: post.communityId },
              });
            } catch (err) {
              console.error("Error counting community members:", err);
              memberCount = 0;
            }
            return {
              id: community.id,
              name: community.name,
              slug: community.slug,
              description: community.description,
              memberCount: memberCount || 0,
            };
          } catch (error) {
            console.error("Error fetching community for post:", error);
            return null;
          }
        },
      },
    },
  });
}
