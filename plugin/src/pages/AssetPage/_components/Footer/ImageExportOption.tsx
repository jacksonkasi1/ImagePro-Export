import { Fragment, h, JSX } from 'preact';

// ** import figma ui components & icons
import { Container, Text, Dropdown, VerticalSpace } from '@create-figma-plugin/ui';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import enums
import { ExportScaleOption } from '@/types/enums';

const ImageExportOption = () => {
  const { exportScaleOption, setExportScaleOption } = useImageExportStore();

  function handleScaleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const scaleValue = event.currentTarget.value;
    setExportScaleOption(scaleValue as ExportScaleOption);
  }

  const scaleOptions = Object.values(ExportScaleOption).map((value) => ({
    value,
    text: value,
  }));

  return (
    <Fragment>
      <div className="grid items-center grid-cols-4 gap-2">
        <Text>Scale</Text>
        <div className="col-span-3">
          <Dropdown onChange={handleScaleChange} options={scaleOptions} value={exportScaleOption} />
        </div>
      </div>
      <VerticalSpace space="small" />
      <div className="grid items-center grid-cols-4 gap-2">
        <Text>Compression</Text>
        <div className="col-span-3">
          <Text>Opt</Text>
        </div>
      </div>
    </Fragment>
  );
};

export default ImageExportOption;
