import { useEffect, useRef } from "react";

// RDP Tab component using Guacamole
interface RDPTabProps {
  hostUid: string;
}

export default function RDPClient({ hostUid }: RDPTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tunnelRef = useRef<Guacamole.Tunnel>(null);
  const clientRef = useRef<Guacamole.Client>(null);

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

        // Attach display
        const display = client.getDisplay();
        const displayEl = display.getElement();
        displayEl.style.width = "100%";
        displayEl.style.height = "100%";
        displayEl.style.background = "transparent";
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(displayEl);
        }

        // Mouse input — legacy property handlers receive Mouse.State directly,
        // NOT wrapped in a Mouse.Event object (unlike onEach/on callbacks).
        const mouse = new Guacamole.Mouse(displayEl);
        mouse.onmousedown = (state: any) => {
          client.sendMouseState(state, true);
        };
        mouse.onmouseup = (state: any) => {
          client.sendMouseState(state, false);
        };
        mouse.onmousemove = (state: any) => {
          client.sendMouseState(state, true);
        };

        // Keyboard input
        const keyboard = new Guacamole.Keyboard(displayEl);
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

        client.onsync = sendDisplaySize;
        const sizeTimer = setTimeout(sendDisplaySize, 1000);

        // Connect
        client.connect();

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
  }, [hostUid]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }} />
    </div>
  );
}
