import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";
import { App, ConfigProvider, Empty, type GetProp, type ThemeConfig } from "antd";

const customTheme: ThemeConfig = {
  token: {
    // colorPrimary: '#0050b3',
    colorPrimary: "#096dd9",
    borderRadius: 2,
  },
  components: {
    Tabs: {
      cardBg: "rgba(0,0,0,0.06)",
    },
  },
};

const renderEmpty: GetProp<typeof ConfigProvider, "renderEmpty"> = () => {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="" />;
};

const router = createBrowserRouter(routes);
createRoot(document.getElementById("root")!).render(
  <ConfigProvider theme={customTheme} renderEmpty={renderEmpty}>
    <App style={{ height: "100%" }}>
      <RouterProvider router={router} />
    </App>
  </ConfigProvider>,
);
