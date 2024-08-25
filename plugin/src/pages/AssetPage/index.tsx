import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import sub-component
import SearchBox from './_components/SearchBox';

const AssetPage = () => {
  return (
    <Fragment>
      <SearchBox />
      <Divider />
    </Fragment>
  );
};

export default AssetPage;
