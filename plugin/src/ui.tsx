import { h } from "preact";
import { useEffect } from "preact/hooks";

// ** import utilities
import { emit, on } from "@create-figma-plugin/utilities";

// ** import ui
import { render, useWindowResize } from "@create-figma-plugin/ui";

// ** import css
import "!./output.css";

// ** import types
import { ResizeWindowHandler } from "@/types/events";
import { NodeData } from "@/types/node";

// ** import views
import View from "./views";

// ** import store
import { useImageExportStore } from "@/store";

function Plugin() {
  const {
    setAllNodes,
    setSelectedNodes,
    setAllNodesCount,
    setSelectedNodesCount,
  } = useImageExportStore();


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

  useEffect(() => {
    // Listen for IMAGE nodes data
    on("FETCH_IMAGE_NODES", (data: NodeData[]) => {
      console.log({ length: data.length });
      setAllNodes(data);
      setSelectedNodes(data);
      setAllNodesCount(data.length);
      setSelectedNodesCount(data.length);
    });

    // Cleanup function
    return;
  }, []);

  return <View />;
}

export default render(Plugin);
