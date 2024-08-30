import { Fragment, h, JSX } from 'preact';

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

  /**
   * Handles the search input change.
   *
   * @param {JSX.TargetedEvent<HTMLInputElement>} event - The input change event.
   */
  const handleSearch = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value.toLowerCase());
  };

  const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      emit<SearchNodesHandler>('SEARCH_NODES', searchQuery);
    }
  };

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
      />
    </Fragment>
  );
};

export default SearchBox;
