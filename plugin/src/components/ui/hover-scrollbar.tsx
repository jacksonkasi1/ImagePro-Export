import { h, JSX } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

// ** import utils
import { cn } from '@/lib/utils';

interface HoverScrollbarProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element | JSX.Element[];
  thumbClassName?: string; // Optional prop for customizing the thumb style
}

const HoverScrollbar = ({ children, className, thumbClassName, ...rest }: HoverScrollbarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isThumbHovered, setIsThumbHovered] = useState(false); // State to track thumb hover
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false); // Ref to track dragging state
  const startY = useRef(0);
  const startThumbTop = useRef(0);

  const updateThumbPosition = () => {
    if (!containerRef.current || !contentRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const contentHeight = contentRef.current.scrollHeight;
    const scrollTop = contentRef.current.scrollTop;


    // Calculate thumb height based on the container and content height ratio
    let calculatedThumbHeight = (containerHeight / contentHeight) * containerHeight;

    // Ensure the thumb's height does not exceed 98% of the container's height
    const maxThumbHeight = containerHeight * 0.98;
    calculatedThumbHeight = Math.min(calculatedThumbHeight, maxThumbHeight);

    const calculatedThumbTop = (scrollTop / contentHeight) * containerHeight;

    setThumbHeight(calculatedThumbHeight);
    setThumbTop(calculatedThumbTop);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!contentRef.current) return;

    isDragging.current = true; // Set dragging state to true
    startY.current = e.clientY;
    startThumbTop.current = thumbTop;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !contentRef.current || !containerRef.current) return;

    const deltaY = e.clientY - startY.current;
    const newThumbTop = startThumbTop.current + deltaY;

    // Calculate the maximum scrollable height
    const maxThumbTop = containerRef.current.clientHeight - thumbHeight;

    // Ensure the thumb doesn't move out of bounds
    const adjustedThumbTop = Math.max(0, Math.min(maxThumbTop, newThumbTop));
    setThumbTop(adjustedThumbTop);

    // Calculate the corresponding scroll position
    const scrollRatio = adjustedThumbTop / containerRef.current.clientHeight;
    contentRef.current.scrollTop = scrollRatio * contentRef.current.scrollHeight;
  };

  const handleMouseUp = () => {
    isDragging.current = false; // Reset dragging state when mouse is released
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (!contentRef.current) return;

    contentRef.current.addEventListener('scroll', updateThumbPosition);
    updateThumbPosition(); // Initial calculation

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('scroll', updateThumbPosition);
      }
    };
  }, []);

  // Update the thumb position when the component mounts and when content or container changes
  useEffect(() => {
    updateThumbPosition();
  }, [isHovered, children]);

  return (
    <div
      className={cn(
        'relative overflow-hidden group', // Relative positioning and hidden overflow for the container
        className
      )}
      onMouseEnter={() => {
        setIsHovered(true);
        updateThumbPosition(); // Ensure thumb is correctly sized on hover
      }}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
      ref={containerRef}
    >
      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="overflow-y-auto"
        style={{
          scrollbarWidth: 'none', // Hide scrollbar track in Firefox
          msOverflowStyle: 'none', // Hide scrollbar track in IE/Edge
          position: 'relative', // Needed for absolute positioning of scrollbar thumb
        }}
      >
        {children}
      </div>
      {/* Overlay scrollbar thumb for WebKit browsers */}
      {(isHovered || isDragging.current) &&
        thumbHeight > 0 && ( // Ensure thumb height is calculated and valid
          <div
            className={thumbClassName}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsThumbHovered(true)} // Set thumb hover state
            onMouseLeave={() => setIsThumbHovered(false)} // Reset thumb hover state
            style={{
              position: 'absolute',
              right: '2px',
              top: `${thumbTop}px`, // Position dynamically based on scroll
              width: '8px',
              height: `${thumbHeight}px`, // Dynamically set the thumb height
              borderRadius: '4px', // Rounded corners for scrollbar thumb
              backgroundColor:
                isThumbHovered || isDragging.current
                  ? 'var(--figma-color-border-disabled-strong)' // Highlight color when dragging or hovered
                  : 'var(--figma-color-border)', // Default color
              transition: 'opacity 0.3s, background-color 0.3s', // Smooth transition for opacity and color
              opacity: isHovered || isDragging.current ? 1 : 0, // Keep visible if hovered or dragging
              pointerEvents: 'auto', // Ensures thumb can be interacted with
              // zIndex: 1000, // Ensure thumb is above other content
            }}
          />
        )}
    </div>
  );
};

export default HoverScrollbar;
