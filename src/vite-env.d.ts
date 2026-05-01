/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NVIDIA_API_KEY: string
  readonly VITE_NVIDIA_BASE_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENCODE_API_URL: string
  readonly VITE_OPENCODE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
