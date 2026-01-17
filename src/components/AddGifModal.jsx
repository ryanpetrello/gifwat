import { useState, useMemo } from 'react';

function AddGifModal({ onAdd, onClose }) {
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [previewError, setPreviewError] = useState(false);

  const tags = useMemo(() => {
    return tagsInput.split(/\s+/).filter((t) => t.length > 0);
  }, [tagsInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAdd(url.trim(), tags);
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, i) => i !== indexToRemove);
    setTagsInput(newTags.join(' '));
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setPreviewError(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add GIF</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">GIF URL</label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/funny.gif"
              value={url}
              onChange={handleUrlChange}
              autoFocus
              required
            />
          </div>

          {url && (
            <div className="preview-container">
              {previewError ? (
                <div className="preview-error">Could not load preview</div>
              ) : (
                <img
                  src={url}
                  alt="Preview"
                  className="preview-image"
                  onError={() => setPreviewError(true)}
                />
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              placeholder="funny, reaction, cat"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={!url.trim()}>
              Add GIF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGifModal;
