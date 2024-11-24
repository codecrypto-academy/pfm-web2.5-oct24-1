import React, { useEffect, useState } from "react";
import { Play, Square, RotateCw, Settings, Trash2 } from "lucide-react";
import { ToastContainer, useToast } from "../components/Toast/Toast";

interface Network {
  id: string;
  chainId: number;
  subnet: string;
  ipBootNode: string;
  alloc: Array<{
    address: string;
    value: number;
  }>;
  nodes: Array<{
    type: string;
    name: string;
    ip: string;
    port: number | null;
  }>;
  status?: "running" | "stopped";
}

interface DeleteModalProps {
  show: boolean;
  networkId: string | null;
  networkName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  networkId,
  networkName,
  onClose,
  onConfirm,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirmar eliminación</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              ¿Estás seguro que deseas eliminar la red{" "}
              <strong>{networkName}</strong>?
            </p>
            <p className="text-danger mb-0">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NetworkList: React.FC = () => {
  const [networks, setNetworks] = useState<Network[] | null>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [runningNetworks, setRunningNetworks] = useState<Set<string>>(
    new Set()
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [networkToDelete, setNetworkToDelete] = useState<Network | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const apiUrl = import.meta.env.VITE_API_URL;

  const startNetworkCall = async (id: string) => {
    setLoadingId(id);
    try {
      const response = await fetch(`${apiUrl}/network/start/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        showToast("Network started successfully.");
        setRunningNetworks((prev) => new Set([...prev, id]));
        console.log("Response Data:", data);
      } else {
        showToast("Failed to start network.", "error");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      showToast(
        "An error occurred while trying to start the network.",
        "error"
      );
      console.error("Error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const stopNetworkCall = async (id: string) => {
    setLoadingId(id);
    try {
      const response = await fetch(`${apiUrl}/network/stop/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        showToast("Network stopped successfully.");
        setRunningNetworks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        console.log("Response Data:", data);
      } else {
        showToast("Failed to stop network.", "error");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      showToast("An error occurred while trying to stop the network.", "error");
      console.error("Error:", error);
    } finally {
      setLoadingId(null);
    }
  };
  /*
  const startNetwork = async () => {
    setLoadingId("start");
    try {
      const response = await fetch(`${apiUrl}/network/${id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        showToast("Network started successfully.");
        setIsRunning(true);
      } else {
        showToast("Failed to start network.", "error");
      }
    } catch (error) {
      showToast("An error occurred while starting the network.", "error");
    }
    setLoadingId(null);
  };
  */

  const deleteNetwork = async () => {
    if (!networkToDelete) return;

    setLoadingId(networkToDelete.id);
    try {
      const response = await fetch(
        `${apiUrl}/network/delete/${networkToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        showToast("Network deleted successfully.");
        setNetworks((prevNetworks) =>
          prevNetworks
            ? prevNetworks.filter(
                (network) => network.id !== networkToDelete.id
              )
            : []
        );
        setRunningNetworks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(networkToDelete.id);
          return newSet;
        });
      } else {
        showToast("Failed to delete network.", "error");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      showToast(
        "An error occurred while trying to delete the network.",
        "error"
      );
      console.error("Error:", error);
    } finally {
      setLoadingId(null);
      setShowDeleteModal(false);
      setNetworkToDelete(null);
    }
  };

  const handleDeleteClick = (network: Network) => {
    setNetworkToDelete(network);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    fetch(`${apiUrl}/networks`).then((response) => {
      response.json().then((data) => {
        setNetworks(data);
        const running: Set<string> = new Set(
          data
            .filter((network: Network) => network.status === "running")
            .map((network: Network) => network.id)
        );
        setRunningNetworks(running);
      });
    });
  }, []);

  if (!networks || networks.length === 0) {
    return (
      <div className="container py-4">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <h2 className="mb-4">Networks List</h2>
        <div className="card">
          <div className="card-body">
            <p className="text-muted">No hay redes disponibles.</p>
          </div>
        </div>
      </div>
    );
  }

  const actionButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    padding: 0,
    transition: "all 0.2s ease-in-out",
  };

  return (
    <div className="container py-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <h2 className="mb-4">Networks List</h2>
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Chain ID</th>
                  <th scope="col">Network Name</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {networks.map((network, index) => {
                  const isRunning = runningNetworks.has(network.id);
                  return (
                    <tr key={index}>
                      <td className="align-middle">{network.chainId}</td>
                      <td className="align-middle">
                        <a
                          href={`/network/${network.id}`}
                          className="text-decoration-none"
                        >
                          {network.id}
                        </a>
                      </td>
                      <td className="align-middle">
                        <span
                          className={`badge ${isRunning ? "bg-success" : "bg-danger"}`}
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.35em 0.65em",
                          }}
                        >
                          {loadingId === network.id
                            ? "Loading..."
                            : isRunning
                              ? "running"
                              : "stopped"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-3">
                          {!isRunning ? (
                            <button
                              onClick={() => startNetworkCall(network.id)}
                              disabled={
                                loadingId === network.id ||
                                disabledIds.has(network.id)
                              }
                              style={{
                                ...actionButtonStyle,
                                backgroundColor: "#e7f7ed",
                                opacity:
                                  loadingId === network.id ||
                                  disabledIds.has(network.id)
                                    ? 0.5
                                    : 1,
                              }}
                            >
                              <Play size={20} className="text-success" />
                            </button>
                          ) : (
                            <button
                              onClick={() => stopNetworkCall(network.id)}
                              disabled={loadingId === network.id}
                              style={{
                                ...actionButtonStyle,
                                backgroundColor: "#feebeb",
                                opacity: loadingId === network.id ? 0.5 : 1,
                              }}
                            >
                              <Square
                                size={18}
                                className="text-danger"
                                fill="currentColor"
                              />
                            </button>
                          )}
                          <button
                            style={{
                              ...actionButtonStyle,
                              backgroundColor: "#fff4e6",
                            }}
                          >
                            <RotateCw size={20} className="text-warning" />
                          </button>
                          <button
                            style={{
                              ...actionButtonStyle,
                              backgroundColor: "#e8f0fe",
                            }}
                          >
                            <Settings size={20} className="text-primary" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(network)}
                            style={{
                              ...actionButtonStyle,
                              backgroundColor: "#fee7e7",
                            }}
                          >
                            <Trash2 size={20} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DeleteModal
        show={showDeleteModal}
        networkId={networkToDelete?.id || null}
        networkName={networkToDelete?.id || ""}
        onClose={() => {
          setShowDeleteModal(false);
          setNetworkToDelete(null);
        }}
        onConfirm={deleteNetwork}
      />
    </div>
  );
};

export default NetworkList;
