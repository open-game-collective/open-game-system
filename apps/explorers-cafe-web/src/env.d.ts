/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_WS_SERVER_URL: string;
  readonly PUBLIC_API_HTTP_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
