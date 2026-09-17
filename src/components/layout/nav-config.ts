import type { UserRole } from "@/types/database";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Heart,
  School,
  Wallet,
  Receipt,
  ClipboardCheck,
  History,
  MessageSquareText,
  Settings,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: GraduationCap },
    { href: "/admin/teachers", label: "Teachers", icon: Users },
    { href: "/admin/parents", label: "Parents", icon: Heart },
    { href: "/admin/classes", label: "Classes", icon: School },
    { href: "/admin/fees", label: "Fees", icon: Wallet },
    { href: "/admin/payments", label: "Payments", icon: Receipt },
    { href: "/admin/attendance-reports", label: "Attendance Reports", icon: ClipboardCheck },
    { href: "/admin/sms-center", label: "SMS Center", icon: MessageSquareText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/profile", label: "Profile", icon: UserCircle },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "My Classes", icon: School },
    { href: "/teacher/students", label: "Students", icon: GraduationCap },
    { href: "/teacher/attendance", label: "Mark Attendance", icon: ClipboardCheck },
    { href: "/teacher/attendance/history", label: "Attendance History", icon: History },
    { href: "/teacher/profile", label: "Profile", icon: UserCircle },
  ],
  parent: [
    { href: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/parent/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/parent/fees", label: "Fees", icon: Wallet },
    { href: "/parent/payments", label: "Payment History", icon: Receipt },
    { href: "/parent/notices", label: "Notices", icon: MessageSquareText },
    { href: "/parent/profile", label: "Profile", icon: UserCircle },
  ],
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
};
