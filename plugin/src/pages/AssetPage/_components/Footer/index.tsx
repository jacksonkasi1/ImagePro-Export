import { Fragment, h, JSX } from 'preact';

// ** import figma ui components & icons
import { Bold, Container, Text, IconChevronUp32, Divider, Button, Dropdown } from '@create-figma-plugin/ui';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import types
import { CaseOption } from '@/types/enums';

// ** import utils
import { cn } from '@/lib/utils';

const Footer = () => {
  const { caseOption, setCaseOption } = useImageExportStore();

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const caseValue = event.currentTarget.value;
    console.log(caseValue);
    setCaseOption(caseValue as CaseOption);
  }

  const options = Object.values(CaseOption).map((value) => ({
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
          </button>
        </div>
      </Container>
      <Divider />
      <Container space="small">
        <div className="flex items-center justify-between h-12 gap-2">
          <Dropdown
            onChange={handleChange}
            options={options}
            value={caseOption}
          />
          <Button>Export</Button>
        </div>
      </Container>
    </Fragment>
  );
};

export default Footer;
