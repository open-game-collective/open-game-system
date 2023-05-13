/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
