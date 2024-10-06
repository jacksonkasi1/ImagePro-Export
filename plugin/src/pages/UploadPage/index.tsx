import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import component
import SearchBox from '@/components/SearchBox';
import FilesFooter from '@/components/files-footer';

// ** import sub-component
import ImageSelector from './_components/ImageSelector';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';

const UploadPage = () => {
  const { isHistoryVisible } = useUtilsStore();

  return (
    <Fragment>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isHistoryVisible ? 'opacity-0 -z-10' : 'opacity-100'}`}
      >
        <SearchBox />
        <Divider />
        <ImageSelector />
      </div>
      <FilesFooter />
    </Fragment>
  );
};

export default UploadPage;
