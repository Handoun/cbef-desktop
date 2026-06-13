/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_PEER_HOST: string;
  readonly VITE_PEER_PORT: string;
  readonly VITE_PEER_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}