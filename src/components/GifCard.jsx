import { useState, useRef, useEffect } from 'react';

function GifCard({ gif, onCopy, onDelete, isCopied, isSelected }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const cardRef = useRef(null);
  const maxRetries = 3;

  // Upgrade http:// to https:// for mixed content compatibility
  const imageUrl = gif.url.replace(/^http:\/\//i, 'https://');

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
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Auto-retry failed images
  const handleImageError = () => {
    if (retryCount < maxRetries) {
      // Retry after a delay
      setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s
    } else {
      setImageError(true);
    }
  };

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
              key={retryCount}
              src={imageUrl}
              alt="GIF"
              onError={handleImageError}
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
