import { Navigate, type RouteObject } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import Home from "./pages/personal/home";
import Client from "./pages/personal/client";
import { SignIn } from "./pages/public/SignIn";

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to="/home" replace /> },
  {
    element: <RootLayout />,
    children: [
      { path: "home", element: <Home /> },
      { path: "client/:uid", element: <Client /> },
    ],
  },
  { path: "/signin", element: <SignIn /> },
];
