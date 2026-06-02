import type { Host } from "@/utils/type";
import { SiderView } from "./components/SiderView";
import { TabView, type TabViewRef } from "./components/TabView";
import { useRef } from "react";

export const Work = () => {
  const tabViewRef = useRef<TabViewRef>(null);

  const selectHost = (host: Host) => {
    tabViewRef.current?.addTab(host);
  };
  return (
    <div style={{ height: "100vh" }}>
      <SiderView onSelectHost={selectHost} />
      <TabView ref={tabViewRef} />
    </div>
  );
};
