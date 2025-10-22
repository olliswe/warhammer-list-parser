import { atom } from "jotai";
import { ParsedData, DetailsContent, SharedListDetails } from "@/types";

// Army list atoms
export const armyListAtom = atom("");
export const listNameAtom = atom("");
export const loadingAtom = atom(false);
export const errorAtom = atom("");
export const parsedDataAtom = atom(null as ParsedData | null);

// Details atoms
export const detailsContentAtom = atom(null as DetailsContent | null);

// Shared list atoms
export const sharedListInfoAtom = atom(null as SharedListDetails | null);
