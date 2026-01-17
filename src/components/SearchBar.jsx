import { forwardRef } from 'react';

const SearchBar = forwardRef(function SearchBar({ value, onChange }, ref) {
  return (
    <input
      ref={ref}
      type="text"
      className="search-bar"
      placeholder="Search by tag..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );
});

export default SearchBar;
