import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";
import { App, ConfigProvider, Empty, type GetProp, type ThemeConfig } from "antd";

const customTheme: ThemeConfig = {
  token: {
    colorPrimary: "#0052d9",
    borderRadius: 2,
    colorBgLayout: "#f0f2f5",

    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif`,
  },
  components: {
    // Card: {
    //   borderRadiusLG: 8,
    // },
    Button: {
      borderRadius: 2,
      controlHeight: 36,
    },
    // Table: {
    //   borderRadiusLG: 8,
    // },
    // Modal: {
    //   borderRadiusLG: 8,
    // },
    // Input: {
    //   borderRadius: 6,
    //   controlHeight: 36,
    // },
    // Select: {
    //   borderRadius: 6,
    //   controlHeight: 36,
    // },
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
