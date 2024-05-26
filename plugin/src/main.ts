import { on, showUI } from '@create-figma-plugin/utilities'

import { ResizeWindowHandler } from '@/types/events'

export default function () {
  on<ResizeWindowHandler>(
    'RESIZE_WINDOW',
    function (windowSize: { width: number; height: number }) {
      const { width, height } = windowSize
      figma.ui.resize(width, height)
    }
  )
  showUI({
    height: 600,  // Initial height
    width: 800    // Initial width
  })
}
