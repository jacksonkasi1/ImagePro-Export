import { Fragment, h, JSX } from 'preact';

// ** import figma ui components & icons
import { Text, Dropdown, VerticalSpace, RangeSlider } from '@create-figma-plugin/ui';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import enums
import { ExportScaleOption, FormatOption } from '@/types/enums';

// ** import utils
import { cn } from '@/lib/utils';

const ImageExportOption = () => {
  const { formatOption, exportScaleOption, setExportScaleOption, quality, setQuality } = useImageExportStore();

  function handleScaleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const scaleValue = event.currentTarget.value;
    setExportScaleOption(scaleValue as ExportScaleOption);
  }

  const handleQualityChange = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newQuality = parseFloat(event.currentTarget.value);
    setQuality(newQuality);
  };

  const scaleOptions = Object.values(ExportScaleOption).map((value) => ({
    value,
    text: value,
  }));

  const isDisabled = formatOption === FormatOption.PDF || formatOption === FormatOption.SVG;

  return (
    <Fragment>
      <div className="grid items-center grid-cols-4 gap-2">
        <Text className={cn({ 'text-secondary-text': isDisabled })}>Scale</Text>
        <div className="col-span-3">
          <Dropdown
            onChange={handleScaleChange}
            options={scaleOptions}
            value={exportScaleOption}
            disabled={isDisabled}
          />
        </div>
      </div>
      <VerticalSpace space="small" />
      <div className="grid items-center grid-cols-4 gap-2">
        <Text className={cn({ 'text-secondary-text': isDisabled })}>Compression</Text>
        <div className="flex items-center col-span-3">
          <RangeSlider
            minimum={0}
            maximum={100}
            onInput={handleQualityChange}
            value={quality.toString()}
            disabled={isDisabled}
          />
          <Text className="ml-2">{`${Math.round(quality)}%`}</Text> {/* Display quality in percentage */}
        </div>
      </div>
    </Fragment>
  );
};

export default ImageExportOption;
