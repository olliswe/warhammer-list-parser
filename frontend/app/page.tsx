'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { getSavedLists, deleteList } from '@/lib/storage';
import { SavedList } from '@/types';

export default function Home() {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const lists = getSavedLists();
    lists.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    setSavedLists(lists);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteList(name);
      loadLists();
    }
  };

  const handleRename = (oldName: string) => {
    const newName = prompt('Enter new name for the list:', oldName);
    if (newName && newName.trim()) {
      const lists = getSavedLists();
      const list = lists.find(l => l.name === oldName);
      if (list) {
        deleteList(oldName);
        list.name = newName.trim();
        localStorage.setItem('warhammer_saved_lists', JSON.stringify(lists));
        loadLists();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Warhammer Army List Parser
          </h1>

          <div className="text-center">
            <Link href="/parse">
              <Button size="large">Parse New Army List</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">
            Saved Army Lists
          </h2>

          {savedLists.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-5xl mb-4 opacity-50">📋</div>
              <p className="text-gray-600 italic mb-2">No saved army lists yet.</p>
              <p className="text-gray-600 italic">Create your first list to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedLists.map((list, index) => {
                const lines = list.rawText.split('\n').filter(line => line.trim() !== '');
                const previewLines = lines.slice(0, 6).join('\n');
                const truncatedPreview = previewLines.length > 200
                  ? previewLines.substring(0, 200) + '...'
                  : previewLines;

                return (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-5 transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="text-lg font-bold text-gray-900 mb-3">
                      {list.name}
                    </div>

                    <div className="bg-white p-3 rounded border-l-4 border-blue-600 mb-4 font-mono text-xs text-gray-600 max-h-32 overflow-hidden relative">
                      {truncatedPreview}
                      <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600 mb-4">
                      <span>Saved: {new Date(list.savedAt).toLocaleDateString()}</span>
                      <span>{lines.length} lines</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/parse?listId=${index}`}>
                        <Button size="small" className="w-full">
                          Open & Parse
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleRename(list.name)}
                        >
                          Rename
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          className="flex-1"
                          onClick={() => handleDelete(list.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
