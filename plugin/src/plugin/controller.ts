figma.showUI(__html__, { width: 800, height: 600 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'resize') {
    const width = Math.max(640, Math.min(1000, msg.width));
    const height = Math.max(160, Math.min(1000, msg.height));
    figma.ui.resize(width, height);
  }
};
