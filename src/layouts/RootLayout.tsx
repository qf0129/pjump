import { Outlet } from "react-router";

export const RootLayout = () => {
  return (
    <div className="root-layout">
      <div>
        <Outlet />
      </div>
    </div>
  );
};
