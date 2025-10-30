import { gql } from "graphql-tag";

export const adminTypeDefs = gql`
  scalar DateTime

  enum UserRole {
    USER
    ADMIN
  }

  type User {
    id: ID!
    username: String!
    email: String!
  }

  type AdminStats {
    totalPosts: Int!
    totalUsers: Int!
    totalCommunities: Int!
    totalPageViews: Int!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    featured: Boolean!
    viewCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type Query {
    adminStats: AdminStats!
    recentPosts(limit: Int): [Post!]!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): PostResponse!
    updatePost(id: ID!, input: UpdatePostInput!): PostResponse!
    deletePost(id: ID!): Boolean!
  }

  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean
    featured: Boolean
    communityId: ID
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
    featured: Boolean
    communityId: ID
  }

  type PostResponse {
    success: Boolean!
    message: String!
    post: Post
  }
`;
