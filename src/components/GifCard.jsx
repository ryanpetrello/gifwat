import { useState, useRef, useEffect } from 'react';

function GifCard({ gif, onCopy, onDelete, isCopied, isSelected }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (showConfirm) {
      onDelete();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div ref={cardRef} className={`gif-card ${isSelected ? 'selected' : ''}`}>
      <div className="gif-preview" onClick={onCopy}>
        {imageError ? (
          <div className="gif-error">Failed to load</div>
        ) : (
          <img
            src={gif.url}
            alt="GIF"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        <div className={`copy-overlay ${isCopied ? 'copied' : ''} ${isSelected ? 'selected' : ''}`}>
          {isCopied ? 'Copied!' : isSelected ? 'Enter to copy' : 'Click to copy'}
        </div>
        <button
          className={`delete-x ${showConfirm ? 'confirm' : ''}`}
          onClick={handleDeleteClick}
        >
          {showConfirm ? '?' : '×'}
        </button>
      </div>
      {gif.tags.length > 0 && (
        <div className="gif-info">
          <div className="gif-tags">
            {gif.tags.map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GifCard;
