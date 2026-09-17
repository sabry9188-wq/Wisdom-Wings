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
      // (Relationships arrays below describe FKs so PostgREST embedded
      // selects like `.select("*, students(full_name)")` type-check.)
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
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "parent_student_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parent_student_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_marked_by_fkey";
            columns: ["marked_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "fees_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fees_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fees_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "payments_fee_id_fkey";
            columns: ["fee_id"];
            isOneToOne: false;
            referencedRelation: "fees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "sms_logs_recipient_user_id_fkey";
            columns: ["recipient_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sms_logs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sms_logs_sent_by_fkey";
            columns: ["sent_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
