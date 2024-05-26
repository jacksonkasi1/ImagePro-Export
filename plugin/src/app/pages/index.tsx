import React from 'react';

import { Button } from '@/components/ui/button';

import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

function Page() {
  return (
    <ThemeProvider defaultTheme="system"> // leave this 'system' as default, to adopt the system theme automatically
      <div className="flex items-center justify-center h-screen gap-4">
        <ModeToggle />
        <h1 className="text-3xl font-bold text-green-600">Hello World</h1>
        <Button>🌍...</Button>
      </div>
    </ThemeProvider>
  );
}

export default Page;
