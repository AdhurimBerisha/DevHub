import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  scalar DateTime

  enum UserRole {
    USER
    ADMIN
  }

  enum FriendshipStatus {
    PENDING
    ACCEPTED
    REJECTED
  }

  type Query {
    hello: String
    users: [User!]!
    user(id: ID!): User
    currentUser: User

    # Posts & related queries
    posts(
      limit: Int
      offset: Int
      published: Boolean
      communityId: ID
      authorId: ID
    ): [Post!]!
    post(id: ID!): Post
    tags: [Tag!]!
    popularTags: [Tag!]!
    tag(id: ID!): Tag
    comments(postId: ID!): [Comment!]!

    # 👇 Friendship-related queries
    friendships: [Friendship!]!
    friends(userId: ID!): [User!]!
    friendRequests: [Friendship!]!
  }

  type Mutation {
    # User-related
    createUser(input: CreateUserInput!): AuthResponse!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    login(input: LoginInput!): LoginResponse!
    loginWithGoogle(token: String!): LoginResponse!

    # Email verification
    verifyEmail(token: String!): AuthResponse!
    resendVerificationEmail: AuthResponse!

    # Password reset
    forgotPassword(email: String!): AuthResponse!
    resetPassword(token: String!, password: String!): AuthResponse!

    # Email change
    verifyEmailChange(token: String!): AuthResponse!
    cancelEmailChange: AuthResponse!

    # 👇 Friendship-related mutations
    sendFriendRequest(receiverId: ID!): Friendship!
    respondToFriendRequest(
      friendshipId: ID!
      status: FriendshipStatus!
    ): Friendship!
    removeFriend(friendshipId: ID!): Boolean!
    logout: LogoutResponse!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    role: UserRole!
    gender: String
    avatar: String
    emailVerified: Boolean!
    pendingEmail: String
    createdAt: DateTime!
    updatedAt: DateTime!
    isFriend: Boolean
    friendshipId: ID

    # 👇 Relationships
    friendRequestsSent: [Friendship!]!
    friendRequestsReceived: [Friendship!]!
  }

  type Friendship {
    id: ID!
    requester: User!
    receiver: User!
    status: FriendshipStatus!
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
    currentPassword: String
    password: String
    role: String
    gender: String
    avatar: String
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

  type LogoutResponse {
    success: Boolean!
    message: String!
  }
`;
