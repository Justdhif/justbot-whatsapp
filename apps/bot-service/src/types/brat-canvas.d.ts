declare module 'brat-canvas' {
  export function bratGen(text: string, options?: Record<string, unknown>): Promise<Buffer>;
}

declare module 'brat-canvas/video' {
  export function bratVid(text: string, options?: Record<string, unknown>): Promise<Buffer>;
}

declare module 'iqc-canvas' {
  export interface IQCOptions {
    baterai?: [boolean, string];
    operator?: boolean;
    timebar?: boolean;
    wifi?: boolean;
  }
  export function generateIQC(
    text: string,
    time: string,
    options?: IQCOptions
  ): Promise<Buffer>;
}