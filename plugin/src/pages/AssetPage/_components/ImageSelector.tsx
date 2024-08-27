import { h } from 'preact';
import { useState } from 'preact/hooks';

// ** import figma ui
import { Bold,  Container, Text, VerticalSpace } from '@create-figma-plugin/ui';

// ** import store
import {} from '@/store/use-image-export-store';
import { Checkbox } from '@/components/ui/checkbox';

const ImageSelector = () => {
  const [value, setValue] = useState<boolean>(false);
  function handleValueChange(newValue: boolean) {
    console.log(newValue);
    setValue(newValue);
  }

  return (
    <Container space="small">
      <VerticalSpace space="small" />
      <div>
        <Checkbox onValueChange={handleValueChange} value={value}>
          <Text>
            <Bold> 1/4 exportable assets selected</Bold>
          </Text>
        </Checkbox>
      </div>
      <VerticalSpace space="small" />
    </Container>
  );
};

export default ImageSelector;
