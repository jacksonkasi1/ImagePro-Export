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
    <Fragment>
      <SearchBox />
      <Divider />
      <ImageSelector />
      <FilesFooter />
    </Fragment>
  );
};

export default AssetPage;
