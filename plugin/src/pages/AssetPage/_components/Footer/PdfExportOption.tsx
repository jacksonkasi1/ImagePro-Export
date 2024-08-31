import { h, JSX } from 'preact';

// ** import figma ui components & icons
import { Container, Text, Button, Dropdown } from '@create-figma-plugin/ui';

// ** import utils
import { cn } from '@/lib/utils';

const PdfExportOption = () => {
  return (
    <Container space="small">
      <div className={'h-10 flex items-center justify-between'}>
        <Text>PdfExportOption</Text>
      </div>
    </Container>
  );
};

export default PdfExportOption;
