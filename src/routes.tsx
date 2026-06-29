import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router';
import { Spin } from 'antd';
import { RootLayout } from './layouts/RootLayout';
import { ConsoleLayout } from './layouts/ConsoleLayout';
import HostPage from './pages/host/HostPage';

const hostManagePageImport = () => import('./pages/host/HostManagePage');
const userPageImport = () => import('./pages/user/UserPage');
const signInImport = () => import('./pages/public/SignIn');
const clientPageImport = () => import('./pages/host/ClientPage');
const workPageImport = () => import('./pages/work/WorkPage');
const sessionAuditPageImport = () => import('./pages/audit/AuditPage').then((mod) => ({ default: mod.SessionAuditPage }));
const operationAuditPageImport = () => import('./pages/audit/AuditPage').then((mod) => ({ default: mod.OperationAuditPage }));
const loginAuditPageImport = () => import('./pages/audit/AuditPage').then((mod) => ({ default: mod.LoginAuditPage }));
const accessGroupPageImport = () => import('./pages/access-group/AccessGroupPage');

const HostManagePage = lazy(hostManagePageImport);
const UserPage = lazy(userPageImport);
const SignIn = lazy(signInImport);
const ClientPage = lazy(clientPageImport);
const WorkPage = lazy(workPageImport);
const SessionAuditPage = lazy(sessionAuditPageImport);
const OperationAuditPage = lazy(operationAuditPageImport);
const LoginAuditPage = lazy(loginAuditPageImport);
const AccessGroupPage = lazy(accessGroupPageImport);

/** 预加载 chunk（hover 时调用，不阻塞当前页面） */
export function preload(importFn: () => Promise<any>) {
  importFn();
}

/** 可按需预加载的页面模块 */
export const preloads = {
  hostManagePage: hostManagePageImport,
  userPage: userPageImport,
  clientPage: clientPageImport,
  workPage: workPageImport,
  sessionAuditPage: sessionAuditPageImport,
  operationAuditPage: operationAuditPageImport,
  loginAuditPage: loginAuditPageImport,
  accessGroupPage: accessGroupPageImport,
  signIn: signInImport,
};

const fallback = (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 200,
    }}
  >
    <Spin size="large" />
  </div>
);

const Lazy = ({ children }: { children: React.ReactNode }) => <Suspense fallback={fallback}>{children}</Suspense>;

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to="/host" replace /> },
  {
    element: <RootLayout />,
    children: [
      { path: 'host', element: <HostPage /> },
      {
        path: 'console',
        element: <ConsoleLayout />,
        children: [
          { index: true, element: <Navigate to="/console/host" replace /> },
          {
            path: 'host',
            element: (
              <Lazy>
                <HostManagePage />
              </Lazy>
            ),
          },
          {
            path: 'user',
            element: (
              <Lazy>
                <UserPage />
              </Lazy>
            ),
          },
          {
            path: 'access-group',
            element: (
              <Lazy>
                <AccessGroupPage />
              </Lazy>
            ),
          },
          {
            path: 'audit',
            children: [
              { index: true, element: <Navigate to="/console/audit/session" replace /> },
              {
                path: 'session',
                element: (
                  <Lazy>
                    <SessionAuditPage />
                  </Lazy>
                ),
              },
              {
                path: 'operation',
                element: (
                  <Lazy>
                    <OperationAuditPage />
                  </Lazy>
                ),
              },
              {
                path: 'login',
                element: (
                  <Lazy>
                    <LoginAuditPage />
                  </Lazy>
                ),
              },
            ],
          },
        ],
      },
      {
        path: 'user',
        element: <Navigate to="/console/user" replace />,
      },
      {
        path: 'access-group',
        element: <Navigate to="/console/access-group" replace />,
      },
      {
        path: 'audit',
        element: <Navigate to="/console/audit/session" replace />,
      },
    ],
  },
  {
    path: 'host/:uid',
    element: (
      <Lazy>
        <ClientPage />
      </Lazy>
    ),
  },
  {
    path: '/signin',
    element: (
      <Lazy>
        <SignIn />
      </Lazy>
    ),
  },
  {
    path: '/work',
    element: (
      <Lazy>
        <WorkPage />
      </Lazy>
    ),
  },
];
