import { gql } from "@apollo/client";

// ================== Queries ==================

export const GET_NOTIFICATIONS_QUERY = gql`
  query GetNotifications($limit: Int, $offset: Int) {
    notifications(limit: $limit, offset: $offset) {
      id
      type
      read
      post {
        id
        title
      }
      comment {
        id
        content
        post {
          id
        }
      }
      triggeredBy {
        id
        username
        avatar
      }
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT_QUERY = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

// ================== Mutations ==================

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

