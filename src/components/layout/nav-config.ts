import type { UserRole } from "@/types/database";

export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/teachers", label: "Teachers" },
    { href: "/admin/parents", label: "Parents" },
    { href: "/admin/classes", label: "Classes" },
    { href: "/admin/fees", label: "Fees" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/attendance-reports", label: "Attendance Reports" },
    { href: "/admin/sms-center", label: "SMS Center" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/profile", label: "Profile" },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard" },
    { href: "/teacher/classes", label: "My Classes" },
    { href: "/teacher/attendance", label: "Mark Attendance" },
    { href: "/teacher/attendance/history", label: "Attendance History" },
    { href: "/teacher/profile", label: "Profile" },
  ],
  parent: [
    { href: "/parent/dashboard", label: "Dashboard" },
    { href: "/parent/attendance", label: "Attendance" },
    { href: "/parent/fees", label: "Fees" },
    { href: "/parent/payments", label: "Payment History" },
    { href: "/parent/notices", label: "Notices" },
    { href: "/parent/profile", label: "Profile" },
  ],
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
};
