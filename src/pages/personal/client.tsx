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
        setHost(data.Data.List[0]);
      } else {
        console.error(data);
      }
    });
  }, [uid]);

  return (
    <div style={{ height: "100%" }}>
      {!host && <div>Loading...</div>}
      {host?.Protocol == "ssh" && <SSHTerminal hostUid={host.Uid as string} />}
      {host?.Protocol == "rdp" && <RDPClient hostUid={host.Uid as string} />}
    </div>
  );
}
