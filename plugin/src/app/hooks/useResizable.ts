import { useEffect } from 'react';

interface UseResizableOptions {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export const useResizable = ({ minWidth, maxWidth, minHeight, maxHeight }: UseResizableOptions) => {
  useEffect(() => {
    const resizeHandleRight = document.getElementById('resize-handle-right');
    const resizeHandleBottom = document.getElementById('resize-handle-bottom');
    const wrapper = document.getElementById('wrapper');
    let isResizing = false;

    const onMouseMoveRight = (e) => {
      if (!isResizing) return;
      const width = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      parent.postMessage({ pluginMessage: { type: 'resize', width, height: wrapper.clientHeight } }, '*');
    };

    const onMouseMoveBottom = (e) => {
      if (!isResizing) return;
      const height = Math.max(minHeight, Math.min(maxHeight, e.clientY));
      parent.postMessage({ pluginMessage: { type: 'resize', width: wrapper.clientWidth, height } }, '*');
    };

    const onMouseUp = () => {
      isResizing = false;
      wrapper.classList.remove('no-select');
      document.removeEventListener('mousemove', onMouseMoveRight);
      document.removeEventListener('mousemove', onMouseMoveBottom);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDownRight = () => {
      isResizing = true;
      wrapper.classList.add('no-select');
      document.addEventListener('mousemove', onMouseMoveRight);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseDownBottom = () => {
      isResizing = true;
      wrapper.classList.add('no-select');
      document.addEventListener('mousemove', onMouseMoveBottom);
      document.addEventListener('mouseup', onMouseUp);
    };

    resizeHandleRight.addEventListener('mousedown', onMouseDownRight);
    resizeHandleBottom.addEventListener('mousedown', onMouseDownBottom);

    return () => {
      resizeHandleRight.removeEventListener('mousedown', onMouseDownRight);
      resizeHandleBottom.removeEventListener('mousedown', onMouseDownBottom);
      document.removeEventListener('mousemove', onMouseMoveRight);
      document.removeEventListener('mousemove', onMouseMoveBottom);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [minWidth, maxWidth, minHeight, maxHeight]);
};
