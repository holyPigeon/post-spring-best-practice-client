import { createBrowserRouter, type RouteObject } from "react-router";

import { RequireAuth } from "@/auth/require-auth";
import { AdminLayout } from "@/layouts/admin-layout";
import { RootLayout } from "@/layouts/root-layout";
import { AdminUserDetailPage } from "@/routes/admin/admin-user-detail-page";
import { AdminUsersPage } from "@/routes/admin/admin-users-page";
import { HomePage } from "@/routes/home-page";
import { LoginPage } from "@/routes/login-page";
import { NotFoundPage } from "@/routes/not-found-page";
import { RouteError } from "@/routes/route-error";

export const routes = [
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteError />,
  },
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "admin",
        element: <RequireAuth />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminUsersPage />,
              },
              {
                path: "users/:userId",
                element: <AdminUserDetailPage />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
] satisfies RouteObject[];

export const router = createBrowserRouter(routes);
