import { JSX, h } from 'preact';
import { useState } from 'preact/hooks';

// ** import custom ui components
import { SegmentedControl, SegmentedControlOption } from '@/components/ui/segmented-control';

const TabSwitch = () => {
  const [value, setValue] = useState<string>('asset');

  const options: Array<SegmentedControlOption> = [
    {
      value: 'asset',

      label: 'Asset',
    },
  ];

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value;
    console.log(newValue);
    setValue(newValue);
  }
  return <SegmentedControl onChange={handleChange} options={options} value={value} />;
};

export default TabSwitch;
