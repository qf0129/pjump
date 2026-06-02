import { Outlet } from "react-router";

export const RootLayout = () => {
  return (
    <div style={{ height: "100%" }}>
      <Outlet />
    </div>
  );
};
