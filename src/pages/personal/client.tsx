import PersonalApi from "@/apis/PersonalApi";
import type { Host } from "@/utils/type";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import SSHTerminal from "./ssh";
import RDPClient from "./rdp";

export default function Client() {
  const { uid } = useParams<{ uid: string }>();
  const [host, setHost] = useState<Host | null>(null);

  useEffect(() => {
    PersonalApi.QueryHost({ Uid: uid }).then((data) => {
      if (data.Code === 0 && data.Data.List.length > 0) {
        const host = data.Data.List[0];
        setHost(host);
        document.title = host?.Name || host?.Ip || uid || "连接中";
        if (host.Protocol == "rdp") {
          changeFavicon("/rdp.svg");
        } else if (host.Protocol == "ssh") {
          changeFavicon("/ssh.svg");
        }
      } else {
        console.error(data);
      }
    });
  }, [uid]);

  const clientView = (host: Host) => {
    if (host?.Protocol == "ssh") return <SSHTerminal hostUid={host.Uid as string} />;
    if (host?.Protocol == "rdp") return <RDPClient hostUid={host.Uid as string} />;
    return <div>不支持的协议:{host.Protocol}</div>;
  };

  return <div style={{ height: "100%", width: "100%", background: "#000" }}>{host && clientView(host)}</div>;
}

const changeFavicon = (url: string) => {
  const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
  link.rel = "icon";
  if (!link.parentElement) document.head.appendChild(link);
  link.href = url;
};
