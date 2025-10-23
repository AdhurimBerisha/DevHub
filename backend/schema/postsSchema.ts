import { gql } from "graphql-tag";

export const postsTypeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    tags: [Tag!]!
    comments: [Comment!]!
    likes: [Like!]!
    published: Boolean!
    featured: Boolean!
    viewCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Tag {
    id: ID!
    name: String!
    color: String
    posts: [Post!]!
    createdAt: DateTime!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    likes: [Like!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Like {
    id: ID!
    user: User!
    post: Post
    comment: Comment
    createdAt: DateTime!
  }

  input CreatePostInput {
    title: String!
    content: String!
    tagIds: [ID!]
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    tagIds: [ID!]
    published: Boolean
    featured: Boolean
  }

  input CreateTagInput {
    name: String!
    color: String
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
  }

  type PostResponse {
    success: Boolean!
    message: String!
    post: Post
  }

  type TagResponse {
    success: Boolean!
    message: String!
    tag: Tag
  }

  type CommentResponse {
    success: Boolean!
    message: String!
    comment: Comment
  }

  extend type Query {
    posts(limit: Int, offset: Int, published: Boolean): [Post!]!
    post(id: ID!): Post
    tags: [Tag!]!
    tag(id: ID!): Tag
    comments(postId: ID!): [Comment!]!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): PostResponse!
    updatePost(id: ID!, input: UpdatePostInput!): PostResponse!
    deletePost(id: ID!): Boolean!
    createTag(input: CreateTagInput!): TagResponse!
    updateTag(id: ID!, input: CreateTagInput!): TagResponse!
    deleteTag(id: ID!): Boolean!
    addComment(input: CreateCommentInput!): CommentResponse!
    updateComment(id: ID!, content: String!): CommentResponse!
    deleteComment(id: ID!): Boolean!
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!
    likeComment(commentId: ID!): Boolean!
    unlikeComment(commentId: ID!): Boolean!
  }
`;
