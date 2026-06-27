import styled from 'styled-components';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { Tabs, type TabsProps } from 'antd';
import { Term } from './Term';
import type { Host } from '@/utils/type';

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
    :hover {
      color: white !important;
    }
  }
  .ant-tabs-nav-more {
    color: white !important;
  }
`;

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

type TabItem = {
  key: string;
  label: string;
  children: React.ReactNode;
};

const initialItems: TabItem[] = [];

const stylesObject: TabsProps['styles'] = {
  item: { border: 'none', color: 'white' },
  header: { margin: '0', border: 'none' },
  content: { height: '100%' },
  root: { height: '100%' },
};

export interface TabViewRef {
  addTab: (host: Host) => void;
}

type TabViewProps = {
  ref: React.Ref<TabViewRef>;
};

export const TabView = ({ ref }: TabViewProps) => {
  const [activeKey, setActiveKey] = useState('');
  const [items, setItems] = useState(initialItems);
  const newTabIndex = useRef(0);

  useImperativeHandle(ref, () => ({
    addTab: (host: Host) => {
      const newActiveKey = `${host.Name}-${newTabIndex.current++}`;
      const newPanes = [...items];
      newPanes.push({
        key: newActiveKey,
        label: host.Name || host.Ip || host.Uid || '',
        children: <Term />,
      });
      setItems(newPanes);
      setActiveKey(newActiveKey);
    },
  }));

  const onChange = (newActiveKey: string) => {
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

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      remove(targetKey);
    }
  };

  return (
    <TabsContainer>
      <Tabss
        styles={stylesObject}
        type="editable-card"
        onChange={onChange}
        activeKey={activeKey}
        onEdit={onEdit}
        items={items}
        size="small"
        hideAdd
      />
    </TabsContainer>
  );
};
