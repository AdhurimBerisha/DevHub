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
        authorId,
      }: {
        limit?: number;
        offset?: number;
        published?: boolean;
        communityId?: string | number;
        authorId?: string;
      },
      { user }: { user?: any }
    ) => {
      try {
        const where: any = {};
        if (published !== undefined) where.published = published;
        if (communityId !== undefined && communityId !== null)
          where.communityId = Number(communityId);
        if (authorId) where.authorId = authorId;

        const posts = await prisma.post.findMany({
          where,
          include: {
            author: { select: { id: true, username: true, email: true } },
            tags: { include: { tag: true } },
            comments: {
              where: { parentCommentId: null },
              include: {
                author: { select: { id: true, username: true } },
                votes: {
                  include: { user: { select: { id: true, username: true } } },
                },
                replies: {
                  include: {
                    author: { select: { id: true, username: true } },
                    votes: {
                      include: {
                        user: { select: { id: true, username: true } },
                      },
                    },
                  },
                  orderBy: { createdAt: "asc" },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });

        return posts.map((p: any) => ({
          ...p,
          tags: (p.tags as any[]).map((pt: any) => pt.tag),
          likes: p.votes.filter((v: any) => v.value === 1),
          dislikes: p.votes.filter((v: any) => v.value === -1),
          comments: p.comments.map((c: any) => ({
            ...c,
            likes: c.votes.filter((v: any) => v.value === 1),
            dislikes: c.votes.filter((v: any) => v.value === -1),
            voteCount: c.votes.reduce(
              (sum: number, v: any) => sum + v.value,
              0
            ),
            replies: c.replies.map((reply: any) => ({
              ...reply,
              likes: reply.votes.filter((v: any) => v.value === 1),
              dislikes: reply.votes.filter((v: any) => v.value === -1),
              voteCount: reply.votes.reduce(
                (sum: number, v: any) => sum + v.value,
                0
              ),
            })),
          })),
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error("Failed to fetch posts");
      }
    },

    post: async (
      _: unknown,
      { id }: { id: string },
      { user }: { user?: any }
    ) => {
      try {
        const post = await prisma.post.findUnique({
          where: { id },
          include: {
            author: { select: { id: true, username: true, email: true } },
            tags: { include: { tag: true } },
            comments: {
              where: { parentCommentId: null },
              include: {
                author: { select: { id: true, username: true } },
                votes: {
                  include: { user: { select: { id: true, username: true } } },
                },
                replies: {
                  include: {
                    author: { select: { id: true, username: true } },
                    votes: {
                      include: {
                        user: { select: { id: true, username: true } },
                      },
                    },
                  },
                  orderBy: { createdAt: "asc" },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
          },
        });

        if (!post) return null;

        const postWithRelations = post as any;

        return {
          ...postWithRelations,
          tags: (postWithRelations.tags as any[]).map((pt) => pt.tag),
          likes: postWithRelations.votes.filter((v: any) => v.value === 1),
          dislikes: postWithRelations.votes.filter((v: any) => v.value === -1),
          comments: (postWithRelations.comments as any[]).map((c: any) => ({
            ...c,
            likes: c.votes.filter((v: any) => v.value === 1),
            dislikes: c.votes.filter((v: any) => v.value === -1),
            voteCount: c.votes.reduce(
              (sum: number, v: any) => sum + v.value,
              0
            ),
            replies: c.replies.map((reply: any) => ({
              ...reply,
              likes: reply.votes.filter((v: any) => v.value === 1),
              dislikes: reply.votes.filter((v: any) => v.value === -1),
              voteCount: reply.votes.reduce(
                (sum: number, v: any) => sum + v.value,
                0
              ),
            })),
          })),
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

    savedPosts: async (
      _: unknown,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      { user }: { user?: any }
    ) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      try {
        const savedPostsData = await (prisma as any).savedPost.findMany({
          where: { userId: user.id },
          include: {
            post: {
              include: {
                author: { select: { id: true, username: true, email: true } },
                tags: { include: { tag: true } },
                comments: {
                  where: { parentCommentId: null },
                  include: {
                    author: { select: { id: true, username: true } },
                    votes: {
                      include: {
                        user: { select: { id: true, username: true } },
                      },
                    },
                    replies: {
                      include: {
                        author: { select: { id: true, username: true } },
                        votes: {
                          include: {
                            user: { select: { id: true, username: true } },
                          },
                        },
                      },
                      orderBy: { createdAt: "asc" },
                    },
                  },
                  orderBy: { createdAt: "desc" },
                },
                votes: {
                  include: { user: { select: { id: true, username: true } } },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });

        const posts = savedPostsData.map((sp: any) => {
          const post = sp.post;
          return {
            ...post,
            tags: (post.tags as any[]).map((pt) => pt.tag),
            comments: (post.comments as any[]).map((c: any) => ({
              ...c,
              likes: c.votes.filter((v: any) => v.value === 1),
              dislikes: c.votes.filter((v: any) => v.value === -1),
              voteCount: c.votes.reduce(
                (sum: number, v: any) => sum + v.value,
                0
              ),
              replies: c.replies.map((reply: any) => ({
                ...reply,
                likes: reply.votes.filter((v: any) => v.value === 1),
                dislikes: reply.votes.filter((v: any) => v.value === -1),
                voteCount: reply.votes.reduce(
                  (sum: number, v: any) => sum + v.value,
                  0
                ),
              })),
            })),
            isSaved: true,
          };
        });

        return posts;
      } catch (error) {
        console.error("Error fetching saved posts:", error);
        throw new Error("Failed to fetch saved posts");
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
        const comments = await (prisma as any).comment.findMany({
          where: { postId, parentCommentId: null },
          include: {
            author: { select: { id: true, username: true } },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
            replies: {
              include: {
                author: { select: { id: true, username: true } },
                votes: {
                  include: { user: { select: { id: true, username: true } } },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return comments.map((c: any) => ({
          ...c,
          votes: c.votes,
          likes: c.votes.filter((v: any) => v.value === 1),
          dislikes: c.votes.filter((v: any) => v.value === -1),
          voteCount: c.votes.reduce((sum: number, v: any) => sum + v.value, 0),
          replies: c.replies.map((reply: any) => ({
            ...reply,
            likes: reply.votes.filter((v: any) => v.value === 1),
            dislikes: reply.votes.filter((v: any) => v.value === -1),
            voteCount: reply.votes.reduce(
              (sum: number, v: any) => sum + v.value,
              0
            ),
          })),
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
          image?: string;
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
            image: input.image || undefined,
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
          image?: string;
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
      if (input.image !== undefined) updateData.image = input.image || null;
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
      {
        input,
      }: {
        input: { content: string; postId: string; parentCommentId?: string };
      },
      { user }: { user: any }
    ) => {
      if (!user)
        return {
          success: false,
          message: "Authentication required",
          comment: null,
        };

      try {
        if (input.parentCommentId) {
          const parentComment = await (prisma as any).comment.findUnique({
            where: { id: input.parentCommentId },
          });
          if (!parentComment || parentComment.postId !== input.postId) {
            return {
              success: false,
              message: "Invalid parent comment",
              comment: null,
            };
          }
        }

        const comment = await (prisma as any).comment.create({
          data: {
            content: input.content,
            postId: input.postId,
            authorId: user.id,
            parentCommentId: input.parentCommentId || null,
          },
          include: {
            author: { select: { id: true, username: true } },
            votes: {
              include: { user: { select: { id: true, username: true } } },
            },
            parentComment: input.parentCommentId
              ? {
                  include: {
                    author: { select: { id: true, username: true } },
                  },
                }
              : false,
          },
        });

        return {
          success: true,
          message: "Comment added successfully",
          comment: {
            ...comment,
            replies: [],
            likes: comment.votes.filter((v: any) => v.value === 1),
            dislikes: comment.votes.filter((v: any) => v.value === -1),
            voteCount: comment.votes.reduce(
              (sum: number, v: any) => sum + v.value,
              0
            ),
          },
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
      if (![1, -1, 0].includes(value)) throw new Error("Invalid vote value");

      try {
        const existingVote = await prisma.vote.findUnique({
          where: { userId_commentId: { userId: user.id, commentId } },
          include: { user: { select: { id: true, username: true } } },
        });

        if (existingVote && existingVote.value === value) {
          await prisma.vote.delete({ where: { id: existingVote.id } });
          return null;
        }

        if (existingVote) {
          return await prisma.vote.update({
            where: { id: existingVote.id },
            data: { value },
            include: { user: { select: { id: true, username: true } } },
          });
        }

        if (value !== 0) {
          return await prisma.vote.create({
            data: { userId: user.id, commentId, value },
            include: { user: { select: { id: true, username: true } } },
          });
        }

        return null;
      } catch (error) {
        console.error("Error voting comment:", error);
        throw new Error("Failed to vote comment");
      }
    },

    savePost: async (
      _: unknown,
      { postId }: { postId: string },
      { user }: { user: any }
    ) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      try {
        const existing = await (prisma as any).savedPost.findUnique({
          where: {
            userId_postId: {
              userId: user.id,
              postId: postId,
            },
          },
        });

        if (existing) {
          return true;
        }

        await (prisma as any).savedPost.create({
          data: {
            userId: user.id,
            postId: postId,
          },
        });

        return true;
      } catch (error) {
        console.error("Error saving post:", error);
        throw new Error("Failed to save post");
      }
    },

    unsavePost: async (
      _: unknown,
      { postId }: { postId: string },
      { user }: { user: any }
    ) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      try {
        await (prisma as any).savedPost.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId: postId,
            },
          },
        });

        return true;
      } catch (error: any) {
        if (error.code === "P2025") {
          return true;
        }
        console.error("Error unsaving post:", error);
        throw new Error("Failed to unsave post");
      }
    },
  },

  Post: {
    commentCount: async (post: any) => {
      try {
        const totalCount = await (prisma as any).comment.count({
          where: { postId: post.id },
        });
        return totalCount;
      } catch (error) {
        console.error("Error counting comments:", error);
        return 0;
      }
    },

    isSaved: async (post: any, _: unknown, { user }: { user?: any }) => {
      if (!user) return false;

      try {
        const savedPost = await (prisma as any).savedPost.findUnique({
          where: {
            userId_postId: {
              userId: user.id,
              postId: post.id,
            },
          },
        });

        return !!savedPost;
      } catch (error) {
        console.error("Error checking if post is saved:", error);
        return false;
      }
    },
  },
};
