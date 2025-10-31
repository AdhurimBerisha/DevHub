import { gql } from "graphql-tag";

export const chatTypeDefs = gql`
  scalar DateTime

  type Conversation {
    id: ID!
    name: String
    isGroup: Boolean!
    participants: [ConversationParticipant!]!
    messages: [Message!]!
    lastMessage: Message
    unreadCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ConversationParticipant {
    id: ID!
    user: User!
    conversation: Conversation!
    joinedAt: DateTime!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    conversation: Conversation!
    receiver: User
    createdAt: DateTime!
    updatedAt: DateTime!
    readAt: DateTime
  }

  extend type Query {
    conversations: [Conversation!]!
    conversation(id: ID!): Conversation
    messages(conversationId: ID!, limit: Int, offset: Int): [Message!]!
  }

  extend type Mutation {
    markMessagesAsRead(conversationId: ID!): Boolean!
  }
`;
