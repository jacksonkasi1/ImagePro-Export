import { Fragment, h, JSX } from 'preact';
import { useState } from 'preact/hooks';

// ** import figma ui components & icons
import {
  Text,
  Dropdown,
  Bold,
  Toggle,
  Columns,
  VerticalSpace,
  useInitialFocus,
  Textbox,
} from '@create-figma-plugin/ui';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import types
import { PdfFormatOption } from '@/types/enums';

// Mapping PdfFormatOption values to their respective display labels
const pdfFormatOptions = [
  { value: PdfFormatOption.RGB, text: 'RGB (Default)' },
  { value: PdfFormatOption.CYMK, text: 'CYMK (for Print)' },
  { value: PdfFormatOption.Grayscale, text: 'Grayscale' },
];

const PdfExportOption = () => {
  const { pdfFormatOption, setPdfFormatOption, pdfPassword, setPdfPassword } = useImageExportStore();

  const [vectorGradients, setVectorGradients] = useState<boolean>(false);
  const [outlineLinks, setOutlineLinks] = useState<boolean>(false);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);

  const handlePdfFormatChange = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    const formatValue = event.currentTarget.value as PdfFormatOption;
    setPdfFormatOption(formatValue);
  };

  const toggleVectorGradient = (newValue: boolean) => {
    setVectorGradients(newValue);
  };

  const toggleOutlineLinks = (newValue: boolean) => {
    setOutlineLinks(newValue);
  };

  const handleSetPassword = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;

    // Sanitize the input to remove potentially harmful characters
    const sanitizedValue = newValue.replace(/[^a-zA-Z0-9!@#$%^&*()_+=-]/g, '');

    // Validate the input (e.g., ensuring it's not too long or contains only allowed characters)
    const isValid = sanitizedValue.length <= 100; // Set your maximum length requirement

    if (isValid) {
      setPdfPassword(sanitizedValue);
    } else {
      console.warn('Invalid password input');
      // Optionally, you can set an error message in the state or provide feedback to the user
    }
  };

  const handleRequirePasswordChange = (newValue: boolean) => {
    setRequirePassword(newValue);
  };

  return (
    <Fragment>
      <Text>
        <Bold>PDF Password Protection(optional)</Bold>
      </Text>
      <VerticalSpace space="medium" />
      <Toggle onValueChange={handleRequirePasswordChange} value={requirePassword}>
        <Text>Requires a password to open PDFs</Text>
      </Toggle>
      <VerticalSpace space="small" />
      {requirePassword && (
        <Textbox
          {...useInitialFocus()}
          onInput={handleSetPassword}
          value={pdfPassword}
          revertOnEscapeKeyDown
          placeholder="Enter a password"
          variant="border"
        />
      )}
      <VerticalSpace space="small" />
      <Text>
        <Bold>PDF Export Options (optional)</Bold>
      </Text>
      <VerticalSpace space="medium" />
      <div className="grid items-center grid-cols-4 gap-2">
        <Text>Format</Text>
        <div className="col-span-3">
          <Dropdown onChange={handlePdfFormatChange} options={pdfFormatOptions} value={pdfFormatOption} />
        </div>
      </div>
      <VerticalSpace space="small" />
      <Columns>
        <Toggle onValueChange={toggleVectorGradient} value={vectorGradients} disabled>
          <Text>Vector Gradients</Text>
        </Toggle>
        <Toggle onValueChange={toggleOutlineLinks} value={outlineLinks} disabled>
          <Text>Outline Links</Text>
        </Toggle>
      </Columns>
    </Fragment>
  );
};

export default PdfExportOption;
