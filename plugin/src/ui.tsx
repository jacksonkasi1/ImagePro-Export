import { render } from '@create-figma-plugin/ui';
import { h } from 'preact';
import '!./styles/output.css';
import Root from './pages';

function Plugin() {
  return <Root />;
}

export default render(Plugin);
