import { JSX, h } from 'preact';

// ** import custom ui components
import { SegmentedControl, SegmentedControlOption } from '@/components/ui/segmented-control';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';

const TabSwitch = () => {
  const { currentPage, setCurrentPage } = useUtilsStore();

  const options: Array<SegmentedControlOption> = [
    {
      value: 'asset',
      label: 'Asset',
    },
    {
      value: 'upload',
      label: 'Upload',
    },
  ];

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value;

    // Sanitize newValue to prevent XSS
    const sanitizedValue = newValue.replace(/[<>]/g, '');
    setCurrentPage(sanitizedValue as 'asset' | 'upload' | 'ai');
  }

  return <SegmentedControl onChange={handleChange} options={options} value={currentPage} />;
};

export default TabSwitch;
