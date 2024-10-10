import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';

// ** import custom icons
import DeleteIcon from '@/assets/Icons/DeleteIcon';

// ** import figma ui components & icons
import { Bold, Container, Divider, SearchTextbox, Text, useInitialFocus, VerticalSpace } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';
import IconButton from '@/components/ui/icon-button';

// ** import sub-components
import ImageGridListView from './ImageGridListView';

// ** import store
import { useHistoryStore } from '@/store/use-history-store';

// ** import utils
import { cn } from '@/lib/utils';
import notify from '@/lib/notify';

// ** import helpers
import { deleteFiles } from '@/helpers/cloud-operation';

const ImageSelector = () => {
  const { history, removeHistoryItem } = useHistoryStore.getState();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // Loading state for delete button

  const allItemsCount = history.length;

  const filteredHistory = history.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handle Select All Checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all items
      const allIds = history.map((item) => item.id);
      setSelectedItems(allIds);
    } else {
      // Deselect all items
      setSelectedItems([]);
    }
  };

  const handleSelectImage = (id: number, checked: boolean) => {
    setSelectedItems((prev: number[]) => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter((itemId) => itemId !== id);
      }
    });
  };

  // Handle file deletion
  const handleDelete = async () => {
    setIsDeleting(true); // Start loading
    try {
      const selectedFileIds = selectedItems
        .map((id) => {
          const selectedItem = history.find((item) => item.id === id);
          return selectedItem ? selectedItem.file_id : '';
        })
        .filter(Boolean);

      const selectedThumbnailIds = selectedItems
        .map((id) => {
          const selectedItem = history.find((item) => item.id === id);
          return selectedItem?.thumbnail_id || '';
        })
        .filter(Boolean);

      const idsToDelete = [...selectedFileIds, ...selectedThumbnailIds].filter(Boolean);

      if (idsToDelete.length === 0) {
        notify.error('No valid IDs found to delete.');
        setIsDeleting(false); // Stop loading
        return;
      }

      // Call API to delete the files
      const result = await deleteFiles(idsToDelete);

      if (result.success) {
        notify.success('Files deleted successfully.');

        // Remove the deleted items from the store
        selectedItems.forEach((id) => removeHistoryItem(id));

        // Clear the selected items
        setSelectedItems([]);
      } else {
        notify.error('Failed to delete files.');
      }
    } catch (error: any) {
      notify.error(`Error deleting files: ${error.message}`);
    } finally {
      setIsDeleting(false); // Stop loading
    }
  };

  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
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
      />
      <Divider />

      <Container space="small" style={{ height: '100%' }}>
        <VerticalSpace space="small" />

        <div className="flex items-center justify-between">
          {/* Select All Checkbox */}
          <Checkbox value={selectedItems.length === allItemsCount} onValueChange={handleSelectAll}>
            <Text>
              <Bold>
                Selected: {selectedItems.length}/{allItemsCount} exportable assets
              </Bold>
            </Text>
          </Checkbox>

          {/* Delete Icon */}
          <IconButton
            animate
            onClick={handleDelete}
            disabled={selectedItems.length === 0 || isDeleting} // Disable button when deleting
            className={cn('-m-1', {
              'cursor-not-allowed opacity-50': selectedItems.length === 0 || isDeleting,
              'text-danger hover:text-danger-hover': selectedItems.length > 0 && !isDeleting,
            })}
            loading={isDeleting} // Show loading state on button
          >
            <DeleteIcon
              color={
                selectedItems.length === 0 || isDeleting ? 'var(--figma-color-text)' : 'var(--figma-color-bg-danger)'
              }
            />
          </IconButton>
        </div>
        <VerticalSpace space="small" />

        {/* Image Grid/List View */}
        <ImageGridListView
          history={filteredHistory}
          selectedNodeIds={selectedItems}
          onSelectImage={handleSelectImage}
        />
      </Container>
    </Fragment>
  );
};

export default ImageSelector;
