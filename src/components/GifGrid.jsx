import GifCard from './GifCard';

function GifGrid({ gifs, onCopy, onDelete, copiedId, selectedIndex }) {
  return (
    <div className="gif-grid">
      {gifs.map((gif, index) => (
        <GifCard
          key={gif.id}
          gif={gif}
          onCopy={() => onCopy(gif.id, gif.url)}
          onDelete={() => onDelete(gif.id)}
          isCopied={copiedId === gif.id}
          isSelected={index === selectedIndex}
        />
      ))}
    </div>
  );
}

export default GifGrid;
