import { h, JSX } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** import custom ui
import Spinner from './spinner';

// ** Define the props interface
interface IconButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  /**
   * Optional variant for hover effect. Defaults to 'blank' (no hover effect).
   */
  variant?: 'hover' | 'blank';

  /**
   * If true, the button is active, which can visually distinguish the button.
   */
  isActive?: boolean;

  /**
   * If true, the button will have animation on click.
   */
  animate?: boolean;

  /**
   * If true, the button will show a loading spinner instead of its children, and be disabled.
   */
  loading?: boolean;
}

/**
 * IconButton component renders a button with an icon or component element.
 * It supports hover effects, loading state, and can adapt to light/dark themes.
 *
 * @param {IconButtonProps} props - The properties passed to the component.
 * @returns {JSX.Element} The button element.
 */
export const IconButton: preact.FunctionComponent<IconButtonProps> = ({
  variant = 'blank',
  isActive,
  animate,
  loading,
  children,
  ...props
}) => {
  // ** Define conditional classes for hover, active, and animation states
  const animationClasses = animate ? 'transform transition-transform duration-150 ease-in-out active:scale-95' : '';

  return (
    <button
      {...props} // ** Spread standard button attributes
      disabled={loading || props.disabled} // ** Disable button when loading or explicitly disabled
      className={cn(
        'flex items-center justify-center p-2 rounded cursor-pointer',
        animationClasses, // ** Apply animation classes if animate is true
        variant === 'hover' ? 'hover:bg-gray-100 dark:hover:bg-btn-bg-dark' : '',
        loading ? 'cursor-not-allowed opacity-70' : '', // ** Loading styles
        props.className // ** Combine with any className passed in props
      )}
      onClick={loading ? undefined : props.onClick} // ** Disable onClick when loading
    >
      {loading ? (
        <div class="grid min-h-fit w-full place-items-center overflow-hidden rounded-lg">
          <Spinner className="size-5" />
        </div>
      ) : (
        <span className={isActive ? 'text-current font-bold' : 'text-current'}>{children}</span>
      )}
    </button>
  );
};

export default IconButton;
