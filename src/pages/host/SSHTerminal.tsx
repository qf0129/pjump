import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface SSHTerminalProps {
  hostUid: string;
  osUserUid: string;
}

interface WSMessage {
  type: string;
  data?: string;
}

const backgroundColor = "#111";

export default function SSHTerminal({ hostUid, osUserUid }: SSHTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const handleResize = useCallback(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
      const dims = fitAddonRef.current.proposeDimensions();
      if (dims && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "resize",
            rows: dims.rows,
            cols: dims.cols,
          }),
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 16,
      fontFamily: '"Cascadia Code", "Fira Code", Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: backgroundColor,
        foreground: "#e0e0e0",
        cursor: "#e0e0e0",
      },
      allowTransparency: false,
      cols: 80,
      rows: 24,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws/ssh/${hostUid}?u=${encodeURIComponent(osUserUid)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // term.write("\r\n\x1b[32mConnecting...\x1b[0m\r\n");
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        if (msg.type === "output" && msg.data) {
          term.write(msg.data);
        } else if (msg.type === "error") {
          term.write(`\r\n\x1b[31mError: ${msg.data}\x1b[0m\r\n`);
        }
      } catch {
        // Raw data fallback
        term.write(event.data);
      }
    };

    ws.onclose = () => {
      term.write("\r\n\x1b[33mConnection closed\x1b[0m\r\n");
    };

    ws.onerror = () => {
      term.write("\r\n\x1b[31mWebSocket error\x1b[0m\r\n");
    };

    // Handle user input
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input", data }));
      }
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Resize on window resize
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      ws.close();
      term.dispose();
    };
  }, [hostUid, osUserUid, handleResize]);

  return (
    <div style={{ background: backgroundColor, width: "100%", height: "100%", padding: 8 }}>
      <div ref={terminalRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
