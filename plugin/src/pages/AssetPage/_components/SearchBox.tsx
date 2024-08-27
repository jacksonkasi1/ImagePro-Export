import { Fragment, h, JSX } from 'preact';

// ** import figma ui
import { SearchTextbox, useInitialFocus } from '@create-figma-plugin/ui';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';

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
      // Do something when the user presses the Enter key
      console.log('Enter key pressed');
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
