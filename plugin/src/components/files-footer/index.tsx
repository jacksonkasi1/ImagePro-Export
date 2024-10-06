import { Fragment, h, JSX } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

// ** import figma utils
import { emit, formatWarningMessage } from '@create-figma-plugin/utilities';

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

// ** import lib
import notify from '@/lib/notify';

// ** import types
import { AssetsExportType, CaseOption, FormatOption } from '@/types/enums';
import { ExportAssetsHandler } from '@/types/events';

const FilesFooter = () => {
  const [isExpanded, setIsExpanded] = useState(false); // State to manage footer expansion
  const [contentHeight, setContentHeight] = useState('0px');
  const [heightTrigger, setHeightTrigger] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const { isLoading, setIsLoading } = useUtilsStore();
  const { selectedNodeIds, selectedNodesOrder } = useImageNodesStore();
  const {
    caseOption,
    exportScaleOption,
    setCaseOption,
    formatOption,
    setFormatOption,
    assetsExportType,
    pdfFormatOption,
  } = useImageExportStore();

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isExpanded, formatOption, heightTrigger]);

  const caseOptions = Object.values(CaseOption).map((value) => ({
    value,
    text: value,
  }));

  const formatOptions = Object.values(FormatOption).map((value) => ({
    value,
    text: value,
  }));

  const handleHeightChange = () => {
    // Update true or false to trigger height change
    setHeightTrigger((prev) => !prev);
  };

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
    let nodeIdsToExport: string[] = [];

    if (assetsExportType === AssetsExportType.SINGLE) {
      nodeIdsToExport = selectedNodesOrder; // follow nodes position order
    } else {
      nodeIdsToExport = selectedNodeIds; // not follow nodes position order
    }

    try {
      if (nodeIdsToExport.length === 0) {
        console.warn(formatWarningMessage('Please select at least one image to export.'));
        notify.warn('Please select at least one image to export.');
        return;
      }

      setIsLoading(true);
      notify.loading('Exporting assets...');

      emit<ExportAssetsHandler>('EXPORT_ASSETS', {
        selectedNodeIds: nodeIdsToExport,
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

        <Divider />

        {/* Footer Bottom */}
        <Container space="small">
          <div className="flex items-center justify-between h-12 gap-2">
            {/* Case Option */}
            <Dropdown onChange={handleCaseChange} options={caseOptions} value={caseOption} />
            <Button loading={isLoading} onClick={handleExport} disabled={isLoading}>
              Export
            </Button>
          </div>
        </Container>
      </Fragment>
    </div>
  );
};

export default FilesFooter;
