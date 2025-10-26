import { create } from "zustand/react";
import { DetailsContent } from "@/types";

type DetailsContentStore = {
  detailsContent: DetailsContent | null;
  setDetailsContent: (content: DetailsContent | null) => void;
};

const useDetailsContentStore = create<DetailsContentStore>((set) => ({
  detailsContent: null,
  setDetailsContent: (content) => set({ detailsContent: content }),
}));

export default useDetailsContentStore;
