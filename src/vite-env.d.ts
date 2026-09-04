/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PROXY_TARGET: string;
  readonly VITE_ENABLE_SUPPORT_CODE: string;
  readonly VITE_ENABLE_CASHBACK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
