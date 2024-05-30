import React from 'react';
import { createRoot } from 'react-dom/client';

import '@/styles/ui.css';

import Page from '@/pages';

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('react-page');
  const root = createRoot(container);
  root.render(<Page />);
});
