import { Fragment, h, JSX } from 'preact';
import { useState } from 'preact/hooks';

// ** import figma ui components & icons
import { Text, Dropdown, Bold, Toggle, Columns, VerticalSpace } from '@create-figma-plugin/ui';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import types
import { PdfFormatOption } from '@/types/enums';

const PdfExportOption = () => {
  const { pdfFormatOption, setPdfFormatOption } = useImageExportStore();

  const [vectorGradients, setVectorGradients] = useState<boolean>(false);
  const [outlineLinks, setOutlineLinks] = useState<boolean>(false);

  const handlePdfFormatChange = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    const formatValue = event.currentTarget.value as PdfFormatOption;
    setPdfFormatOption(formatValue);
  };

  const pdfFormatOptions = Object.values(PdfFormatOption).map((value) => ({
    value,
    text: value,
  }));

  function toggleVectorGradient(newValue: boolean) {
    setVectorGradients(newValue);
  }

  function toggleOutlineLinks(newValue: boolean) {
    setOutlineLinks(newValue);
  }

  return (
    <Fragment>
      <Text>
        <Bold>PDF Export Options (optional)</Bold>
      </Text>
      <VerticalSpace space="small" />
      <div className="grid items-center grid-cols-4 gap-2">
        <Text>Format</Text>
        <div className="col-span-3">
          <Dropdown
            onChange={handlePdfFormatChange}
            options={pdfFormatOptions}
            value={pdfFormatOption}
          />
        </div>
      </div>
      <VerticalSpace space="small" />
      <Columns>
        <Toggle onValueChange={toggleVectorGradient} value={vectorGradients}>
          <Text>Vector Gradients</Text>
        </Toggle>
        <Toggle onValueChange={toggleOutlineLinks} value={outlineLinks}>
          <Text>Outline Links</Text>
        </Toggle>
      </Columns>
    </Fragment>
  );
};

export default PdfExportOption;
