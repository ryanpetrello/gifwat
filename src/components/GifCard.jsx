import { useState, useRef, useEffect } from 'react';

function GifCard({ gif, onCopy, onDelete, isCopied, isSelected }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Scroll selected card into view
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Reset error state to retry loading when scrolling back into view
          if (imageError) {
            setImageError(false);
            setImageLoaded(false);
          }
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [imageError]);

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
        ) : !isVisible ? (
          <div className="gif-loading" />
        ) : (
          <>
            {!imageLoaded && <div className="gif-loading" />}
            <img
              src={gif.url}
              alt="GIF"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              style={imageLoaded ? {} : { display: 'none' }}
            />
          </>
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
