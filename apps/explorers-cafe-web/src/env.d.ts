/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WEB_SERVER_URL: string;
  readonly PUBLIC_API_WS_SERVER_URL: string;
  readonly PUBLIC_API_HTTP_SERVER_URL: string;
  readonly PUBLIC_VAPID_PUBLIC_KEY: string;
  readonly VAPID_PRIVATE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
