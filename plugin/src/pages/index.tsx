import { Fragment, h } from 'preact';

import AssetPage from './AssetPage';

import TabSwitch from '@/components/tab-switch';
import TestPage from './TestPage';

const Root = () => {
  return (
    <Fragment>
      <TabSwitch />
      <TestPage />
      <AssetPage />
    </Fragment>
  );
};

export default Root;
