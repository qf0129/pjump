import { useEffect, useRef, useState } from "react";

// RDP Tab component using Guacamole
interface RDPTabProps {
  hostUid: string;
  osUserUid: string;
}

export default function RDPClient({ hostUid, osUserUid }: RDPTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tunnelRef = useRef<Guacamole.Tunnel>(null);
  const clientRef = useRef<Guacamole.Client>(null);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const initGuacamole = async () => {
      try {
        const Guacamole = (await import("guacamole-common-js")).default;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/api/ws/rdp/${hostUid}`;

        const tunnel = new Guacamole.WebSocketTunnel(wsUrl);
        tunnelRef.current = tunnel;

        const client = new Guacamole.Client(tunnel);
        clientRef.current = client;

        // Attach display — let Guacamole size it to match the remote
        // desktop. Flexbox on the container handles centering.
        const display = client.getDisplay();
        const displayEl = display.getElement();

        // Guacamole Display sets canvas z-index to -1 (so the software
        // cursor layer can sit above it).  This buries the canvas behind
        // any ancestor with a background.  Override to 0 — the cursor
        // layer (z-index: 1) still renders on top correctly.
        const fixStyle = document.createElement("style");
        fixStyle.textContent = ".rdp-canvas-fix canvas { z-index: 0 !important; }";
        document.head.appendChild(fixStyle);
        displayEl.classList.add("rdp-canvas-fix");

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(displayEl);
        }

        // Mouse input — legacy property handlers receive Mouse.State directly,
        // NOT wrapped in a Mouse.Event object (unlike onEach/on callbacks).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mouse = new Guacamole.Mouse(displayEl) as any;
        mouse.onmousedown = (state: any) => {
          client.sendMouseState(state, true);
        };
        mouse.onmouseup = (state: any) => {
          client.sendMouseState(state, false);
        };
        mouse.onmousemove = (state: any) => {
          client.sendMouseState(state, true);
        };

        const keyboard = new Guacamole.Keyboard(document);
        keyboard.onkeydown = (keysym: number) => {
          client.sendKeyEvent(1, keysym);
        };
        keyboard.onkeyup = (keysym: number) => {
          client.sendKeyEvent(0, keysym);
        };

        // Error handling
        client.onerror = (err: any) => {
          console.error("Guacamole client error:", err);
        };
        tunnel.onerror = (err: any) => {
          console.error("Guacamole tunnel error:", err);
        };

        // Send display size to guacd once the container has real dimensions.
        // Must not gate on display.getWidth() — it is 0 before the first
        // frame, and Guacamole.Client only sends "sync" in response to one
        // from guacd, creating a deadlock if size isn't sent proactively.
        //
        // IMPORTANT: read from containerRef, NOT displayEl. Guacamole Display
        // overwrites displayEl's inline dimensions to match the remote
        // desktop resolution, so displayEl.offset* would always return the
        // current remote size (initially 1024×768) instead of the available
        // space.
        const sendDisplaySize = () => {
          if (!containerRef.current) return;
          const w = containerRef.current.offsetWidth;
          const h = containerRef.current.offsetHeight;
          if (w > 0 && h > 0) {
            client.sendSize(w, h);
          }
        };

        client.onsync = () => {
          setConnecting(false);
          sendDisplaySize();
        };
        const sizeTimer = setTimeout(sendDisplaySize, 1000);

        // Connect
        client.connect(`u=${encodeURIComponent(osUserUid)}`);

        // Handle subsequent resize
        const resizeObserver = new ResizeObserver(() => {
          sendDisplaySize();
        });
        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }

        return () => {
          clearTimeout(sizeTimer);
          resizeObserver.disconnect();
          keyboard.onkeydown = null;
          keyboard.onkeyup = null;
          document.head.removeChild(fixStyle);
          displayEl.classList.remove("rdp-canvas-fix");
          client.disconnect();
          tunnel.disconnect();
        };
      } catch (err) {
        console.error("Guacamole init error:", err);
      }
    };

    let cleanup: (() => void) | undefined;
    initGuacamole().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
      if (clientRef.current) clientRef.current.disconnect();
      if (tunnelRef.current) tunnelRef.current.disconnect();
    };
  }, [hostUid, osUserUid]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#000", position: "relative" }}>
      {connecting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#aaa",
            fontSize: 16,
            pointerEvents: "none",
          }}
        >
          正在连接...
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </div>
  );
}
