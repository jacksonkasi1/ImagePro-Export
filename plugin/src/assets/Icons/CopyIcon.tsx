import { h } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** Define the props interface
interface CopyIconProps {
  /**
   * Optional class names to apply to the SVG element.
   */
  className?: string;

  /**
   * Optional color for the icon. Defaults to 'var(--figma-color-text)'.
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
 * Icon component renders a customizable Copy SVG icon.
 *
 * @param {CopyIconProps} props - The properties passed to the component.
 * @returns {JSX.Element} The SVG icon element.
 */
const CopyIcon: preact.FunctionComponent<CopyIconProps> = ({
  className,
  color = 'var(--figma-color-text)',
  width = 24,
  height = 24,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={color}
    viewBox="0 0 24 24"
    className={cn('size-6', className)}
    width={width}
    height={height}
  >
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z" />
  </svg>
);

export default CopyIcon;
