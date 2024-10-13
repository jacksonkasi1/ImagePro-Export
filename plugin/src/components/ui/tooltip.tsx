import { h, FunctionalComponent, JSX } from 'preact';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

// ** import utils
import { cn } from '@/lib/utils';

// ** Define TriggerAction Type
type TriggerAction = 'hover' | 'click' | 'focus' | 'contextMenu';

// ** Define Tooltip Props
interface CustomTooltipProps {
  placement?: 'top' | 'bottom' | 'left' | 'right'; // Tooltip placement
  trigger?: TriggerAction | TriggerAction[]; // Trigger events, e.g., hover, click
  overlay: JSX.Element | string; // Content inside the tooltip
  children: JSX.Element; // The element that will trigger the tooltip
  arrow?: boolean; // Option to display the arrow
  visible?: boolean; // Control tooltip visibility programmatically
  overlayClassName?: string; // Additional classes for the overlay
}

const CustomTooltip: FunctionalComponent<CustomTooltipProps> = ({
  placement = 'top',
  trigger = ['hover'],
  overlay,
  children,
  arrow = true,
  visible,
  overlayClassName,
}: CustomTooltipProps) => {
  return (
    <Tooltip
      placement={placement}
      trigger={trigger}
      overlay={overlay}
      arrowContent={arrow ? <div className="rc-tooltip-arrow-inner" /> : null}
      visible={visible}
      overlayClassName={cn('bg-primary-bg text-primary-text p-2 rounded shadow-md', overlayClassName)}
    >
      {children}
    </Tooltip>
  );
};

export default CustomTooltip;
