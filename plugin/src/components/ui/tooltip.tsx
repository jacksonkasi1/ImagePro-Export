import { h, FunctionalComponent, JSX } from 'preact';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// ** import utils
import { cn } from '@/lib/utils';

// ** Define Tooltip Props
interface TooltipProps {
  id: string; // Unique ID for the tooltip
  content: string | JSX.Element; // Tooltip content (text or JSX)
  place?: 'top' | 'bottom' | 'left' | 'right'; // Tooltip placement
  children: JSX.Element; // The element that will trigger the tooltip
  className?: string; // Additional custom classes
}

const Tooltip: FunctionalComponent<TooltipProps> = ({ id, content, place = 'top', children, className }) => {
  return (
    <div>
      {/* Child element that triggers the tooltip */}
      <div data-tooltip-id={id}>{children}</div>

      {/* Tooltip itself */}
      <ReactTooltip
        id={id}
        content={typeof content === 'string' ? content : undefined} // Only pass string to content
        place={place}
        className={cn(className)}

        // style={{
        //   backgroundColor: 'var(--color-primary-bg)',
        //   color: 'var(--color-primary-text)',
        //   padding: '0.5rem',
        //   borderRadius: '0.25rem',
        //   boxShadow: '0 4px 6px var(--figma-color-border)',
        // }}
      >
        {/* Render JSX content if provided */}
        {typeof content !== 'string' && content}
      </ReactTooltip>
    </div>
  );
};

export default Tooltip;
