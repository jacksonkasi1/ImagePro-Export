import { h, Fragment, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

// ** import figma ui components & icons
import {
  Bold,
  Container,
  Text,
  IconChevronUp32,
  IconChevronDown32,
  Divider,
  Dropdown,
  VerticalSpace,
} from '@create-figma-plugin/ui';

// ** import sub-components
import PdfExportOption from './export-option/PdfExportOption';
import ImageExportOption from './export-option/ImageExportOption';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';
import { useUtilsStore } from '@/store/use-utils-store';

// ** import types
import { FormatOption } from '@/types/enums';

// Props for FilesFooterBody
interface FilesFooterBodyProps {
  isExpanded: boolean;
  handleFilesFooterToggle: (value: boolean) => void;
  handleFormatChange: (event: JSX.TargetedEvent<HTMLInputElement>) => void;
  contentRef: React.RefObject<HTMLDivElement>;
  contentHeight: string;
  handleHeightChange: () => void;
}

const FilesFooterBody = ({
  isExpanded,
  handleFilesFooterToggle,
  handleFormatChange,
  contentRef,
  contentHeight,
  handleHeightChange,
}: FilesFooterBodyProps) => {
  const { formatOption, setFormatOption } = useImageExportStore();
  const { currentPage } = useUtilsStore();
  const [formatOptions, setFormatOptions] = useState(
    Object.values(FormatOption).map((value) => ({ value, text: value }))
  );

  useEffect(() => {
    // Update formatOptions based on currentPage
    let updatedOptions = Object.values(FormatOption).map((value) => ({ value, text: value }));

    if (currentPage === 'upload') {
      // Remove SVG option when on 'upload' page
      updatedOptions = updatedOptions.filter((option) => option.value !== FormatOption.SVG);
    }

    setFormatOptions(updatedOptions);

    // Fallback to first format option
    setFormatOption(updatedOptions[0].value as FormatOption);
  }, [currentPage, setFormatOption]);

  return (
    <Fragment>
      <Divider />
      {/* Footer Top */}
      <Container space="small">
        <div
          className="flex items-center justify-between h-10 cursor-pointer"
          onClick={() => handleFilesFooterToggle(!isExpanded)} // Toggle expansion state
        >
          <Text>
            <Bold>Export</Bold>
          </Text>
          <button className="rounded-sm text-primary-text">
            {isExpanded ? <IconChevronDown32 /> : <IconChevronUp32 />}
          </button>
        </div>
      </Container>

      {/* Footer Middle - Dynamic Export Options */}
      <div
        ref={contentRef}
        style={{
          maxHeight: contentHeight,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        <Divider />
        <VerticalSpace space="small" />
        <Container space="small">
          <div className="grid items-center grid-cols-4 gap-2">
            <Text>Format</Text>
            <div className="col-span-3">
              <Dropdown onChange={handleFormatChange} options={formatOptions} value={formatOption} />
            </div>
          </div>
          <VerticalSpace space="small" />
          {formatOption === FormatOption.PDF ? (
            <PdfExportOption onHeightChange={handleHeightChange} />
          ) : (
            <ImageExportOption />
          )}
        </Container>
        <VerticalSpace space="small" />
      </div>
    </Fragment>
  );
};

export default FilesFooterBody;
