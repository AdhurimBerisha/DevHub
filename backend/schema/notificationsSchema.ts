import { gql } from "graphql-tag";

export const notificationsTypeDefs = gql`
  type Notification {
    id: ID!
    type: NotificationType!
    read: Boolean!
    post: Post
    comment: Comment
    triggeredBy: User!
    createdAt: DateTime!
  }

  enum NotificationType {
    POST_UPVOTE
    POST_DOWNVOTE
    COMMENT_UPVOTE
    COMMENT_DOWNVOTE
    COMMENT_ON_POST
    REPLY_TO_COMMENT
  }

  extend type Query {
    notifications(limit: Int, offset: Int): [Notification!]!
    unreadNotificationCount: Int!
  }

  extend type Mutation {
    markNotificationRead(id: ID!): Boolean!
    markAllNotificationsRead: Boolean!
  }
`;

