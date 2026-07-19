import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Image from "next/image";

import { authOptions } from "../api/auth/[...nextauth]/route";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import AdminNavbar from "@/components/admin/AdminNavbar";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
 
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  // { href: "/admin/carts", label: "Carts" },
  { href: "/admin/orders", label: "Orders" },
   { href: "/admin/users", label: "Users" },
  { href: "/admin/hero-slider", label: "Hero Slider" },
  { href: "/admin/settings", label: "App Settings" }
];

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <section id="admin-theme-root" className="admin-theme admin-light min-h-screen text-stone-800">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="admin-sidebar border-b p-6 backdrop-blur-sm lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-red-800">Admin Console</p>
            <Image src="/logo.png" alt="YUMA Ecommerce" width={180} height={72} className="h-auto w-auto" priority />
          </div>

          <AdminSidebarNav links={adminLinks} />
        </aside>

        <div className="admin-main">
          <AdminNavbar user={session.user} />
          <main className="p-6 md:p-10">{children}</main>
        </div>
      </div>
    </section>
  );
}
