import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isFriend?: boolean;
  friendshipId?: string | null;
  pending?: boolean;
}

export interface FriendRequest {
  id: string;
  requester: { id: string; username: string };
  receiver: { id: string; username: string };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

interface UsersState {
  searchQuery: string;
  friendsPage: number;
  othersPage: number;
  itemsPerPage: number;
  allUsers: User[];
  friendRequests: FriendRequest[];
}

interface UsersActions {
  setSearchQuery: (query: string) => void;
  setFriendsPage: (page: number) => void;
  setOthersPage: (page: number) => void;
  setAllUsers: (users: User[]) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  addFriendRequest: (request: FriendRequest) => void;
  removeFriendRequest: (requestId: string) => void;
  updateFriendRequest: (
    requestId: string,
    updates: Partial<FriendRequest>
  ) => void;
  resetUsers: () => void;
}

type UsersStore = UsersState & UsersActions;

const initialState: UsersState = {
  searchQuery: "",
  friendsPage: 1,
  othersPage: 1,
  itemsPerPage: 12,
  allUsers: [],
  friendRequests: [],
};

export const useUsersStore = create<UsersStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchQuery: (query) => set({ searchQuery: query }),

      setFriendsPage: (page) => set({ friendsPage: page }),

      setOthersPage: (page) => set({ othersPage: page }),

      setAllUsers: (users) => set({ allUsers: users }),

      updateUser: (userId, updates) =>
        set((state) => ({
          allUsers: state.allUsers.map((u) =>
            u.id === userId ? { ...u, ...updates } : u
          ),
        })),

      setFriendRequests: (requests) => set({ friendRequests: requests }),

      addFriendRequest: (request) =>
        set((state) => {
          if (state.friendRequests.some((req) => req.id === request.id)) {
            return state;
          }
          return {
            friendRequests: [...state.friendRequests, request],
          };
        }),

      removeFriendRequest: (requestId) =>
        set((state) => ({
          friendRequests: state.friendRequests.filter(
            (req) => req.id !== requestId
          ),
        })),

      updateFriendRequest: (requestId, updates) =>
        set((state) => ({
          friendRequests: state.friendRequests.map((req) =>
            req.id === requestId ? { ...req, ...updates } : req
          ),
        })),

      resetUsers: () => set(initialState),
    }),
    {
      name: "users-storage",
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        friendsPage: state.friendsPage,
        othersPage: state.othersPage,
        friendRequests: state.friendRequests,
      }),
    }
  )
);
