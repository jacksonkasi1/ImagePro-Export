import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import sub-component
import SearchBox from './_components/SearchBox';
import ImageSelector from './_components/ImageSelector';
import Footer from './_components/Footer';

const AssetPage = () => {
  return (
    <Fragment>
      <SearchBox />
      <Divider />
      <ImageSelector />
      <Footer />
    </Fragment>
  );
};

export default AssetPage;
