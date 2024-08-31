import { Fragment, h, JSX } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

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

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import types
import { CaseOption, FormatOption } from '@/types/enums';

const Footer = () => {
  const [isExpanded, setIsExpanded] = useState(false); // State to manage footer expansion
  const [contentHeight, setContentHeight] = useState('0px');
  const contentRef = useRef<HTMLDivElement>(null);

  const { caseOption, setCaseOption, formatOption, setFormatOption } = useImageExportStore();

  function handleCaseChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const caseValue = event.currentTarget.value;
    setCaseOption(caseValue as CaseOption);
  }

  function handleFormatChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const formatValue = event.currentTarget.value;
    setFormatOption(formatValue as FormatOption);
  }

  const caseOptions = Object.values(CaseOption).map((value) => ({
    value,
    text: value,
  }));

  const formatOptions = Object.values(FormatOption).map((value) => ({
    value,
    text: value,
  }));

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isExpanded]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-auto bg-primary-bg">
      <Fragment>
        <Divider />
        {/* Footer Top */}
        <Container space="small">
          <div className={'h-10 flex items-center justify-between'}>
            <Text>
              <Bold>Export</Bold>
            </Text>
            <button
              className={'rounded-sm text-primary-text'}
              onClick={() => setIsExpanded(!isExpanded)} // Toggle expansion state
            >
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
          <VerticalSpace space="small" />
          <Container space="small">
            <div className="grid items-center grid-cols-4 gap-2">
              <Text>
                <Bold>Format</Bold>
              </Text>
              <div className="col-span-3">
                <Dropdown onChange={handleFormatChange} options={formatOptions} value={formatOption} />
              </div>
            </div>
          </Container>
          <VerticalSpace space="small" />
        </div>

        <Divider />

        {/* Footer Bottom */}
        <Container space="small">
          <div className="flex items-center justify-between h-12 gap-2">
            {/* Case Option */}
            <Dropdown onChange={handleCaseChange} options={caseOptions} value={caseOption} />
            <Button>Export</Button>
          </div>
        </Container>
      </Fragment>
    </div>
  );
};

export default Footer;
