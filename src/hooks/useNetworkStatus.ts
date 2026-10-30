import { useEffect, useState } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

// Offline means no connection, or a connection with no internet access.
// Unknown values count as online, so a slow first check never blocks requests.
function isOnlineState(state: NetInfoState): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export function useNetworkStatus(): { online: boolean } {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setOnline(isOnlineState(state));
    });
  }, []);

  return { online };
}
