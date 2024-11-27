import React, { useState, useEffect, useRef } from "react";
import { Settings, Edit, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { useToast } from "../components/Toast/Toast";
import { AddNodeSidebar } from "./AddNodeSidebar";
import { EditNetworkSidebar } from "./EditNetworkSidebar";
import { Network } from "../../../backend/src/types/network";

interface NetworkSettingsProps {
  network: Network;
  actionButtonStyle: React.CSSProperties;
  loadingId: string | null;
  onNodeAdded: (newNode: any) => void;
  onNetworkEdited: (network: Network) => void; // Agregar esta prop
}

export const NetworkSettings: React.FC<NetworkSettingsProps> = ({
  network,
  actionButtonStyle,
  loadingId,
  onNodeAdded,
  onNetworkEdited,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddNodeSidebar, setShowAddNodeSidebar] = useState(false);
  const [showEditNetworkSidebar, setShowEditNetworkSidebar] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 150,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  const handleNetworkEdited = (updatedNetwork: Network) => {
    // Aquí podrías implementar la lógica para actualizar la red en la lista
    console.log("Network updated:", updatedNetwork);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...actionButtonStyle,
          backgroundColor: "#f0f0f0",
          opacity: loadingId === network.id ? 0.5 : 1,
        }}
      >
        <Settings size={20} className="text-secondary" />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="dropdown-menu show"
              style={{
                position: "fixed",
                top: `${buttonPosition.top}px`,
                left: `${buttonPosition.left}px`,
                zIndex: 9999,
                minWidth: "200px",
                backgroundColor: "#fff",
                border: "1px solid rgba(0,0,0,.15)",
                borderRadius: "0.25rem",
                boxShadow: "0 0.5rem 1rem rgba(0,0,0,.175)",
              }}
            >
              <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                onClick={() => {
                  setShowEditNetworkSidebar(true);
                  setIsOpen(false);
                }}
              >
                <Edit size={16} />
                <span>Edit Network</span>
              </button>

              <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                onClick={() => {
                  setShowAddNodeSidebar(true);
                  setIsOpen(false);
                }}
              >
                <Plus size={16} />
                <span>Add Node</span>
              </button>
            </div>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
              }}
              onClick={() => setIsOpen(false)}
            />
          </>,
          document.body
        )}

      {createPortal(
        <AddNodeSidebar
          networkId={network.id}
          subnet={network.subnet}
          onNodeAdded={onNodeAdded}
          onClose={() => setShowAddNodeSidebar(false)}
          show={showAddNodeSidebar}
        />,
        document.body
      )}

      {createPortal(
        <EditNetworkSidebar
          network={network}
          onClose={() => setShowEditNetworkSidebar(false)}
          show={showEditNetworkSidebar}
          onNetworkEdited={onNetworkEdited}
        />,
        document.body
      )}
    </>
  );
};
