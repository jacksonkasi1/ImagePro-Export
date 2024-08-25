import { JSX, h } from 'preact';
import { useState } from 'preact/hooks';

import { SegmentedControl, SegmentedControlOption } from '@/components/ui/segmented-control';

const TabSwitch = () => {
  const [value, setValue] = useState<string>('foo');
  const options: Array<SegmentedControlOption> = [
    {
      value: 'foo',
      label: 'Asset',
    },
  ];
  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value;
    console.log(newValue);
    setValue(newValue);
  }
  return <SegmentedControl onChange={handleChange} options={options} value={value} className="w-full" />;
};

export default TabSwitch;
