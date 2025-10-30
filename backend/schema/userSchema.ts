import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  scalar DateTime

  enum UserRole {
    USER
    ADMIN
  }

  type Query {
    hello: String
    users: [User!]!
    user(id: ID!): User
    currentUser: User
  }

  extend type Query {
    posts(
      limit: Int
      offset: Int
      published: Boolean
      communityId: ID
      authorId: ID # ✅ add this line
    ): [Post!]!
    post(id: ID!): Post
    tags: [Tag!]!
    popularTags: [Tag!]!
    tag(id: ID!): Tag
    comments(postId: ID!): [Comment!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): AuthResponse!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    login(input: LoginInput!): LoginResponse!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateUserInput {
    email: String!
    username: String!
    password: String!
    role: UserRole
  }

  input UpdateUserInput {
    email: String
    username: String
    password: String
    role: UserRole
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    user: User
    token: String
  }

  type LoginResponse {
    success: Boolean!
    message: String!
    user: User
    token: String
  }
`;
