import { create } from "zustand";

interface ProfileFormData {
  username: string;
  email: string;
}

interface ProfileState {
  isEditDialogOpen: boolean;

  formData: ProfileFormData;

  currentPage: number;

  avatarUploading: boolean;
  avatarPreview: string | null;
}

interface ProfileActions {
  setEditDialogOpen: (open: boolean) => void;

  setFormData: (data: ProfileFormData) => void;
  updateFormData: (updates: Partial<ProfileFormData>) => void;
  resetFormData: () => void;

  setCurrentPage: (page: number) => void;

  setAvatarUploading: (uploading: boolean) => void;
  setAvatarPreview: (preview: string | null) => void;
  clearAvatarPreview: () => void;

  resetProfile: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

const initialState: ProfileState = {
  isEditDialogOpen: false,
  formData: {
    username: "",
    email: "",
  },
  currentPage: 1,
  avatarUploading: false,
  avatarPreview: null,
};

export const useProfileStore = create<ProfileStore>((set) => ({
  ...initialState,

  setEditDialogOpen: (open) => set({ isEditDialogOpen: open }),

  setFormData: (data) => set({ formData: data }),

  updateFormData: (updates) =>
    set((state) => ({
      formData: { ...state.formData, ...updates },
    })),

  resetFormData: () =>
    set({
      formData: {
        username: "",
        email: "",
      },
    }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setAvatarUploading: (uploading) => set({ avatarUploading: uploading }),

  setAvatarPreview: (preview) => set({ avatarPreview: preview }),

  clearAvatarPreview: () => set({ avatarPreview: null }),

  resetProfile: () => set(initialState),
}));
