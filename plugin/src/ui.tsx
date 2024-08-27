import { h } from 'preact';
import { useEffect } from 'preact/hooks';

// ** import figma utils & ui
import { on } from '@create-figma-plugin/utilities';
import { render } from '@create-figma-plugin/ui';

// ** import pages & style
import '!./styles/output.css';
import Root from './pages';

// ** import types
import { FetchImageNodesHandler } from './types/events';

function Plugin() {
  useEffect(() => {
    on<FetchImageNodesHandler>('FETCH_IMAGE_NODES', (image_nodes) => {
      console.log(image_nodes);
    });
    // cleanup
    return;
  }, []);

  return <Root />;
}

export default render(Plugin);
