import { h } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** Define the props interface
interface DeleteIconProps {
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
 * @param {DeleteIconProps} props - The properties passed to the component.
 * @returns {JSX.Element} The SVG icon element.
 */
const DeleteIcon: preact.FunctionComponent<DeleteIconProps> = ({
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
    <path d="M3 6L5 6 21 6"></path>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
    <path d="M10 11L10 17"></path>
    <path d="M14 11L14 17"></path>
  </svg>
);

export default DeleteIcon;