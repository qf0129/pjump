import api from "@/apis/api";
import type { Group } from "@/utils/type";
import { useEffect, useState } from "react";
import styled from "styled-components";

const SiderContainer = styled.div`
  width: 200px;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #eee;
`;
export const Sider = () => {
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
      <div>Groups:</div>
      {groups.map((group) => (
        <div key={group.Uid}>{group.Name}</div>
      ))}
    </SiderContainer>
  );
};
