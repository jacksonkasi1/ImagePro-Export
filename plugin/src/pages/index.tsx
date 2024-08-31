import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';

// ** import figma utils
import { on } from '@create-figma-plugin/utilities';

// ** import components
import TabSwitch from '@/components/tab-switch';

// ** import pages
import AssetPage from './AssetPage';

// ** import helpers
import { handleExportComplete } from '@/helpers/handle-export-complete';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import types
import { ExportCompleteHandler } from '@/types/events';

const Root = () => {
  const { setIsLoading } = useUtilsStore();
  const { quality } = useImageExportStore();

  useEffect(() => {
    on<ExportCompleteHandler>('EXPORT_COMPLETE', (data) => {
      handleExportComplete({ data, setIsLoading, quality });
    });
  }, []);

  return (
    <Fragment>
      <TabSwitch />
      <AssetPage />
    </Fragment>
  );
};

export default Root;
