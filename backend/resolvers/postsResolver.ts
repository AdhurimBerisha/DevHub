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
      }: { limit?: number; offset?: number; published?: boolean }
    ) => {
      try {
        const posts = await prisma.post.findMany({
          where: { published },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
            likes: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });

        return posts.map((p) => ({
          ...p,
          tags: (p.tags as any[]).map((pt) => pt.tag),
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
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
            likes: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        });

        if (!post) return null;

        return {
          ...post,
          tags: (post.tags as any[]).map((pt) => pt.tag),
        };
      } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to fetch post");
      }
    },

    tags: async () => {
      try {
        return await prisma.tag.findMany({
          orderBy: { name: "asc" },
        });
      } catch (error) {
        console.error("Error fetching tags:", error);
        throw new Error("Failed to fetch tags");
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
                  include: {
                    author: {
                      select: {
                        id: true,
                        username: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!tag) return null;

        return {
          ...tag,
          posts: (tag.posts as any[]).map((pt) => pt.post),
        };
      } catch (error) {
        console.error("Error fetching tag:", error);
        throw new Error("Failed to fetch tag");
      }
    },

    comments: async (_: unknown, { postId }: { postId: string }) => {
      try {
        return await prisma.comment.findMany({
          where: { postId },
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
            likes: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
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
        };
      },
      { user }: { user: any }
    ) => {
      try {
        if (!user) {
          return {
            success: false,
            message: "Authentication required",
            post: null,
          };
        }

        const post = await prisma.post.create({
          data: {
            title: input.title,
            content: input.content,
            authorId: user.id,
            published: input.published || false,
            tags: input.tagIds
              ? {
                  create: input.tagIds.map((tagId) => ({
                    tagId,
                  })),
                }
              : undefined,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });

        const normalizedPost = {
          ...post,
          tags: (post.tags as any[]).map((pt) => pt.tag),
        };

        return {
          success: true,
          message: "Post created successfully",
          post: normalizedPost,
        };
      } catch (error) {
        console.error("Error creating post:", error);
        return {
          success: false,
          message: "Failed to create post",
          post: null,
        };
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
        };
      },
      { user }: { user: any }
    ) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }

        const existingPost = await prisma.post.findUnique({
          where: { id },
        });

        if (!existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.authorId !== user.id && user.role !== "ADMIN") {
          throw new Error("Not authorized to update this post");
        }

        const updateData: any = {};
        if (input.title) updateData.title = input.title;
        if (input.content) updateData.content = input.content;
        if (input.published !== undefined)
          updateData.published = input.published;
        if (input.featured !== undefined) updateData.featured = input.featured;

        const post = await prisma.post.update({
          where: { id },
          data: {
            ...updateData,
            tags: input.tagIds
              ? {
                  deleteMany: {},
                  create: input.tagIds.map((tagId) => ({
                    tagId,
                  })),
                }
              : undefined,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });

        const normalizedPost = {
          ...post,
          tags: (post.tags as any[]).map((pt) => pt.tag),
        };

        return {
          success: true,
          message: "Post updated successfully",
          post: normalizedPost,
        };
      } catch (error) {
        console.error("Error updating post:", error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to update post",
          post: null,
        };
      }
    },

    deletePost: async (
      _: unknown,
      { id }: { id: string },
      { user }: { user: any }
    ) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }

        const existingPost = await prisma.post.findUnique({
          where: { id },
        });

        if (!existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.authorId !== user.id && user.role !== "ADMIN") {
          throw new Error("Not authorized to delete this post");
        }

        await prisma.post.delete({
          where: { id },
        });

        return true;
      } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to delete post"
        );
      }
    },

    createTag: async (
      _: unknown,
      { input }: { input: { name: string; color?: string } }
    ) => {
      try {
        const tag = await prisma.tag.create({
          data: {
            name: input.name,
            color: input.color,
          },
        });

        return {
          success: true,
          message: "Tag created successfully",
          tag,
        };
      } catch (error) {
        console.error("Error creating tag:", error);
        return {
          success: false,
          message: "Failed to create tag",
          tag: null,
        };
      }
    },

    addComment: async (
      _: unknown,
      { input }: { input: { content: string; postId: string } },
      { user }: { user: any }
    ) => {
      try {
        if (!user) {
          return {
            success: false,
            message: "Authentication required",
            comment: null,
          };
        }

        const comment = await prisma.comment.create({
          data: {
            content: input.content,
            authorId: user.id,
            postId: input.postId,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
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

    likePost: async (
      _: unknown,
      { postId }: { postId: string },
      { user }: { user: any }
    ) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }

        const existingLike = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: user.id,
              postId,
            },
          },
        });

        if (existingLike) {
          throw new Error("Post already liked");
        }

        await prisma.like.create({
          data: {
            userId: user.id,
            postId,
          },
        });

        return true;
      } catch (error) {
        console.error("Error liking post:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to like post"
        );
      }
    },

    unlikePost: async (
      _: unknown,
      { postId }: { postId: string },
      { user }: { user: any }
    ) => {
      try {
        if (!user) {
          throw new Error("Authentication required");
        }

        await prisma.like.deleteMany({
          where: {
            userId: user.id,
            postId,
          },
        });

        return true;
      } catch (error) {
        console.error("Error unliking post:", error);
        throw new Error("Failed to unlike post");
      }
    },
  },
};
