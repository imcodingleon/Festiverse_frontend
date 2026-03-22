"use client";

import { Provider } from "jotai";
import { useAppTracking } from "@/infrastructure/tracking/useAppTracking";

function TrackingInit() {
  useAppTracking();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <TrackingInit />
      {children}
    </Provider>
  );
}
