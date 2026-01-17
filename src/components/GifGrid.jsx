import GifCard from './GifCard';

function GifGrid({ gifs, onCopy, onDelete, copiedId }) {
  return (
    <div className="gif-grid">
      {gifs.map((gif) => (
        <GifCard
          key={gif.id}
          gif={gif}
          onCopy={() => onCopy(gif.id, gif.url)}
          onDelete={() => onDelete(gif.id)}
          isCopied={copiedId === gif.id}
        />
      ))}
    </div>
  );
}

export default GifGrid;
