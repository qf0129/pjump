import { Navigate, type RouteObject } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { SignIn } from "./pages/public/SignIn";
import { Work } from "./pages/work/Work";
import { Console } from "./pages/console/Console";

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to="/work" replace /> },
  {
    element: <RootLayout />,
    children: [
      { path: "signin", element: <SignIn /> },
      { path: "work", element: <Work /> },
      { path: "console", element: <Console /> },
    ],
  },
];
