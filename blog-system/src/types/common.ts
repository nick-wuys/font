import { SupabaseClient } from "@supabase/supabase-js";

export interface KV<T> {
    [key: string]: T;
}

export interface RouteParams {
    params: {
        id: string;
        [key: string]: string;
    };
}

export interface GlobalConfig {
    supabase: SupabaseClient;
}

export enum NODE_ENV {
    dev = "dev",
    sit = "sit",
    uat = "uat",
    prod = "prod",
}
