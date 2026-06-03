import PersonalApi from "@/apis/PersonalApi";
import type { Host } from "@/utils/type";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import SSHTerminal from "./SSHTerminal";
import RDPClient from "./RDPClient";

export default function ClientPage() {
  const { uid } = useParams<{ uid: string }>();
  const [host, setHost] = useState<Host | null>(null);

  const changeFavicon = (url: string) => {
    const link: HTMLLinkElement = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement("link");
    link.rel = "icon";
    if (!link.parentElement) document.head.appendChild(link);
    link.href = url;
  };

  const listener = (e: BeforeUnloadEvent): void => {
    e.preventDefault();
  };
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
        window.addEventListener("beforeunload", listener);
      } else {
        console.error(data);
      }
    });

    return (): void => {
      setHost(null);
      window.removeEventListener("beforeunload", listener);
    };
  }, [uid]);

  const clientView = (host: Host) => {
    if (host?.Protocol == "ssh") return <SSHTerminal hostUid={host.Uid as string} />;
    if (host?.Protocol == "rdp") return <RDPClient hostUid={host.Uid as string} />;
    return <div>不支持的协议:{host.Protocol}</div>;
  };

  return <div style={{ height: "100%", width: "100%", background: "#000" }}>{host && clientView(host)}</div>;
}
