import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell min-h-screen">
      <AdminSidebar />
      <main className="min-h-screen pl-64">{children}</main>
    </div>
  );
}
