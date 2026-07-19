"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const isActiveLink = (pathname, href) => {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function AdminSidebarNav({ links }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const active = isActiveLink(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "admin-link admin-link-active" : "admin-link"}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
