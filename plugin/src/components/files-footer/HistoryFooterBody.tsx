import { h, Fragment } from 'preact';

// ** import figma ui components & icons
import { Bold, Container, Text, IconChevronUp32, Divider, VerticalSpace, IconInfo32, IconCircleInfo16 } from '@create-figma-plugin/ui';
import HistoryPage from '@/pages/HistoryPage';

// Props for HistoryFooterBody
interface HistoryFooterBodyProps {
  isExpanded: boolean;
  handleFilesFooterToggle: (value: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement>;
  contentHeight: string;
  handleHeightChange: () => void;
}

const HistoryFooterBody = ({
  isExpanded,
  handleFilesFooterToggle,
  contentRef,
  contentHeight,
  handleHeightChange,
}: HistoryFooterBodyProps) => {
  return (
    <Fragment>
      <Divider />
      {/* Footer Top */}
      <Container space="small">
        <div
          className="flex items-center justify-between h-10 cursor-pointer"
          onClick={() => handleFilesFooterToggle(!isExpanded)} // Toggle expansion state
        >
          <div className="flex items-center justify-center gap-1">
            <Text>
              <Bold>History</Bold>
            </Text>
            <CustomTooltip overlay="This is a tooltip!" placement="bottom">
            <IconCircleInfo16 />
            </CustomTooltip>
          </div>

          <button className="rounded-sm text-primary-text">
            {isExpanded ? (
              <Text>
                <span className="cursor-pointer text-danger hover:danger-hover">Close</span>
              </Text>
            ) : (
              <IconChevronUp32 />
            )}
          </button>
        </div>
      </Container>

      {/* Footer Middle - Dynamic History Options */}
      <div
        ref={contentRef}
        style={{
          height: contentHeight,
          overflow: 'hidden',
          transition: 'height 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Divider />
        <VerticalSpace space="small" />
        <div className="flex-1 min-h-full">
          <HistoryPage />
        </div>
        <VerticalSpace space="small" />
      </div>
    </Fragment>
  );
};

export default HistoryFooterBody;
