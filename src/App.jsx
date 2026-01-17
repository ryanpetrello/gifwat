import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  const loadGifs = useCallback(async () => {
    try {
      const data = await invoke('get_gifs');
      setGifs(data);
    } catch (err) {
      console.error('Failed to load gifs:', err);
    }
  }, []);

  const filteredGifs = useMemo(() => {
    return gifs.filter((gif) => {
      if (!searchQuery.trim()) return true;
      const terms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
      // All terms must match (AND logic)
      return terms.every((term) => {
        const urlMatch = gif.url.toLowerCase().includes(term);
        const tagMatch = gif.tags.some((tag) => tag.toLowerCase().includes(term));
        return urlMatch || tagMatch;
      });
    });
  }, [gifs, searchQuery]);

  const handleCopyUrl = useCallback(async (id, url) => {
    try {
      await invoke('copy_to_clipboard', { text: url });
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
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

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showAddModal) return;

      const cols = 2; // grid columns
      if (e.key === 'Escape') {
        appWindow.hide();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => i < 0 ? 0 : Math.min(i + cols, filteredGifs.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => i < 0 ? 0 : Math.max(i - cols, 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex((i) => i < 0 ? 0 : Math.min(i + 1, filteredGifs.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex((i) => i < 0 ? 0 : Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && filteredGifs.length > 0) {
        e.preventDefault();
        const gif = filteredGifs[selectedIndex];
        if (gif) {
          handleCopyUrl(gif.id, gif.url);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, filteredGifs, selectedIndex, handleCopyUrl]);

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
            selectedIndex={selectedIndex}
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
