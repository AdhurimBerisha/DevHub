import { gql } from "@apollo/client";

// Dashboard stats
export const GET_ADMIN_STATS = gql`
  query AdminStats {
    adminStats {
      totalPosts
      totalUsers
      totalCommunities
    }
  }
`;

export const GET_RECENT_POSTS = gql`
  query RecentPosts($limit: Int) {
    recentPosts(limit: $limit) {
      id
      title
      content
      author {
        username
      }
      createdAt
      published
      featured
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;
