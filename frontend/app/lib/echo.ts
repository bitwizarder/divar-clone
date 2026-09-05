import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getCsrfToken } from "@/app/lib/api/csrf";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"reverb"> | null;
  }
}

let echoInstance: Echo<"reverb"> | null = null;
let echoPromise: Promise<Echo<"reverb">> | null = null;

export async function getEcho(): Promise<Echo<"reverb">> {
  if (echoInstance) return echoInstance;
  if (echoPromise) return echoPromise;

  echoPromise = (async () => {
    window.Pusher = Pusher;

    echoInstance = new Echo<"reverb">({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "my-app-key",
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],

      // ✅ authorizer دستی به‌جای authEndpoint/auth
      authorizer: (channel: any) => {
        return {
          authorize: (socketId: string, callback: Function) => {
            (async () => {
              try {
                // هر بار توکن تازه می‌گیریم تا مطمئن باشیم معتبره
                const csrfToken = await getCsrfToken();

                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/broadcasting/auth`,
                  {
                    method: "POST",
                    credentials: "include", // ✅ کوکی‌ها حتماً ارسال بشن
                    headers: {
                      "Content-Type": "application/json",
                      Accept: "application/json",
                      "X-XSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                      socket_id: socketId,
                      channel_name: channel.name,
                    }),
                  },
                );

                if (!res.ok) {
                  throw new Error(`Auth failed with status ${res.status}`);
                }

                const data = await res.json();
                callback(false, data);
              } catch (error) {
                callback(true, error);
              }
            })();
          },
        };
      },
    });

    return echoInstance;
  })();

  return echoPromise;
}
