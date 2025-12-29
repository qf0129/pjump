import styled from "styled-components";
import React, { useRef, useState } from "react";
import { Tabs, type TabsProps } from "antd";
import { Term } from "./Term";

const TabsContainer = styled.div`
  padding-left: 240px;
  height: 100%;
`;

const Tabss = styled(Tabs)`
  /* background-color: #333a33; */
  .ant-tabs-content {
    height: 100% !important;
    background-color: var(--term-body-bg-1) !important;
  }
  .ant-tabs-nav {
    background-color: var(--term-header-bg) !important;
    border-left: 1px solid var(--term-body-bg-1) !important;
  }
  .ant-tabs-nav::before {
    content: none !important;
  }
  .ant-tabs-tab-active {
    background-color: #1e1e1e !important;
    .ant-tabs-tab-btn {
      color: white !important;
    }
  }
  .ant-tabs-tab-remove {
    color: #ccc;
  }
  .ant-tabs-nav-add {
    color: #fff !important;
    border: none !important;
  }
`;

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

type TabItem = {
  key: string;
  label: string;
  children: React.ReactNode;
};

const initialItems: TabItem[] = [];

const stylesObject: TabsProps["styles"] = {
  item: { border: "none", color: "white" },
  header: { margin: "0", border: "none" },
  content: { height: "100%" },
  root: { height: "100%" },
};

export const TabView = () => {
  const [activeKey, setActiveKey] = useState("");
  const [items, setItems] = useState(initialItems);
  const newTabIndex = useRef(0);

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  const add = () => {
    const newActiveKey = `NewTab-${newTabIndex.current++}`;
    const newPanes = [...items];
    newPanes.push({ key: newActiveKey, label: newActiveKey, children: <Term /> });
    setItems(newPanes);
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey: TargetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    items.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = items.filter((item) => item.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setItems(newPanes);
    setActiveKey(newActiveKey);
  };

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: "add" | "remove") => {
    if (action === "add") {
      add();
    } else {
      remove(targetKey);
    }
  };

  return (
    <TabsContainer>
      <Tabss styles={stylesObject} type="editable-card" onChange={onChange} activeKey={activeKey} onEdit={onEdit} items={items} size="small" />
    </TabsContainer>
  );
};
