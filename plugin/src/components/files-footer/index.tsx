import { h, JSX } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

// ** import figma utils
import { emit, formatWarningMessage } from '@create-figma-plugin/utilities';

// ** import figma ui components & icons
import { Container, Divider, Button, Dropdown } from '@create-figma-plugin/ui';

// ** import custom icons
import HistoryIcon from '@/assets/Icons/HistoryIcon';

// ** import sub-components
import FilesFooterBody from './FilesFooterBody';
import HistoryFooterBody from './HistoryFooterBody';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import lib
import notify from '@/lib/notify';

// ** import types
import { ExportAssetsHandler } from '@/types/events';
import { AssetsExportType, CaseOption, FormatOption } from '@/types/enums';

const FilesFooter = () => {
  const transitionDuration = 300; // Duration in milliseconds

  const [isExpanded, setIsExpanded] = useState(false); // State to manage footer expansion
  const [contentHeight, setContentHeight] = useState('0px');
  const [heightTrigger, setHeightTrigger] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const { currentPage, isLoading, setIsLoading, isHistoryVisible, setIsHistoryVisible } = useUtilsStore();
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
      if (isExpanded) {
        if (isHistoryVisible) {
          // Set a fixed height for HistoryFooterBody when expanded
          setContentHeight('451px'); // Adjust the height as needed
        } else {
          // For other components, use the actual content height
          setContentHeight(`${contentRef.current.scrollHeight}px`);
        }
      } else {
        setContentHeight('0px');
      }
    }
  }, [isExpanded, isHistoryVisible, formatOption, heightTrigger]);

  const caseOptions = Object.values(CaseOption).map((value) => ({
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

  // Handler function to toggle the expansion of FilesFooterBody
  const handleFilesFooterToggle = () => {
    if (isHistoryVisible) {
      setIsHistoryVisible(false); // Switch back to FilesFooterBody
    }
    setIsExpanded((prev) => !prev); // Toggle FilesFooterBody expansion
  };

  // Handler function to toggle the visibility and expansion of HistoryFooterBody
  const handleHistoryToggle = () => {
    if (isHistoryVisible) {
      // Close the footer
      setIsExpanded(false);

      // Wait for the height transition to finish before unmounting
      setTimeout(() => {
        setIsHistoryVisible(false);
      }, transitionDuration);
    } else {
      // Switch to HistoryFooterBody and expand it
      setIsHistoryVisible(true);
      setIsExpanded(true); // Ensure it's expanded
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary-bg">
      {/* Conditionally render FilesFooterBody or HistoryFooterBody based on isHistoryVisible */}
      {!isHistoryVisible ? (
        <FilesFooterBody
          isExpanded={isExpanded}
          handleFilesFooterToggle={handleFilesFooterToggle}
          handleFormatChange={handleFormatChange}
          contentRef={contentRef}
          contentHeight={contentHeight}
          handleHeightChange={handleHeightChange}
        />
      ) : (
        <HistoryFooterBody
          isExpanded={isExpanded}
          handleFilesFooterToggle={handleHistoryToggle}
          contentRef={contentRef}
          contentHeight={contentHeight}
          handleHeightChange={handleHeightChange}
        />
      )}

      <Divider />

      {/* Footer Bottom */}
      <Container space="small">
        <div className="flex items-center justify-between h-12 gap-2">
          {/* History Button */}
          {currentPage === 'upload' && (
            <button
              className="flex items-center gap-1 px-2 py-1 transition-colors ease-in-out rounded cursor-pointer duration-250 text-primary-text hover:bg-selected-bg"
              onClick={handleHistoryToggle} // Switch to HistoryFooterBody or close it if already open
            >
              <HistoryIcon width={20} height={20} /> History
            </button>
          )}
          {/* Case Option */}
          <Dropdown onChange={handleCaseChange} options={caseOptions} value={caseOption} />
          <Button loading={isLoading} onClick={handleExport} disabled={isLoading}>
            {currentPage === 'asset' ? 'Export' : 'Compress'}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default FilesFooter;
