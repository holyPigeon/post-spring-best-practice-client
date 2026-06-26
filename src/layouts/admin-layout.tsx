import { Users } from "lucide-react";
import { NavLink, Outlet } from "react-router";

import { cn } from "@/lib/utils";

const navItems = [{ to: "/admin", label: "사용자", icon: Users, end: true }];

export function AdminLayout() {
  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside>
        <p className="px-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          관리자
        </p>
        <nav className="mt-3 space-y-1" aria-label="관리자 메뉴">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                )
              }
            >
              <item.icon aria-hidden className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
