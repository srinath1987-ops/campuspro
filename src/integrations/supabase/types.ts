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
          driver_name: string
          driver_phone: string
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
          driver_name: string
          driver_phone: string
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
          driver_name?: string
          driver_phone?: string
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
      profiles: {
        Row: {
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
        Args: {
          id: string
        }
        Returns: string
      }
      update_bus_status: {
        Args: {
          rfid_id: string
          event_type: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
