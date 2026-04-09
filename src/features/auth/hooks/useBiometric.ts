import * as LocalAuthentication from "expo-local-authentication";
import { useState, useEffect } from "react";

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  const authenticate = async () => {
    if (!isAvailable) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirme sua identidade",
      fallbackLabel: "Usar PIN",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
    });

    return result.success;
  };

  return { isAvailable, authenticate };
};
