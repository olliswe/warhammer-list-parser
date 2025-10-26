import { create } from "zustand/react";

type State = {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

const useIsCollapsedStore = create<State>((set) => ({
  isCollapsed: false,
  setIsCollapsed: (newState) => set(() => ({ isCollapsed: newState })),
}));

export default useIsCollapsedStore;
