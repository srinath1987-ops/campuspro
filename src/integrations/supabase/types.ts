export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bus_details: {
        Row: {
          bus_capacity: number
          bus_number: string
          driver_name: string | null
          driver_phone: string | null
          in_campus: boolean
          in_time: string | null
          last_updated: string
          out_time: string | null
          rfid_id: string
          start_point: string
        }
        Insert: {
          bus_capacity: number
          bus_number: string
          driver_name?: string | null
          driver_phone?: string | null
          in_campus?: boolean
          in_time?: string | null
          last_updated?: string
          out_time?: string | null
          rfid_id: string
          start_point: string
        }
        Update: {
          bus_capacity?: number
          bus_number?: string
          driver_name?: string | null
          driver_phone?: string | null
          in_campus?: boolean
          in_time?: string | null
          last_updated?: string
          out_time?: string | null
          rfid_id?: string
          start_point?: string
        }
        Relationships: []
      }
      bus_routes: {
        Row: {
          bus_number: string | null
          id: number
          rfid_id: string | null
          route_no: string
          stops: Json
          via: string | null
        }
        Insert: {
          bus_number?: string | null
          id?: number
          rfid_id?: string | null
          route_no: string
          stops: Json
          via?: string | null
        }
        Update: {
          bus_number?: string | null
          id?: number
          rfid_id?: string | null
          route_no?: string
          stops?: Json
          via?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_routes_bus_number_fkey"
            columns: ["bus_number"]
            isOneToOne: false
            referencedRelation: "bus_details"
            referencedColumns: ["bus_number"]
          },
          {
            foreignKeyName: "bus_routes_rfid_id_fkey"
            columns: ["rfid_id"]
            isOneToOne: false
            referencedRelation: "bus_details"
            referencedColumns: ["rfid_id"]
          },
        ]
      }
      bus_student_count: {
        Row: {
          bus_number: string
          date: string
          id: number
          rfid_id: string | null
          student_count: number
          time: string
        }
        Insert: {
          bus_number: string
          date: string
          id?: number
          rfid_id?: string | null
          student_count: number
          time: string
        }
        Update: {
          bus_number?: string
          date?: string
          id?: number
          rfid_id?: string | null
          student_count?: number
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_student_count_bus_number_fkey"
            columns: ["bus_number"]
            isOneToOne: false
            referencedRelation: "bus_details"
            referencedColumns: ["bus_number"]
          },
          {
            foreignKeyName: "bus_student_count_rfid_id_fkey"
            columns: ["rfid_id"]
            isOneToOne: false
            referencedRelation: "bus_details"
            referencedColumns: ["rfid_id"]
          },
        ]
      }
      bus_times: {
        Row: {
          bus_number: string
          created_at: string
          date_in: string | null
          date_out: string | null
          id: number
          in_time: string | null
          out_time: string | null
          rfid_id: string | null
        }
        Insert: {
          bus_number: string
          created_at?: string
          date_in?: string | null
          date_out?: string | null
          id?: number
          in_time?: string | null
          out_time?: string | null
          rfid_id?: string | null
        }
        Update: {
          bus_number?: string
          created_at?: string
          date_in?: string | null
          date_out?: string | null
          id?: number
          in_time?: string | null
          out_time?: string | null
          rfid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_times_bus_number_fkey"
            columns: ["bus_number"]
            isOneToOne: false
            referencedRelation: "bus_details"
            referencedColumns: ["bus_number"]
          },
          {
            foreignKeyName: "bus_times_rfid_id_fkey"
            columns: ["rfid_id"]
            isOneToOne: false
            referencedRelation: "bus_details"
            referencedColumns: ["rfid_id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_notes: string | null
          bus_number: string | null
          created_at: string
          email: string
          feedback_type: string
          id: number
          message: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          bus_number?: string | null
          created_at?: string
          email: string
          feedback_type: string
          id?: number
          message: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          bus_number?: string | null
          created_at?: string
          email?: string
          feedback_type?: string
          id?: number
          message?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bus_number: string | null
          created_at: string
          email: string
          id: string
          last_login: string | null
          phone_number: string
          role: Database["public"]["Enums"]["app_role"]
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bus_number?: string | null
          created_at?: string
          email: string
          id: string
          last_login?: string | null
          phone_number: string
          role: Database["public"]["Enums"]["app_role"]
          username: string
        }
        Update: {
          avatar_url?: string | null
          bus_number?: string | null
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          phone_number?: string
          role?: Database["public"]["Enums"]["app_role"]
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_bus_number_fkey"
            columns: ["bus_number"]
            isOneToOne: false
            referencedRelation: "bus_details"
            referencedColumns: ["bus_number"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      update_bus_status: {
        Args: { rfid_id: string; event_type: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "driver"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "driver"],
    },
  },
} as const
