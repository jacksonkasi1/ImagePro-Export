import { Fragment, h, JSX } from 'preact';

// ** import figma ui components & icons
import { Bold, Container, Text, IconChevronUp32, Divider, Button, Dropdown } from '@create-figma-plugin/ui';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import types
import { CaseOption, FormatOption } from '@/types/enums';

// ** import utils
import { cn } from '@/lib/utils';

const Footer = () => {
  const { caseOption, setCaseOption } = useImageExportStore();
  const { formatOption, setFormatOption } = useImageExportStore();

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

  return (
    <Fragment>
      <Divider />
      <Container space="small">
        <div className={'h-10 flex items-center justify-between'}>
          <Text>
            <Bold>Export</Bold>
          </Text>
          <button className={'rounded-sm text-primary-text'}>
            <IconChevronUp32 />
            {/* IconChevronDown32 */}
          </button>
        </div>
      </Container>

      {/* Dynamic Export Options */}
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

      <Divider />
      <Container space="small">
        <div className="flex items-center justify-between h-12 gap-2">
          {/* Case Option */}
          <Dropdown onChange={handleCaseChange} options={caseOptions} value={caseOption} />
          <Button>Export</Button>
        </div>
      </Container>
    </Fragment>
  );
};

export default Footer;
