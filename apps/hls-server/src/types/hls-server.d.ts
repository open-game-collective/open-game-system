declare module 'hls-server' {
  import { IncomingMessage, ServerResponse, Server } from 'http';
  import { Readable as ReadableStream } from 'stream';

  class HLSServer {
    constructor(server?: Server, opts?: HLSServerOptions);

    attach(server: Server | number, opts?: HLSServerOptions): void;

    // If you don't use these externally, they can be omitted.
    _middleware(
      req: IncomingMessage,
      res: ServerResponse,
      next: Function
    ): void;
    _writeDebugPlayer(res: ServerResponse, next: Function): void;
    _writeManifest(
      req: IncomingMessage,
      res: ServerResponse,
      next: Function
    ): void;
    _writeSegment(
      req: IncomingMessage,
      res: ServerResponse,
      next: Function
    ): void;
  }

  interface HLSServerProvider {
    exists: (
      req: IncomingMessage,
      callback: (error: any, exists: boolean) => void
    ) => void | Promise<void>;
    getManifestStream: (
      req: IncomingMessage,
      callback: (error: any, stream: ReadableStream) => void
    ) => void | Promise<void>;
    getSegmentStream: (
      req: IncomingMessage,
      callback: (error: any, stream: ReadableStream) => void
    ) => void | Promise<void>;
  }

  interface HLSServerOptions {
    path?: string;
    dir?: string;
    debugPlayer?: boolean;
    provider?: HLSServerProvider;
  }

  export = HLSServer;
}
