import { useEffect } from 'react';

interface UseResizableOptions {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

const useResizable = ({ minWidth, maxWidth, minHeight, maxHeight }: UseResizableOptions) => {
  useEffect(() => {
    const resizeHandleRight = document.getElementById('resize-handle-right');
    const resizeHandleBottom = document.getElementById('resize-handle-bottom');
    const wrapper = document.getElementById('wrapper');
    let isResizing = false;

    const onMouseMoveRight = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      parent.postMessage({ pluginMessage: { type: 'resize', width: newWidth, height: wrapper.clientHeight } }, '*');
    };

    const onMouseMoveBottom = (e) => {
      if (!isResizing) return;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, e.clientY));
      parent.postMessage({ pluginMessage: { type: 'resize', width: wrapper.clientWidth, height: newHeight } }, '*');
    };

    const onMouseUp = () => {
      isResizing = false;
      wrapper.classList.remove('no-select');
      document.removeEventListener('mousemove', onMouseMoveRight);
      document.removeEventListener('mousemove', onMouseMoveBottom);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const initResize = (handle, direction) => {
      handle.addEventListener('mousedown', () => {
        isResizing = true;
        wrapper.classList.add('no-select');
        document.addEventListener('mousemove', direction === 'right' ? onMouseMoveRight : onMouseMoveBottom);
        document.addEventListener('mouseup', onMouseUp);
      });
    };

    initResize(resizeHandleRight, 'right');
    initResize(resizeHandleBottom, 'bottom');

    return () => {
      document.removeEventListener('mousemove', onMouseMoveRight);
      document.removeEventListener('mousemove', onMouseMoveBottom);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [minWidth, maxWidth, minHeight, maxHeight]);
};

export default useResizable;
