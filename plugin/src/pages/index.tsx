import { Fragment, h } from 'preact';

// ** import components
import TabSwitch from '@/components/tab-switch';

// ** import pages
import AssetPage from './AssetPage';
import UploadPage from './UploadPage';
import AIPage from './AIPage';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';

const pages = {
  asset: <AssetPage />,
  upload: <UploadPage />,
  ai: <AIPage />,
};

const Root = () => {
  const { currentPage } = useUtilsStore();

  return (
    <Fragment>
      <TabSwitch />
      {pages[currentPage as keyof typeof pages]}
    </Fragment>
  );
};

export default Root;
