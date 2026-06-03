import { Navigate, type RouteObject } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import HostPage from "./pages/personal/host/HostPage";
import UserPage from "./pages/personal/user/UserPage";
import { SignIn } from "./pages/personal/public/SignIn";
import ClientPage from "./pages/personal/host/ClientPage";

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to="/host" replace /> },
  {
    element: <RootLayout />,
    children: [
      { path: "host", element: <HostPage /> },
      { path: "user", element: <UserPage /> },
    ],
  },
  { path: "host/:uid", element: <ClientPage /> },
  { path: "/signin", element: <SignIn /> },
];
