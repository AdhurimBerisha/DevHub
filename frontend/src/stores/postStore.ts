import { create } from "zustand";

interface PostState {
  commentText: string;
  replyText: Record<string, string>;
  replyingTo: string | null;
  isSaved: boolean;
}

interface PostActions {
  setCommentText: (text: string) => void;
  setReplyText: (commentId: string, text: string) => void;
  clearReplyText: (commentId: string) => void;
  setReplyingTo: (commentId: string | null) => void;
  setIsSaved: (saved: boolean) => void;
  resetPost: () => void;
}

type PostStore = PostState & PostActions;

const initialState: PostState = {
  commentText: "",
  replyText: {},
  replyingTo: null,
  isSaved: false,
};

export const usePostStore = create<PostStore>((set) => ({
  ...initialState,

  setCommentText: (text) => set({ commentText: text }),

  setReplyText: (commentId, text) =>
    set((state) => ({
      replyText: { ...state.replyText, [commentId]: text },
    })),

  clearReplyText: (commentId) =>
    set((state) => {
      const { [commentId]: _, ...rest } = state.replyText;
      return { replyText: rest };
    }),

  setReplyingTo: (commentId) => set({ replyingTo: commentId }),

  setIsSaved: (saved) => set({ isSaved: saved }),

  resetPost: () => set(initialState),
}));

