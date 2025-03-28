/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean
  // Add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 