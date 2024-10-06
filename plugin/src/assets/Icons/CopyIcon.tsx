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
   * Optional color for the icon. Defaults to 'currentColor'.
   */
  color?: string;

  /**
   * Optional width for the SVG. Defaults to 20.
   */
  width?: number;

  /**
   * Optional height for the SVG. Defaults to 20.
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
  color = 'currentColor',
  width = 20,
  height = 20,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(className)}
    viewBox="0 0 24 24"
    style={{ margin: '2px' }}
  >
    <rect width="13" height="13" x="9" y="9" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
  </svg>
);

export default CopyIcon;