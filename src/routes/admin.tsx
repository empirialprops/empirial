import { createFileRoute, Outlet } from "@tanstack/react-router";
import AdminLayout from "@/app/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin | EMPIRIAL" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});
