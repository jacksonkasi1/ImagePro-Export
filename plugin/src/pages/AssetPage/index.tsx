import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import component
import SearchBox from '@/components/SearchBox';
import FilesFooter from '@/components/files-footer';

// ** import sub-component
import ImageSelector from './_components/ImageSelector';

const AssetPage = () => {
  return (
    <div class="flex flex-col h-full">
      <div class="shrink-0">
        <SearchBox />
        <Divider />
      </div>
      <div class="flex-1 overflow-hidden">
        <ImageSelector />
      </div>
      <div class="shrink-0">
        <FilesFooter />
      </div>
    </div>
  );
};

export default AssetPage;
