import { render, useWindowResize } from '@create-figma-plugin/ui'
import { h } from 'preact'
import { emit } from '@create-figma-plugin/utilities'
import '!./output.css'

import { ResizeWindowHandler } from '@/types/events'

function Plugin() {
  function onWindowResize(windowSize: { width: number; height: number }) {
    emit<ResizeWindowHandler>('RESIZE_WINDOW', windowSize)
  }
  
  useWindowResize(onWindowResize, {
    maxHeight: 1000, // Increased maxHeight for flexibility
    maxWidth: 1000,  // Increased maxWidth for flexibility
    minHeight: 160,
    minWidth: 640,
    resizeBehaviorOnDoubleClick: 'minimize'
  })

  return (
    <h1 class="text-3xl font-bold underline">
      Hello, World!
    </h1>
  )
}

export default render(Plugin)
