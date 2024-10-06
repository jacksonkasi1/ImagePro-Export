import { h, Fragment } from 'preact';

// ** import figma ui components & icons
import {
    Bold,
    Container,
    Text,
    IconChevronUp32,
    IconChevronDown32,
    Divider,
    VerticalSpace,
} from '@create-figma-plugin/ui';

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
                    <Text>
                        <Bold>History</Bold>
                    </Text>
                    <button className="rounded-sm text-primary-text">
                        {isExpanded ? <IconChevronDown32 /> : <IconChevronUp32 />}
                    </button>
                </div>
            </Container>

            {/* Footer Middle - Dynamic History Options */}
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
                    <Text>
                        Here is the content related to history. You can load history-related data or any other UI elements here.
                    </Text>
                </Container>
                <VerticalSpace space="small" />
            </div>
        </Fragment>
    );
};

export default HistoryFooterBody;
