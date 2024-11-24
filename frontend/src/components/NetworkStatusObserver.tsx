import React, { useState, useEffect } from "react";

interface NetworkStatus {
  blockNumber?: number;
  status: "running" | "stopped";
}

interface NetworkStatusObserverProps {
  networkId: string;
  className?: string;
  onStatusChange?: (status: "running" | "stopped") => void;
}

export const NetworkStatusObserver: React.FC<NetworkStatusObserverProps> = ({
  networkId,
  className = "",
  onStatusChange,
}) => {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isAlive/${networkId}`);
        if (!response.ok) {
          throw new Error("Network status check failed");
        }
        const data = await response.json();
        const newStatus = data.blockNumber ? "running" : "stopped";

        setStatus({
          blockNumber: data.blockNumber,
          status: newStatus,
        });

        // Notificar el cambio de estado al componente padre
        onStatusChange?.(newStatus);
      } catch (error) {
        console.error("Error checking network status:", error);
        setStatus({
          blockNumber: undefined,
          status: "stopped",
        });
        onStatusChange?.("stopped");
      }
    };

    // Primera verificación
    checkStatus();

    // Verificar cada 5 segundos
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [networkId, onStatusChange]);

  if (!status) {
    return (
      <span className={`badge bg-secondary ${className}`}>checking...</span>
    );
  }

  return (
    <span
      className={`badge ${status.status === "running" ? "bg-success" : "bg-danger"} ${className}`}
    >
      {status.status === "running" ? (
        <>
          running
          {status.blockNumber && (
            <small className="ms-1">#{status.blockNumber}</small>
          )}
        </>
      ) : (
        "stopped"
      )}
    </span>
  );
};
