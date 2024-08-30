import { Fragment, h, JSX } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

// ** import figma ui
import { SearchTextbox, useInitialFocus } from '@create-figma-plugin/ui';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';

// ** import types
import { SearchNodesHandler } from '@/types/events';

const SearchBox = () => {
  const { searchQuery, setSearchQuery } = useUtilsStore();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the search input change.
   *
   * @param {JSX.TargetedEvent<HTMLInputElement>} event - The input change event.
   */
  const handleSearch = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value.toLowerCase());
  };

  /**
   * Emit the search event on Enter key press.
   *
   * @param {JSX.TargetedKeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      emit<SearchNodesHandler>('SEARCH_NODES', searchQuery);
    }
  };

  /**
   * Emit the search event when user clicks outside of the search box.
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      emit<SearchNodesHandler>('SEARCH_NODES', searchQuery);
    }
  };

  /**
   * Debounce the search query to emit only after 500ms of inactivity.
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      emit<SearchNodesHandler>('SEARCH_NODES', searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  /**
   * Add event listener for clicks outside of the search box.
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Fragment>
      <SearchTextbox
        {...useInitialFocus()}
        clearOnEscapeKeyDown
        name="searchQuery"
        onInput={handleSearch}
        placeholder="Search"
        value={searchQuery}
        onKeyDown={handleKeyDown}
        ref={searchRef} // Reference to detect clicks outside
      />
    </Fragment>
  );
};

export default SearchBox;
