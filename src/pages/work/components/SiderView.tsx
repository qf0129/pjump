import api from "@/apis/apis";
import type { Group, Host } from "@/utils/type";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { HostGroup } from "./HostGroup";

const SiderContainer = styled.div`
  width: 240px;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--term-body-bg-2);
  color: #fff;
  /* border-right: 1px solid var(--term-header-bg); */
`;

const SiderHeader = styled.div`
  height: 32px;
  background-color: var(--term-header-bg);
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

type SiderViewProps = {
  onSelectHost?: (host: Host) => void;
};
export const SiderView = ({ onSelectHost }: SiderViewProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const queryData = () => {
    api.QueryUserGroup({}).then((res) => {
      console.log(res);
      if (res.Code === 0) {
        setGroups(res.Data);
      }
    });
  };

  useEffect(() => {
    queryData();
  }, []);

  return (
    <SiderContainer>
      <SiderHeader>MyGroups</SiderHeader>
      {groups.map((group) => (
        <HostGroup key={group.Uid} group={group} onSelectHost={onSelectHost} />
      ))}
    </SiderContainer>
  );
};
