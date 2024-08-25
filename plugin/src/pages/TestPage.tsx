import { Fragment, h } from 'preact';

import { Divider, Text } from '@create-figma-plugin/ui';

const TestPage = () => {
  return (
    <Fragment>
      <div className="p-4 space-y-2 rounded bg-primary-bg">
        <Text>This is a primary text.</Text>
        <Divider />
        <p>This text will automatically switch colors based on the theme!</p>
      </div>

      <div className="p-4 rounded bg-active-bg text-primary-text">This is a secondary styled element.</div>

      <div className="p-4 rounded text-secondary-text">This is a secondary text.</div>
    </Fragment>
  );
};

export default TestPage;
