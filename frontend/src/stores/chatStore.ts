import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    email: string;
  };
  conversationId: string;
  createdAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  message: string;
  showConversations: boolean;
  showUserList: boolean;
  userSearchQuery: string;
  typingUsers: Record<string, { userId: string; username: string }>;
}

interface ChatActions {
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addConversation: (conversation: Conversation) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setMessage: (message: string) => void;
  setShowConversations: (show: boolean) => void;
  setShowUserList: (show: boolean) => void;
  setUserSearchQuery: (query: string) => void;
  setTypingUser: (conversationId: string, user: { userId: string; username: string } | null) => void;
  clearChat: () => void;
}

type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  message: "",
  showConversations: false,
  showUserList: false,
  userSearchQuery: "",
  typingUsers: {},
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialState,

      setConversations: (conversations) => set({ conversations }),

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, ...updates } : conv
          ),
        })),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [
            ...state.conversations.filter((c) => c.id !== conversation.id),
            conversation,
          ],
        })),

      setActiveConversation: (id) => set({ activeConversation: id }),

      setMessages: (conversationId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        })),

      addMessage: (message) =>
        set((state) => {
          const conversationMessages = state.messages[message.conversationId] || [];
          // Check if message already exists to avoid duplicates
          if (conversationMessages.some((m) => m.id === message.id)) {
            return state;
          }
          return {
            messages: {
              ...state.messages,
              [message.conversationId]: [...conversationMessages, message],
            },
          };
        }),

      setMessage: (message) => set({ message }),

      setShowConversations: (show) => set({ showConversations: show }),

      setShowUserList: (show) => set({ showUserList: show }),

      setUserSearchQuery: (query) => set({ userSearchQuery: query }),

      setTypingUser: (conversationId, user) =>
        set((state) => ({
          typingUsers: user
            ? { ...state.typingUsers, [conversationId]: user }
            : Object.fromEntries(
                Object.entries(state.typingUsers).filter(
                  ([id]) => id !== conversationId
                )
              ),
        })),

      clearChat: () => set(initialState),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversation: state.activeConversation,
        messages: state.messages,
      }),
    }
  )
);

