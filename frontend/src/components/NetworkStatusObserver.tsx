// NetworkStatusObserver.tsx
import React, { useState, useEffect } from "react";

interface NetworkStatus {
  isRunning: boolean;
}

interface NetworkStatusObserverProps {
  networkId: string;
  className?: string;
  onStatusChange?: (status: "running" | "stopped") => void;
  isLoading?: boolean;
}

export const NetworkStatusObserver: React.FC<NetworkStatusObserverProps> = ({
  networkId,
  className = "",
  onStatusChange,
  isLoading = false,
}) => {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const checkStatus = async () => {
      if (isLoading) return;
      try {
        // Actualizar la URL según el endpoint correcto
        const response = await fetch(`${apiUrl}/network/status/${networkId}`);

        // Si la respuesta no es ok, intentamos obtener el mensaje de error
        if (!response.ok) {
          throw new Error("Network status check failed");
        }

        const data = await response.json();
        //console.log("Status response:", data);

        setStatus(data);
        onStatusChange?.(data.isRunning ? "running" : "stopped");
      } catch (error) {
        console.error("Error checking network status:", error);
        setStatus({ isRunning: false });
        onStatusChange?.("stopped");
      }
    };

    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [networkId, onStatusChange, apiUrl, isLoading]);

  if (isLoading) {
    return (
      <span className={`badge bg-warning ${className}`}>
        loading...
        <div className="spinner-border spinner-border-sm ms-1" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </span>
    );
  }

  if (!status) {
    return (
      <span className={`badge bg-secondary ${className}`}>checking...</span>
    );
  }

  return (
    <span
      className={`badge ${status.isRunning ? "bg-success" : "bg-danger"} ${className}`}
    >
      {status.isRunning ? "running" : "stopped"}
    </span>
  );
};
