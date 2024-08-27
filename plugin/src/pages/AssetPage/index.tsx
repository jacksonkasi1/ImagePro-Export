import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import sub-component
import SearchBox from './_components/SearchBox';
import ImageSelector from './_components/ImageSelector';

const AssetPage = () => {
  return (
    <Fragment>
      <SearchBox />
      <Divider />
      <ImageSelector />
    </Fragment>
  );
};

export default AssetPage;
