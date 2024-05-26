import React from 'react';

import { Button } from '@/components/ui/button';

import { ThemeProvider } from "@/components/theme-provider"

function Page() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-300">Hello World</h1>
      <Button>Hello</Button>
    </div>
    </ThemeProvider>
  );
}

export default Page;
