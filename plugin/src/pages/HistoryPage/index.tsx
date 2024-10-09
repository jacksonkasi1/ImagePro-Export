import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import component
import SearchBox from '@/components/SearchBox';

// ** import sub-component
import ImageSelector from './_components/ImageSelector';

const HistoryPage = () => {
  return (
    <Fragment>
      <Divider />
      <SearchBox />
      <Divider />
      <ImageSelector />
    </Fragment>
  );
};

export default HistoryPage;
