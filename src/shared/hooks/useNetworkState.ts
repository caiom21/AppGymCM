import { useState, useEffect } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export const useNetworkState = () => {
  const [state, setState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Escuta mudanças na conexão
    const unsubscribe = NetInfo.addEventListener((nextState) => {
      setState(nextState);
    });

    // Estado inicial
    NetInfo.fetch().then((initialState) => {
      setState(initialState);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected: state?.isConnected ?? true,
    isInternetReachable: state?.isInternetReachable ?? true,
    type: state?.type,
  };
};
