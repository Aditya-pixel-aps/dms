import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createFallbackClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({
      data: null,
      error: { message: "Supabase is not configured. Add your environment variables." },
    }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: null,
          error: { message: "Supabase is not configured. Add your environment variables." },
        }),
      }),
    }),
  }),
});

export const supabase =
supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createFallbackClient() as unknown as ReturnType<typeof createClient>);