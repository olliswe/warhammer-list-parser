import { ParsedData } from "@/types";
import { create } from "zustand/react";

type ArmyListStoreState = {
  armyList: string;
  setArmyList: (text: string) => void;
  listName: string;
  setListName: (name: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  parsedData: ParsedData | null;
  setParsedData: (data: ParsedData | null) => void;
};

const useArmyListStore = create<ArmyListStoreState>((set) => ({
  armyList: "",
  setArmyList: (text) => set({ armyList: text }),
  listName: "",
  setListName: (name) => set({ listName: name }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: "",
  setError: (error) => set({ error }),
  parsedData: null,
  setParsedData: (data) => set({ parsedData: data }),
}));

export default useArmyListStore;
