import { h } from 'preact';
import { useEffect } from 'preact/hooks';

// ** import figma utils & ui
import { on } from '@create-figma-plugin/utilities';
import { render } from '@create-figma-plugin/ui';

// ** import pages & style
import '!./styles/output.css';
import Root from '@/pages';

// ** import types
import { FetchImageNodesHandler } from '@/types/events';

// ** import store
import { useImageNodesStore } from '@/store/use-image-nodes-store';

function Plugin() {
  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();

  useEffect(() => {
    on<FetchImageNodesHandler>('FETCH_IMAGE_NODES', (image_nodes) => {
      setAllNodes(image_nodes);
      setAllNodesCount(image_nodes.length);
      setSelectedNodeIds([]);
      setSelectedNodesCount(0);
    });
    // cleanup
    return;
  }, []);

  return <Root />;
}

export default render(Plugin);
