import { gql } from "@apollo/client";

export const GET_CONVERSATIONS_QUERY = gql`
  query GetConversations {
    conversations {
      id
      name
      isGroup
      createdAt
      updatedAt
      unreadCount
      lastMessage {
        id
        content
        createdAt
        sender {
          id
          username
        }
      }
      participants {
        id
        user {
          id
          username
          email
        }
      }
    }
  }
`;

export const MARK_MESSAGES_AS_READ_MUTATION = gql`
  mutation MarkMessagesAsRead($conversationId: ID!) {
    markMessagesAsRead(conversationId: $conversationId)
  }
`;

export const GET_CONVERSATION_QUERY = gql`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      name
      isGroup
      participants {
        id
        user {
          id
          username
          email
        }
      }
      messages {
        id
        content
        sender {
          id
          username
          email
        }
        createdAt
      }
    }
  }
`;

export const GET_MESSAGES_QUERY = gql`
  query GetMessages($conversationId: ID!, $limit: Int, $offset: Int) {
    messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
      id
      content
      sender {
        id
        username
        email
      }
      receiver {
        id
        username
        email
      }
      createdAt
      updatedAt
      readAt
    }
  }
`;
