import { Fragment, h } from 'preact';

// ** import components
import TabSwitch from '@/components/tab-switch';

// ** import pages
import AssetPage from './AssetPage';
import UploadPage from './UploadPage';

const Root = () => {
  const pages = {
    asset: <AssetPage />,
    upload: <UploadPage />,
  };

  return (
    <Fragment>
      <TabSwitch />
      <AssetPage />
    </Fragment>
  );
};

export default Root;
