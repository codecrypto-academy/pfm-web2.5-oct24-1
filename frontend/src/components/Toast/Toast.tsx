import React, { useEffect, useState } from "react";

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
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`toast show align-items-center text-white ${type === "success" ? "bg-success" : "bg-danger"}`}
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
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook personalizado para manejar los toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const newToast = {
      id: Date.now(),
      message,
      type,
    };
    setToasts((current) => [...current, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
};

export type { ToastMessage };
