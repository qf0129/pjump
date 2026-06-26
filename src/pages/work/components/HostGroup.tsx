import api from "@/apis/apis";
import type { Group, Host } from "@/utils/type";
import {
  DownOutlined,
  LoadingOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Flex } from "antd";
import { useState } from "react";
import styled from "styled-components";

const HostGroupContainer = styled.div``;
const GroupRow = styled(Flex)`
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
  color: #aaa;

  &:hover {
    background-color: var(--term-body-bg-3);
  }
`;

const HostRow = styled.div`
  padding: 5px 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
  color: #eee;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: normal;

  &:hover {
    background-color: var(--term-body-bg-3);
  }
`;

const Empty = styled(Flex)`
  padding: 5px 4px;
  padding-left: 20px;
  user-select: none;
  color: #666;
`;

type HostGroupProps = {
  group: Group;
  onSelectHost?: (host: Host) => void;
};

export const HostGroup = ({ group, onSelectHost }: HostGroupProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const selectHost = (host: Host) => {
    if (onSelectHost) {
      onSelectHost(host);
    }
  };

  const expandGroup = () => {
    if (expanded) {
      setExpanded(false);
    } else {
      setExpanded(true);
      if (!hosts.length) {
        queryHosts();
      }
    }
  };

  const queryHosts = () => {
    setLoading(true);
    api
      .QueryGroupHost({ GroupUid: group.Uid })
      .then((res) => {
        if (res.Code === 0) {
          setHosts(res.Data.List);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getRightIcon = () => {
    if (loading) {
      return <LoadingOutlined />;
    } else {
      if (expanded) {
        return <DownOutlined style={{ color: "#666" }} />;
      } else {
        return <RightOutlined style={{ color: "#666" }} />;
      }
    }
  };

  return (
    <HostGroupContainer>
      <GroupRow onClick={() => expandGroup()}>
        <Flex flex={1}>{group.Name}</Flex>
        {getRightIcon()}
      </GroupRow>
      {expanded && (
        <div>
          {hosts.length > 0 ? (
            hosts.map((host) => (
              <HostRow onClick={() => selectHost(host)} key={host.Uid}>
                {host.Name}
              </HostRow>
            ))
          ) : (
            <Empty>NoData</Empty>
          )}
        </div>
      )}
    </HostGroupContainer>
  );
};
