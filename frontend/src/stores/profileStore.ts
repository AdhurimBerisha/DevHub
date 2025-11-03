import { create } from "zustand";

interface ProfileFormData {
  username: string;
  email: string;
}

interface ProfileState {
  // Dialog state
  isEditDialogOpen: boolean;
  
  // Form data
  formData: ProfileFormData;
  
  // Pagination
  currentPage: number;
  
  // Avatar upload
  avatarUploading: boolean;
  avatarPreview: string | null;
}

interface ProfileActions {
  // Dialog actions
  setEditDialogOpen: (open: boolean) => void;
  
  // Form actions
  setFormData: (data: ProfileFormData) => void;
  updateFormData: (updates: Partial<ProfileFormData>) => void;
  resetFormData: () => void;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  
  // Avatar actions
  setAvatarUploading: (uploading: boolean) => void;
  setAvatarPreview: (preview: string | null) => void;
  clearAvatarPreview: () => void;
  
  // Reset all state
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

  // Dialog actions
  setEditDialogOpen: (open) => set({ isEditDialogOpen: open }),

  // Form actions
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

  // Pagination actions
  setCurrentPage: (page) => set({ currentPage: page }),

  // Avatar actions
  setAvatarUploading: (uploading) => set({ avatarUploading: uploading }),
  
  setAvatarPreview: (preview) => set({ avatarPreview: preview }),
  
  clearAvatarPreview: () => set({ avatarPreview: null }),

  // Reset all state
  resetProfile: () => set(initialState),
}));

