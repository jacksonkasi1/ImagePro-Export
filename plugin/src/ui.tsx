import { h } from "preact";
import { emit } from "@create-figma-plugin/utilities";

// ** import ui
import { render, useWindowResize } from "@create-figma-plugin/ui";

// ** import css
import "!./output.css";

// ** import views
import View from "./views";

// ** import types
import { ResizeWindowHandler } from "@/types/events";

function Plugin() {
  function onWindowResize(windowSize: { width: number; height: number }) {
    emit<ResizeWindowHandler>("RESIZE_WINDOW", windowSize);
  }

  useWindowResize(onWindowResize, {
    maxHeight: 1000, // Increased maxHeight for flexibility
    maxWidth: 1000, // Increased maxWidth for flexibility
    minHeight: 160,
    minWidth: 640,
    resizeBehaviorOnDoubleClick: "minimize",
  });

  return <View />;
}

export default render(Plugin);
