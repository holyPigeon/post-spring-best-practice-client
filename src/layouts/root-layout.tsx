import { Activity, Bell, LogOut, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/ui/button";

export function RootLayout() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = status === "authenticated";
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header ref={headerRef} className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <Activity aria-hidden className="size-5" />
            </span>
            <span>Post Spring</span>
          </Link>

          {isAuthenticated && (
            <nav
              aria-label="주요 메뉴"
              className="hidden items-center gap-1 md:flex"
            >
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin">관리자</Link>
              </Button>
            </nav>
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="검색">
              <Search aria-hidden className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="알림">
              <Bell aria-hidden className="size-4" />
            </Button>
            {isAuthenticated ? (
              <div className="hidden items-center gap-2 pl-1 md:flex">
                <span className="text-sm text-slate-600">{user?.nickname}</span>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  <LogOut aria-hidden className="size-4" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="hidden md:inline-flex"
              >
                <Link to="/login">로그인</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="메뉴"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X aria-hidden className="size-4" />
              ) : (
                <Menu aria-hidden className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="모바일 메뉴"
            className="border-t border-slate-200 px-4 py-3 md:hidden"
          >
            <ul className="space-y-1">
              {isAuthenticated && (
                <li>
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    관리자
                  </Link>
                </li>
              )}
              <li className="pt-1">
                {isAuthenticated ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut aria-hidden className="size-4" />
                    로그아웃
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      로그인
                    </Link>
                  </Button>
                )}
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
