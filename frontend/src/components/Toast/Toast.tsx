// Toast.tsx
import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
/*   useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);  */// Agregado message como dependencia

  return (
    <div
      className={`toast show align-items-center text-white ${
        type === "success" ? "bg-success" : "bg-danger"
      }`}
      role="alert"
      aria-atomic="true"
      style={{
        minWidth: "200px",
      }}
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1050 }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {
            console.log("Closing toast:", toast.id); // Para debug
            removeToast(toast.id);
          }}
        />
      ))}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
    time: number = 3
  ) => {
    const id = Date.now();
    console.log("Creating toast:", id); // Para debug
    const newToast = {
      id,
      message,
      type,
    };
    setToasts((current) => [...current, newToast]);
    debugger;
    if(time > 0 ){
      // Asegurar que el toast se elimine después de n segundos
      setTimeout(() => {
        console.log("Auto-removing toast:", id); // Para debug
        setToasts((current) => current.filter((t) => t.id !== id));
      }, time * 1000);
    }
  };

  const removeToast = (id: number) => {
    console.log("Manually removing toast:", id); // Para debug
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
};

export type { ToastMessage };
