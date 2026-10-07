export {};
declare global {
  interface Window {
    HAYClicky?: {
      getSound(): boolean;
      setSound(value: boolean): boolean;
      destroy(): void;
    };
  }
}
