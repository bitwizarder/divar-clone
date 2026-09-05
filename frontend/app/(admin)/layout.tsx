import type { Metadata } from "next";
import "./../styles/globals.css";
import AdminShell from "../components/ui/admin/AdminShell";

export const metadata: Metadata = {
  title: "پنل ادمین",
  description: "پنل مدیریت",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
