import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "@/components/atoms/Card.tsx";
import Button from "@/components/atoms/Button.tsx";
import { getSavedLists, deleteList } from "@/lib/storage";
import { SavedList } from "@/types";
import SavedListsPlaceholder from "@/components/home/SavedListsPlaceholder.tsx";
import SavedListsList from "@/components/home/SavedListsList.tsx";
import InfoPanel from "@/components/home/InfoPanel.tsx";

export default function Home() {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const lists = getSavedLists();
    lists.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
    setSavedLists(lists);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteList(name);
      loadLists();
    }
  };

  const handleRename = (oldName: string) => {
    const newName = prompt("Enter new name for the list:", oldName);
    if (newName && newName.trim()) {
      const lists = getSavedLists();
      const list = lists.find((l) => l.name === oldName);
      if (list) {
        deleteList(oldName);
        list.name = newName.trim();
        localStorage.setItem("warhammer_saved_lists", JSON.stringify(lists));
        loadLists();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-5">
            Warhammer 40k Army List Parser
          </h1>
          <InfoPanel />

          <div className="text-center">
            <Link to="/parse">
              <Button size="large">Parse New Army List</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">
            Saved Army Lists
          </h2>

          {savedLists.length === 0 ? (
            <SavedListsPlaceholder />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <SavedListsList
                savedLists={savedLists}
                handleDelete={handleDelete}
                handleRename={handleRename}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
