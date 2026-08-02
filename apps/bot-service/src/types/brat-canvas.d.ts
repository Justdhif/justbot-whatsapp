declare module 'brat-canvas' {
  export function bratGen(text: string, options?: Record<string, unknown>): Promise<Buffer>;
}

declare module 'brat-canvas/video' {
  export function bratVid(text: string, options?: Record<string, unknown>): Promise<Buffer>;
}