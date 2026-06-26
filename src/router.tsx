import { createBrowserRouter, type RouteObject } from "react-router";

import { AdminLayout } from "@/layouts/admin-layout";
import { RootLayout } from "@/layouts/root-layout";
import { AdminUserDetailPage } from "@/routes/admin/admin-user-detail-page";
import { AdminUsersPage } from "@/routes/admin/admin-users-page";
import { HomePage } from "@/routes/home-page";
import { RouteError } from "@/routes/route-error";

export const routes = [
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
] satisfies RouteObject[];

export const router = createBrowserRouter(routes);
