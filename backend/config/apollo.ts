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

export function createApolloServer(prisma: PrismaClient) {
  return new ApolloServer({
    typeDefs: [
      userTypeDefs,
      postsTypeDefs,
      communitiesTypeDefs,
      adminTypeDefs,
      chatTypeDefs,
    ],
    resolvers: {
      Query: {
        ...userResolver.Query,
        ...postsResolver.Query,
        ...communitiesResolver.Query,
        ...adminResolver.Query,
        ...friendResolver.Query,
        ...chatResolver.Query,
      },
      Mutation: {
        ...userResolver.Mutation,
        ...postsResolver.Mutation,
        ...communitiesResolver.Mutation,
        ...adminResolver.Mutation,
        ...friendResolver.Mutation,
        ...chatResolver.Mutation,
      },
      Conversation: {
        ...chatResolver.Conversation,
      },
      Post: {
        community: async (post: any) => {
          if (!post.communityId) {
            console.log("Post has no communityId:", post.id);
            return null;
          }
          try {
            const community = await prisma.community.findUnique({
              where: { id: post.communityId },
              select: { id: true, name: true, slug: true },
            });
            return community;
          } catch (error) {
            console.error("Error fetching community for post:", error);
            return null;
          }
        },
      },
    },
  });
}
