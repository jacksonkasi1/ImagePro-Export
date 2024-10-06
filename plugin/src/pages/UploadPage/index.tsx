import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import component
import FilesFooter from '@/components/files-footer';

// ** import sub-component
import SearchBox from './_components/SearchBox';
import ImageSelector from './_components/ImageSelector';

const UploadPage = () => {
  return (
    <Fragment>
      <SearchBox />
      <Divider />
      <ImageSelector />
      <FilesFooter />
    </Fragment>
  );
};

export default UploadPage;
