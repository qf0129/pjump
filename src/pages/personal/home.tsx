import PersonalApi from "@/apis/PersonalApi";
import type { Host } from "@/utils/type";
import { Button, Space } from "antd";
import { useEffect, useState } from "react";

export default function Home() {
  const [hosts, setHosts] = useState<Host[]>([]);

  useEffect(() => {
    PersonalApi.QueryHost({ Page: 1, PageSize: 10 }).then((data) => {
      if (data.Code === 0) {
        setHosts(data.Data.List);
      } else {
        console.error(data.Msg);
      }
    });
  }, []);

  return (
    <div>
      <div>servers</div>
      <div>
        {hosts.map((host) => (
          <div key={host.Uid} style={{ display: "inline-block", padding: 10, background: "#f1f1f1" }}>
            <Space>
              <div>
                {host.Name} ( {host.Ip} : {host.Port} )
              </div>
              <Button onClick={() => window.open("/client/" + host.Uid, "_blank")}>{host.Protocol} 连接</Button>
            </Space>
          </div>
        ))}
      </div>
    </div>
  );
}
