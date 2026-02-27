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
    <div class="flex flex-col h-screen overflow-hidden">
      <div class="shrink-0">
        <TabSwitch />
      </div>
      <div class="flex-1 overflow-hidden">
        {pages[currentPage as keyof typeof pages]}
      </div>
    </div>
  );
};

export default Root;
