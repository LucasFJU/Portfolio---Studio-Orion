export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          assunto: string | null
          created_at: string
          email: string
          id: string
          mensagem: string | null
          nome: string
          tipo_projeto: string | null
        }
        Insert: {
          assunto?: string | null
          created_at?: string
          email: string
          id?: string
          mensagem?: string | null
          nome: string
          tipo_projeto?: string | null
        }
        Update: {
          assunto?: string | null
          created_at?: string
          email?: string
          id?: string
          mensagem?: string | null
          nome?: string
          tipo_projeto?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          categoria: string
          created_at: string
          data_publicacao: string | null
          descricao: string | null
          destaque: boolean | null
          galeria: string[] | null
          id: string
          imagem_capa: string | null
          link_projeto: string | null
          status: string | null
          tags: string[] | null
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          destaque?: boolean | null
          galeria?: string[] | null
          id?: string
          imagem_capa?: string | null
          link_projeto?: string | null
          status?: string | null
          tags?: string[] | null
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          destaque?: boolean | null
          galeria?: string[] | null
          id?: string
          imagem_capa?: string | null
          link_projeto?: string | null
          status?: string | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposal_views: {
        Row: {
          id: string
          proposal_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_views_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          cliente_email: string | null
          cliente_empresa: string | null
          cliente_nome: string
          created_at: string
          formas_pagamento: Json
          id: string
          introducao: string | null
          observacoes: string | null
          prazo_entrega: string | null
          processo: Json
          projeto_ids: string[]
          slug: string
          status: string
          titulo: string
          updated_at: string
          validade_dias: number
          valor_total: number | null
        }
        Insert: {
          cliente_email?: string | null
          cliente_empresa?: string | null
          cliente_nome: string
          created_at?: string
          formas_pagamento?: Json
          id?: string
          introducao?: string | null
          observacoes?: string | null
          prazo_entrega?: string | null
          processo?: Json
          projeto_ids?: string[]
          slug: string
          status?: string
          titulo: string
          updated_at?: string
          validade_dias?: number
          valor_total?: number | null
        }
        Update: {
          cliente_email?: string | null
          cliente_empresa?: string | null
          cliente_nome?: string
          created_at?: string
          formas_pagamento?: Json
          id?: string
          introducao?: string | null
          observacoes?: string | null
          prazo_entrega?: string | null
          processo?: Json
          projeto_ids?: string[]
          slug?: string
          status?: string
          titulo?: string
          updated_at?: string
          validade_dias?: number
          valor_total?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          autor: string
          cargo: string
          empresa: string
          depoimento: string
          destaque_frase: string | null
          nota: number
          avatar_url: string | null
          categoria: string | null
          fileira: string | null
          ativo: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          autor: string
          cargo: string
          empresa: string
          depoimento: string
          destaque_frase?: string | null
          nota?: number
          avatar_url?: string | null
          categoria?: string | null
          fileira?: string | null
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          autor?: string
          cargo?: string
          empresa?: string
          depoimento?: string
          destaque_frase?: string | null
          nota?: number
          avatar_url?: string | null
          categoria?: string | null
          fileira?: string | null
          ativo?: boolean
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
