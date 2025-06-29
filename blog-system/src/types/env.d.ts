import { KV, NODE_ENV } from "./common";

interface window extends Window {
  ENV: KV;
}

declare namespace NodeJS {
  export interface ProcessEnv {
    ENV: NODE_ENV;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
  }
}
