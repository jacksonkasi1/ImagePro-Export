import { Fragment, h, JSX } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

// ** import figma ui components & icons
import {
  Bold,
  Container,
  Text,
  IconChevronUp32,
  IconChevronDown32,
  Divider,
  Button,
  Dropdown,
  VerticalSpace,
} from '@create-figma-plugin/ui';

// ** import sub-component
import PdfExportOption from './PdfExportOption';
import ImageExportOption from './ImageExportOption';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useUtilsStore } from '@/store/use-utils-store';

// ** import types
import { CaseOption, FormatOption } from '@/types/enums';
import { ExportAssetsHandler } from '@/types/events';

const Footer = () => {
  const [isExpanded, setIsExpanded] = useState(false); // State to manage footer expansion
  const [contentHeight, setContentHeight] = useState('0px');
  const contentRef = useRef<HTMLDivElement>(null);

  const { isLoading, setIsLoading } = useUtilsStore();
  const { selectedNodeIds } = useImageNodesStore();
  const { caseOption, exportScaleOption, setCaseOption, formatOption, setFormatOption, pdfFormatOption } =
    useImageExportStore();

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isExpanded, formatOption]);

  const caseOptions = Object.values(CaseOption).map((value) => ({
    value,
    text: value,
  }));

  const formatOptions = Object.values(FormatOption).map((value) => ({
    value,
    text: value,
  }));

  function handleCaseChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const caseValue = event.currentTarget.value;

    // Validate if the caseValue is a valid CaseOption
    if (Object.values(CaseOption).includes(caseValue as CaseOption)) {
      setCaseOption(caseValue as CaseOption);
    } else {
      console.warn('Invalid case option selected:', caseValue);
    }
  }

  function handleFormatChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const formatValue = event.currentTarget.value;

    // Validate if the formatValue is a valid FormatOption
    if (Object.values(FormatOption).includes(formatValue as FormatOption)) {
      setFormatOption(formatValue as FormatOption);
    } else {
      console.warn('Invalid format option selected:', formatValue);
    }
  }

  const handleExport = async () => {
    try {
      setIsLoading(true);
      emit<ExportAssetsHandler>('EXPORT_ASSETS', {
        selectedNodeIds,
        formatOption,
        exportScaleOption,
        caseOption,
        pdfFormatOption,
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-auto bg-primary-bg">
      <Fragment>
        <Divider />
        {/* Footer Top */}
        <Container space="small">
          <div
            className={'h-10 flex items-center justify-between cursor-pointer'}
            onClick={() => setIsExpanded(!isExpanded)} // Toggle expansion state
          >
            <Text>
              <Bold>Export</Bold>
            </Text>
            <button className={'rounded-sm text-primary-text'}>
              {isExpanded ? <IconChevronDown32 /> : <IconChevronUp32 />}
            </button>
          </div>
        </Container>

        {/* Footer Middle -  Dynamic Export Options */}
        <div
          ref={contentRef}
          style={{
            maxHeight: contentHeight,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out',
          }}
        >
          <Container space="small">
            <div className="grid items-center grid-cols-4 gap-2">
              <Text>Format</Text>
              <div className="col-span-3">
                <Dropdown onChange={handleFormatChange} options={formatOptions} value={formatOption} />
              </div>
            </div>
            <VerticalSpace space="small" />
            {/* {formatOption === FormatOption.PDF ? <PdfExportOption /> : <ImageExportOption />} */}
            <ImageExportOption />
          </Container>
          <VerticalSpace space="small" />
        </div>

        <Divider />

        {/* Footer Bottom */}
        <Container space="small">
          <div className="flex items-center justify-between h-12 gap-2">
            {/* Case Option */}
            <Dropdown onChange={handleCaseChange} options={caseOptions} value={caseOption} />
            <Button loading={isLoading} onClick={handleExport}>
              Export
            </Button>
          </div>
        </Container>
      </Fragment>
    </div>
  );
};

export default Footer;
