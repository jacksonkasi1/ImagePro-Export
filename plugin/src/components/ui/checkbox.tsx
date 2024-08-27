import { h, JSX, ComponentChildren } from 'preact';
import { useCallback } from 'preact/hooks';

// ** import utils
import { cn } from '@/lib/utils';

interface CheckboxProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  children?: ComponentChildren;
  disabled?: boolean;
  className?: string; // Allows for dynamic class name prop
}

export const Checkbox = ({
  value,
  onValueChange,
  children,
  disabled = false,
  className = '', // Default to empty string if no className is provided
}: CheckboxProps) => {
  const handleChange = useCallback(
    (event: JSX.TargetedEvent<HTMLInputElement>) => {
      if (!disabled) {
        onValueChange(event.currentTarget.checked);
      }
    },
    [onValueChange, disabled]
  );

  return (
    <label class={cn('flex items-center cursor-pointer w-fit', className)}>
      {/* The native checkbox is hidden but still functional */}
      <input
        type="checkbox"
        checked={value}
        onChange={handleChange}
        disabled={disabled}
        class="hidden peer" // Hide the native checkbox, but keep it in the DOM
      />
      {/* Custom checkbox using a span element */}
      <span
        class={cn(
          'flex items-center justify-center w-3 h-3 border rounded-sm', // Basic size and border
          'border-gray-300 bg-primary-bg peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500', // Focus styles
          value ? 'bg-brand-bg border-brand-bg' : '', // Checked state
          disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'cursor-pointer' // Disabled state
        )}
      >
        {/* Checkmark icon */}
        {value && (
          <svg
            class="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {/* Label text */}
      {children && <span class="ml-2 text-primary-text cursor-pointer">{children}</span>}
    </label>
  );
};
