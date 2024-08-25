import { Fragment, h } from 'preact';

// ** import components
import TabSwitch from '@/components/tab-switch';

// ** import pages
import AssetPage from './AssetPage';
import TestPage from './TestPage';

const Root = () => {
  return (
    <Fragment>
      <TabSwitch />
      <AssetPage />
      <TestPage />
    </Fragment>
  );
};

export default Root;
