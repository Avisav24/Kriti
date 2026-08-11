/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCESS_PASSPHRASE_HASH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
