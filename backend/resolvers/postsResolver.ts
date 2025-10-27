import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const postsResolver = {
  Query: {
    posts: async (
      _: unknown,
      {
        limit = 10,
        offset = 0,
        published = true,
        communityId,
      }: {
        limit?: number;
        offset?: number;
        published?: boolean;
        communityId?: string | number;
      }
    ) => {
      try {
        const where: any = {};
        if (published !== undefined) where.published = published;
        if (communityId !== undefined && communityId !== null)
          where.communityId = Number(communityId);

        const posts = await prisma.post.findMany({
          where,
          include: {
            author: { select: { id: true, username: true, email: true } },
            tags: { include: { tag: true } },
            comments: {
              include: {
                author: { select: { id: true, username: true } },
                votes: {
                  include: { user: { select: { id: true, username: true } } },
                },
              },
            },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });

        return posts.map((p) => ({
          ...p,
          tags: (p.tags as any[]).map((pt) => pt.tag),
          likes: p.votes.filter((v: any) => v.value === 1),
          dislikes: p.votes.filter((v: any) => v.value === -1),
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error("Failed to fetch posts");
      }
    },

    post: async (_: unknown, { id }: { id: string }) => {
      try {
        const post = await prisma.post.findUnique({
          where: { id },
          include: {
            author: { select: { id: true, username: true, email: true } },
            tags: { include: { tag: true } },
            comments: {
              include: {
                author: { select: { id: true, username: true } },
                votes: {
                  include: { user: { select: { id: true, username: true } } },
                },
              },
            },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
          },
        });

        if (!post) return null;

        return {
          ...post,
          tags: (post.tags as any[]).map((pt) => pt.tag),
          likes: post.votes.filter((v: any) => v.value === 1),
          dislikes: post.votes.filter((v: any) => v.value === -1),
        };
      } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to fetch post");
      }
    },

    tags: async () => {
      try {
        return await prisma.tag.findMany({ orderBy: { name: "asc" } });
      } catch (error) {
        console.error("Error fetching tags:", error);
        throw new Error("Failed to fetch tags");
      }
    },

    popularTags: async () => {
      try {
        const tags = await prisma.tag.findMany({ include: { posts: true } });
        const sorted = tags
          .map((tag) => ({ ...tag, postCount: tag.posts.length }))
          .sort((a, b) => b.postCount - a.postCount)
          .slice(0, 10);
        return sorted;
      } catch (error) {
        console.error("Error fetching popular tags:", error);
        throw new Error("Failed to fetch popular tags");
      }
    },

    tag: async (_: unknown, { id }: { id: string }) => {
      try {
        const tag = await prisma.tag.findUnique({
          where: { id },
          include: {
            posts: {
              include: {
                post: {
                  include: { author: { select: { id: true, username: true } } },
                },
              },
            },
          },
        });

        if (!tag) return null;
        return { ...tag, posts: (tag.posts as any[]).map((pt) => pt.post) };
      } catch (error) {
        console.error("Error fetching tag:", error);
        throw new Error("Failed to fetch tag");
      }
    },

    comments: async (_: unknown, { postId }: { postId: string }) => {
      try {
        const comments = await prisma.comment.findMany({
          where: { postId },
          include: {
            author: { select: { id: true, username: true } },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return comments.map((c) => ({
          ...c,
          votes: c.votes,
          likes: c.votes.filter((v: any) => v.value === 1),
          dislikes: c.votes.filter((v: any) => v.value === -1),
          voteCount: c.votes.reduce((sum: number, v: any) => sum + v.value, 0),
        }));
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw new Error("Failed to fetch comments");
      }
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
          tagIds?: string[];
          published?: boolean;
          communityId?: string | number;
        };
      },
      { user }: { user: any }
    ) => {
      if (!user)
        return {
          success: false,
          message: "Authentication required",
          post: null,
        };

      try {
        const post = await prisma.post.create({
          data: {
            title: input.title,
            content: input.content,
            authorId: user.id,
            published: input.published || false,
            communityId: input.communityId
              ? Number(input.communityId)
              : undefined,
            tags: input.tagIds
              ? {
                  create: input.tagIds.map((tagId) => ({
                    tag: { connect: { id: tagId } },
                  })),
                }
              : undefined,
          },
          include: {
            author: { select: { id: true, username: true, email: true } },
            tags: { include: { tag: true } },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
            comments: {
              include: {
                author: { select: { id: true, username: true } },
                votes: {
                  include: { user: { select: { id: true, username: true } } },
                },
              },
            },
          },
        });

        const mappedPost = {
          ...post,
          tags: (post.tags as any[]).map((pt) => pt.tag),
          likes: post.votes.filter((v: any) => v.value === 1),
          dislikes: post.votes.filter((v: any) => v.value === -1),
          voteCount: post.votes.reduce(
            (sum: number, v: any) => sum + v.value,
            0
          ),
        };

        return {
          success: true,
          message: "Post created successfully",
          post: mappedPost,
        };
      } catch (error) {
        console.error("Error creating post:", error);
        return { success: false, message: "Failed to create post", post: null };
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
          tagIds?: string[];
          published?: boolean;
          featured?: boolean;
          communityId?: string | number;
        };
      },
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");

      const existingPost = await prisma.post.findUnique({ where: { id } });
      if (!existingPost) throw new Error("Post not found");
      if (existingPost.authorId !== user.id && user.role !== "ADMIN")
        throw new Error("Not authorized to update this post");

      const updateData: any = {};
      if (input.title) updateData.title = input.title;
      if (input.content) updateData.content = input.content;
      if (input.published !== undefined) updateData.published = input.published;
      if (input.featured !== undefined) updateData.featured = input.featured;
      if (input.communityId !== undefined)
        updateData.communityId = input.communityId
          ? Number(input.communityId)
          : null;

      try {
        const post = await prisma.post.update({
          where: { id },
          data: {
            ...updateData,
            tags: input.tagIds
              ? {
                  deleteMany: {},
                  create: input.tagIds.map((tagId) => ({
                    tag: { connect: { id: tagId } },
                  })),
                }
              : undefined,
          },
          include: {
            author: { select: { id: true, username: true, email: true } },
            tags: { include: { tag: true } },
          },
        });

        return {
          success: true,
          message: "Post updated successfully",
          post: { ...post, tags: (post.tags as any[]).map((pt) => pt.tag) },
        };
      } catch (error) {
        console.error("Error updating post:", error);
        return { success: false, message: "Failed to update post", post: null };
      }
    },

    deletePost: async (
      _: unknown,
      { id }: { id: string },
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");

      const existingPost = await prisma.post.findUnique({ where: { id } });
      if (!existingPost) throw new Error("Post not found");
      if (existingPost.authorId !== user.id && user.role !== "ADMIN")
        throw new Error("Not authorized to delete this post");

      try {
        await prisma.post.delete({ where: { id } });
        return true;
      } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error("Failed to delete post");
      }
    },

    createTag: async (
      _: unknown,
      { input }: { input: { name: string; color?: string } }
    ) => {
      try {
        const tag = await prisma.tag.create({
          data: { name: input.name, color: input.color },
        });
        return { success: true, message: "Tag created successfully", tag };
      } catch (error) {
        console.error("Error creating tag:", error);
        return { success: false, message: "Failed to create tag", tag: null };
      }
    },

    addComment: async (
      _: unknown,
      { input }: { input: { content: string; postId: string } },
      { user }: { user: any }
    ) => {
      if (!user)
        return {
          success: false,
          message: "Authentication required",
          comment: null,
        };

      try {
        const comment = await prisma.comment.create({
          data: {
            content: input.content,
            postId: input.postId,
            authorId: user.id,
          },
          include: { author: { select: { id: true, username: true } } },
        });
        return {
          success: true,
          message: "Comment added successfully",
          comment,
        };
      } catch (error) {
        console.error("Error adding comment:", error);
        return {
          success: false,
          message: "Failed to add comment",
          comment: null,
        };
      }
    },

    votePost: async (
      _: unknown,
      { postId, value }: { postId: string; value: number },
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");
      if (![1, -1, 0].includes(value)) throw new Error("Invalid vote value");

      try {
        let vote;
        const existingVote = await prisma.vote.findUnique({
          where: { userId_postId: { userId: user.id, postId } },
        });

        if (existingVote) {
          if (value === 0) {
            await prisma.vote.delete({ where: { id: existingVote.id } });
          } else {
            vote = await prisma.vote.update({
              where: { id: existingVote.id },
              data: { value },
              include: { user: { select: { id: true, username: true } } },
            });
          }
        } else if (value !== 0) {
          vote = await prisma.vote.create({
            data: { userId: user.id, postId, value },
            include: { user: { select: { id: true, username: true } } },
          });
        }

        return vote;
      } catch (error) {
        console.error("Error voting post:", error);
        throw new Error("Failed to vote post");
      }
    },

    voteComment: async (
      _: unknown,
      { commentId, value }: { commentId: string; value: number },
      { user }: { user: any }
    ) => {
      if (!user) throw new Error("Authentication required");
      if (![1, -1].includes(value)) throw new Error("Invalid vote value");

      try {
        const existingVote = await prisma.vote.findUnique({
          where: { userId_commentId: { userId: user.id, commentId } },
        });
        if (existingVote) {
          if (existingVote.value === value)
            await prisma.vote.delete({ where: { id: existingVote.id } });
          else
            await prisma.vote.update({
              where: { id: existingVote.id },
              data: { value },
            });
        } else
          await prisma.vote.create({
            data: { userId: user.id, commentId, value },
          });
        return true;
      } catch (error) {
        console.error("Error voting comment:", error);
        throw new Error("Failed to vote comment");
      }
    },
  },
};
