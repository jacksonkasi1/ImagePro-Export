import { Fragment, h } from 'preact';

// ** import figma ui
import { Divider } from '@create-figma-plugin/ui';

// ** import sub-component
import ImageSelector from './_components/ImageSelector';

const HistoryPage = () => {
  return (
    <Fragment>
      <Divider />
      <ImageSelector />
    </Fragment>
  );
};

export default HistoryPage;
