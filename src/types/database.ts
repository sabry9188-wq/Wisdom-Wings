export type UserRole = "admin" | "teacher" | "parent";
export type AttendanceStatus = "present" | "absent" | "late";
export type FeeStatus = "unpaid" | "partially_paid" | "paid";
export type SmsType = "fee_reminder" | "absence_alert" | "manual";
export type SmsStatus = "queued" | "sent" | "delivered" | "failed";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      app_settings: {
        Row: { key: string; value: string; updated_at: string };
        Insert: { key: string; value: string };
        Update: { key?: string; value?: string };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          name: string;
          section: string | null;
          academic_year: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          section?: string | null;
          academic_year?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
        Relationships: [];
      };
      class_teachers: {
        Row: { class_id: string; teacher_id: string; created_at: string };
        Insert: { class_id: string; teacher_id: string };
        Update: { class_id?: string; teacher_id?: string };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          student_code: string;
          full_name: string;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | null;
          class_id: string | null;
          photo_url: string | null;
          contact_phone: string | null;
          contact_address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_code: string;
          full_name: string;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          class_id?: string | null;
          photo_url?: string | null;
          contact_phone?: string | null;
          contact_address?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [];
      };
      parent_student: {
        Row: {
          parent_id: string;
          student_id: string;
          relationship: string | null;
          is_primary_contact: boolean;
          created_at: string;
        };
        Insert: {
          parent_id: string;
          student_id: string;
          relationship?: string | null;
          is_primary_contact?: boolean;
        };
        Update: {
          relationship?: string | null;
          is_primary_contact?: boolean;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          date: string;
          status: AttendanceStatus;
          marked_by: string;
          marked_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          date: string;
          status: AttendanceStatus;
          marked_by: string;
        };
        Update: { status?: AttendanceStatus };
        Relationships: [];
      };
      fees: {
        Row: {
          id: string;
          student_id: string;
          class_id: string | null;
          title: string;
          amount: number;
          due_date: string;
          status: FeeStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id?: string | null;
          title: string;
          amount: number;
          due_date: string;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["fees"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          fee_id: string;
          receipt_number: string;
          amount: number;
          paid_at: string;
          method: string;
          recorded_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fee_id: string;
          receipt_number?: string;
          amount: number;
          paid_at?: string;
          method?: string;
          recorded_by?: string | null;
          notes?: string | null;
        };
        Update: { notes?: string | null };
        Relationships: [];
      };
      sms_logs: {
        Row: {
          id: string;
          recipient_phone: string;
          recipient_user_id: string | null;
          student_id: string | null;
          type: SmsType;
          message: string;
          status: SmsStatus;
          provider: string | null;
          provider_message_id: string | null;
          error_message: string | null;
          sent_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipient_phone: string;
          recipient_user_id?: string | null;
          student_id?: string | null;
          type: SmsType;
          message: string;
          status?: SmsStatus;
          provider?: string | null;
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_by?: string | null;
        };
        Update: {
          status?: SmsStatus;
          provider_message_id?: string | null;
          error_message?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
