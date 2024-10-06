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
 * DownloadIcon component renders a customizable SVG download icon.
 *
 * @param {DownloadIconProps} props - The properties passed to the component.
 * @returns {JSX.Element} The SVG icon element.
 */
const DownloadIcon: preact.FunctionComponent<DownloadIconProps> = ({
  className,
  color = 'var(--figma-color-text-secondary)',
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
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
    <path d="M7 10L12 15 17 10"></path>
    <path d="M12 15L12 3"></path>
  </svg>
);

export default DownloadIcon;
