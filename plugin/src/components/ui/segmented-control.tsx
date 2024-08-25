import { h, JSX, ComponentChildren } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { cn } from '@/lib/utils'; // Ensure you have this utility function

interface SegmentedControlProps {
  options: Array<SegmentedControlOption>;
  value?: string;  // Made optional to allow default selection of the first enabled option
  onChange?: (event: JSX.TargetedEvent<HTMLInputElement>) => void;
  onValueChange?: (newValue: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface SegmentedControlOption {
  value: string;
  label?: string;
  disabled?: boolean;
  children?: ComponentChildren;
}

export const SegmentedControl = ({
  options,
  value,
  onChange,
  onValueChange,
  disabled = false,
  className = '',
}: SegmentedControlProps) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);

  // Automatically set the first enabled option as active if no value is provided
  useEffect(() => {
    if (!selectedValue && options.length > 0) {
      const firstEnabledOption = options.find((option) => !option.disabled);
      console.log({firstEnabledOption });
      
      if (firstEnabledOption && onValueChange) {
        onValueChange(firstEnabledOption.value);
        setSelectedValue(firstEnabledOption.value);
      }
    }
  }, [selectedValue, options, onValueChange]);

  const handleChange = useCallback(
    (event: JSX.TargetedEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value;
      setSelectedValue(newValue);
      if (onChange) onChange(event);
      if (onValueChange) onValueChange(newValue);
    },
    [onChange, onValueChange]
  );

  return (
    <div className={cn('inline-flex border border-transparent  border-b-f-border', className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'px-3 py-2 text-sm font-medium cursor-pointer transition-all',
            selectedValue === option.value
              ? 'text-primary-text'
              : 'text-secondary-text dark:hover:text-primary-text',
            option.disabled || disabled ? 'opacity-50 cursor-not-allowed' : ''
          )}
        >
          <input
            type="radio"
            name="segmented-control"
            value={option.value}
            checked={selectedValue === option.value}
            onChange={handleChange}
            disabled={option.disabled || disabled}
            className="sr-only" // Hide the default radio button
          />
          <div className="flex items-center justify-center cursor-pointer">
            {option.children ? option.children : option.label || option.value}
          </div>
        </label>
      ))}
    </div>
  );
};
