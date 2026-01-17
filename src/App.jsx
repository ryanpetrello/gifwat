import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import SearchBar from './components/SearchBar';
import GifGrid from './components/GifGrid';
import AddGifModal from './components/AddGifModal';

function App() {
  const [gifs, setGifs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const searchRef = useRef(null);

  const loadGifs = useCallback(async () => {
    try {
      const data = await invoke('get_gifs');
      setGifs(data);
    } catch (err) {
      console.error('Failed to load gifs:', err);
    }
  }, []);

  useEffect(() => {
    loadGifs();
  }, [loadGifs]);

  // Focus search bar when window gains focus
  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused && searchRef.current && !showAddModal) {
        searchRef.current.focus();
      }
    });
    return () => { unlisten.then(fn => fn()); };
  }, [showAddModal]);

  // Hide window on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showAddModal) {
        appWindow.hide();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const handleAddGif = async (url, tags) => {
    try {
      await invoke('add_gif', { url, tags });
      await loadGifs();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add gif:', err);
    }
  };

  const handleDeleteGif = async (id) => {
    try {
      await invoke('delete_gif', { id });
      await loadGifs();
    } catch (err) {
      console.error('Failed to delete gif:', err);
    }
  };

  const handleCopyUrl = async (id, url) => {
    try {
      await invoke('copy_to_clipboard', { text: url });
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredGifs = gifs.filter((gif) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const urlMatch = gif.url.toLowerCase().includes(query);
    const tagMatch = gif.tags.some((tag) => tag.toLowerCase().includes(query));
    return urlMatch || tagMatch;
  });

  return (
    <div className="app">
      <header className="header">
        <SearchBar ref={searchRef} value={searchQuery} onChange={setSearchQuery} />
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          +
        </button>
      </header>

      <main className="main">
        {filteredGifs.length === 0 ? (
          <div className="empty-state">
            {gifs.length === 0 ? (
              <>
                <p>No GIFs yet!</p>
                <p>Click + to get started.</p>
              </>
            ) : (
              <p>No GIFs match your search.</p>
            )}
          </div>
        ) : (
          <GifGrid
            gifs={filteredGifs}
            onCopy={handleCopyUrl}
            onDelete={handleDeleteGif}
            copiedId={copiedId}
          />
        )}
      </main>

      {showAddModal && (
        <AddGifModal
          onAdd={handleAddGif}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default App;
