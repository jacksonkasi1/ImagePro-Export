import { render } from '@create-figma-plugin/ui';
import { h } from 'preact';
import '!./styles/output.css';
import Root from './pages';
import { FetchImageNodesHandler } from './types/events';
import { on } from '@create-figma-plugin/utilities';
import { useEffect } from 'preact/hooks';

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
