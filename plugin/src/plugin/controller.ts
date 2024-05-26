figma.showUI(__html__, { width: 400, height: 300 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'resize') {
    const width = Math.max(300, Math.min(600, msg.width));
    const height = Math.max(200, Math.min(500, msg.height));
    figma.ui.resize(width, height);
  }
};
