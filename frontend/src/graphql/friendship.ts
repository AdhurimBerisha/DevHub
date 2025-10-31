import { gql } from "@apollo/client";

export const GET_FRIENDSHIPS = gql`
  query GetFriendships {
    friendships {
      id
      status
      requester {
        id
        username
      }
      receiver {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($receiverId: ID!) {
    sendFriendRequest(receiverId: $receiverId) {
      id
      status
      receiver {
        id
        username
      }
      requester {
        id
        username
      }
    }
  }
`;

export const RESPOND_TO_FRIEND_REQUEST = gql`
  mutation RespondToFriendRequest(
    $friendshipId: ID!
    $status: FriendshipStatus!
  ) {
    respondToFriendRequest(friendshipId: $friendshipId, status: $status) {
      id
      status
      requester {
        id
        username
      }
      receiver {
        id
        username
      }
    }
  }
`;

export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendshipId: ID!) {
    removeFriend(friendshipId: $friendshipId)
  }
`;
