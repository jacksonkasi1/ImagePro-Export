declare module '*.svg' {
  const content: any;
  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_SERVER_URL?: string;
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
