import { h } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** Define the props interface
interface DragIconProps {
  /**
   * Optional class names to apply to the SVG element.
   */
  className?: string;

  /**
   * Optional color for the icon. Defaults to 'var(--figma-color-text-secondary)'.
   */
  color?: string;

  /**
   * Optional width for the SVG. Defaults to 24.
   */
  width?: number;

  /**
   * Optional height for the SVG. Defaults to 24.
   */
  height?: number;
}

/**
 * Icon component renders a customizable SVG icon.
 *
 * @param {DragIconProps} props - The properties passed to the component.
 * @returns {JSX.Element} The SVG icon element.
 */
const DragIcon: preact.FunctionComponent<DragIconProps> = ({ className, color = 'var(--figma-color-text-secondary)', width = 24, height = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
      className={cn(className)}
    >
      <path
        fill={color}
        d="M8 6a2 2 0 100-4 2 2 0 000 4zM8 14a2 2 0 100-4 2 2 0 000 4zM8 22a2 2 0 100-4 2 2 0 000 4zM16 6a2 2 0 100-4 2 2 0 000 4zM16 14a2 2 0 100-4 2 2 0 000 4zM16 22a2 2 0 100-4 2 2 0 000 4z"
      />
    </svg>
  );
};

export default DragIcon;
