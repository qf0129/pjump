import type { Host } from "@/utils/type";
import { SiderView } from "./components/SiderView";
import { TabView, type TabViewRef } from "./components/TabView";
import { useRef } from "react";

export default function WorkPage() {
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
}
