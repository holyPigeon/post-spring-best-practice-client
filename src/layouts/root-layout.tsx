import { Activity, Bell, Search } from "lucide-react";
import { Link, Outlet } from "react-router";

import { Button } from "@/components/ui/button";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <Activity aria-hidden className="size-5" />
            </span>
            <span>Post Spring</span>
          </Link>
          <nav
            aria-label="주요 메뉴"
            className="hidden items-center gap-1 md:flex"
          >
            <Button asChild variant="ghost" size="sm">
              <Link to="/">워크스페이스</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">릴리즈</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">설정</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="검색">
              <Search aria-hidden className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="알림">
              <Bell aria-hidden className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
