import { createBrowserRouter, type RouteObject } from "react-router";

import { RootLayout } from "@/layouts/root-layout";
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
    ],
  },
] satisfies RouteObject[];

export const router = createBrowserRouter(routes);
