import { forwardRef } from 'react';

const SearchBar = forwardRef(function SearchBar({ value, onChange }, ref) {
  return (
    <input
      ref={ref}
      type="text"
      className="search-bar"
      placeholder="Search by URL or tag..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});

export default SearchBar;
