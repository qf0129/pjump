import { lazy, Suspense } from "react";
import { Navigate, type RouteObject } from "react-router";
import { Spin } from "antd";
import { RootLayout } from "./layouts/RootLayout";
import HostPage from "./pages/host/HostPage";

const userPageImport = () => import("./pages/user/UserPage");
const signInImport = () => import("./pages/public/SignIn");
const clientPageImport = () => import("./pages/host/ClientPage");
const workPageImport = () => import("./pages/work/WorkPage");

const UserPage = lazy(userPageImport);
const SignIn = lazy(signInImport);
const ClientPage = lazy(clientPageImport);
const WorkPage = lazy(workPageImport);

/** 预加载 chunk（hover 时调用，不阻塞当前页面） */
export function preload(importFn: () => Promise<any>) {
  importFn();
}

/** 可按需预加载的页面模块 */
export const preloads = {
  userPage: userPageImport,
  clientPage: clientPageImport,
  workPage: workPageImport,
  signIn: signInImport,
};

const fallback = (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      minHeight: 200,
    }}
  >
    <Spin size="large" />
  </div>
);

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to="/host" replace /> },
  {
    element: <RootLayout />,
    children: [
      { path: "host", element: <HostPage /> },
      {
        path: "user",
        element: (
          <Lazy>
            <UserPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: "host/:uid",
    element: (
      <Lazy>
        <ClientPage />
      </Lazy>
    ),
  },
  {
    path: "/signin",
    element: (
      <Lazy>
        <SignIn />
      </Lazy>
    ),
  },
  {
    path: "/work",
    element: (
      <Lazy>
        <WorkPage />
      </Lazy>
    ),
  },
];
