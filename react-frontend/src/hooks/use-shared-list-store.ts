import { create } from "zustand/react";
import { SharedListDetails } from "@/types";

const useSharedListStore = create<{
  sharedListInfo: SharedListDetails | null;
  setSharedListInfo: (info: SharedListDetails) => void;
}>((set) => ({
  sharedListInfo: null,
  setSharedListInfo: (info) => set({ sharedListInfo: info }),
}));

export default useSharedListStore;
