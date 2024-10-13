import { h } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** Define the props interface
interface DownloadIconProps {
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
 * Icon component renders a customizable Download SVG icon.
 *
 * @param {DownloadIconProps} props - The properties passed to the component.
 * @returns {JSX.Element} The SVG icon element.
 */
const DownloadIcon: preact.FunctionComponent<DownloadIconProps> = ({
  className,
  color = 'var(--figma-color-text)',
  width = 24,
  height = 24,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('size-6', className)}
    width={width}
    height={height}
  >
    <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export default DownloadIcon;
