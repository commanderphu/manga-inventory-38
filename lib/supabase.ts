import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      manga: {
        Row: {
          id: string
          titel: string
          band: string | null
          genre: string | null
          autor: string | null
          verlag: string | null
          isbn: string | null
          sprache: string | null
          cover_image: string | null
          read: boolean | null
          double: boolean | null
          newbuy: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          titel: string
          band?: string | null
          genre?: string | null
          autor?: string | null
          verlag?: string | null
          isbn?: string | null
          sprache?: string | null
          cover_image?: string | null
          read?: boolean | null
          double?: boolean | null
          newbuy?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          titel?: string
          band?: string | null
          genre?: string | null
          autor?: string | null
          verlag?: string | null
          isbn?: string | null
          sprache?: string | null
          cover_image?: string | null
          read?: boolean | null
          double?: boolean | null
          newbuy?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
