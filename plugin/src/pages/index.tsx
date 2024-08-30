import { Fragment, h } from 'preact';

// ** import components
import TabSwitch from '@/components/tab-switch';

// ** import pages
import AssetPage from './AssetPage';

const Root = () => {
  return (
    <Fragment>
      <TabSwitch />
      <AssetPage />
    </Fragment>
  );
};

export default Root;
