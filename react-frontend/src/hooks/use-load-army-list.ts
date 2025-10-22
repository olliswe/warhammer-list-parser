import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { getListById } from "@/lib/storage.ts";
import { useParams, useSearchParams } from "react-router-dom";
import useParseArmyList from "@/hooks/use-parse-army-list.ts";
import {
  armyListAtom,
  listNameAtom,
  loadingAtom,
  errorAtom,
  sharedListInfoAtom,
} from "@/atoms/parse-atoms";

const useLoadArmyList = () => {
  const [searchParams] = useSearchParams();
  const { sharedSlug } = useParams();
  const { handleParse } = useParseArmyList();

  const setArmyList = useSetAtom(armyListAtom);
  const setListName = useSetAtom(listNameAtom);
  const setLoading = useSetAtom(loadingAtom);
  const setError = useSetAtom(errorAtom);
  const setSharedListInfo = useSetAtom(sharedListInfoAtom);

  useEffect(() => {
    const loadSharedList = async (slug: string) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/shared/${slug}/`);
        const data = await response.json();

        if (response.ok) {
          const sharedName = data.name + " (Shared)";
          setArmyList(data.raw_text);
          setListName(sharedName);
          setSharedListInfo({
            viewCount: data.view_count,
            createdAt: data.created_at,
          });
          handleParse(data.raw_text, sharedName);
        } else {
          setError(data.error || "Failed to load shared list");
        }
      } catch (err) {
        setError("Failed to load shared list");
      } finally {
        setLoading(false);
      }
    };

    if (sharedSlug) {
      loadSharedList(sharedSlug);
    } else {
      const listId = searchParams.get("listId");
      if (listId) {
        const savedList = getListById(listId);

        if (savedList) {
          setArmyList(savedList.rawText);
          setListName(savedList.name);
          handleParse(savedList.rawText, savedList.name);
        }
      }
    }
  }, []);
};

export default useLoadArmyList;
