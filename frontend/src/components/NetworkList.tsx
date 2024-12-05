import React, { useEffect, useState } from "react";
import { Play, Square, RotateCw, Trash2, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast/Toast";
import { NetworkStatusObserver } from "../components/NetworkStatusObserver";
import { NetworkSettings } from "./NetworkSettings";

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
  const [networkStatuses, setNetworkStatuses] = useState<
    Record<string, "running" | "stopped">
  >({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [networkToDelete, setNetworkToDelete] = useState<Network | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const [loadingNetworks, setLoadingNetworks] = useState<Set<string>>(
    new Set()
  );

  const apiUrl = import.meta.env.VITE_API_URL;

  const startNetworkCall = async (id: string) => {
    setLoadingId(id);
    setLoadingNetworks((prev) => new Set([...prev, id]));
    try {
      const response = await fetch(`${apiUrl}/network/start/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showToast("Network started successfully.");
        setNetworkStatuses((prev) => ({
          ...prev,
          [id]: "running",
        }));
      } else {
        showToast("Failed to start network.", "error");
      }
    } catch (error) {
      showToast(
        "An error occurred while trying to start the network.",
        "error"
      );
    } finally {
      setLoadingId(null);
      setLoadingNetworks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const stopNetworkCall = async (id: string) => {
    setLoadingId(id);
    setLoadingNetworks((prev) => new Set([...prev, id]));
    try {
      const response = await fetch(`${apiUrl}/network/stop/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showToast("Network stopped successfully.");
        setNetworkStatuses((prev) => ({
          ...prev,
          [id]: "stopped",
        }));
      } else {
        showToast("Failed to stop network.", "error");
      }
    } catch (error) {
      showToast("An error occurred while trying to stop the network.", "error");
    } finally {
      setLoadingId(null);

      setLoadingNetworks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Nueva función restartNetwork
  const restartNetwork = async (id: string) => {
    setLoadingId(id);
    setLoadingNetworks((prev) => new Set([...prev, id]));

    try {
      // Primero detener la red
      const stopResponse = await fetch(`${apiUrl}/network/stop/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!stopResponse.ok) {
        throw new Error("Failed to stop network");
      }

      // Función para esperar 2 segundos a que se detenga la red
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Lanzamos nuevamente la red
      const startResponse = await fetch(`${apiUrl}/network/start/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (startResponse.ok) {
        showToast("Network restarted successfully.");
        setNetworkStatuses((prev) => ({
          ...prev,
          [id]: "running",
        }));
      } else {
        throw new Error("Failed to start network");
      }
    } catch (error) {
      showToast(
        "An error occurred while trying to restart the network.",
        "error"
      );
    } finally {
      setLoadingId(null);
      setLoadingNetworks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

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
        // Actualizar networkStatuses eliminando la red borrada
        setNetworkStatuses((prev) => {
          const newStatuses = { ...prev };
          delete newStatuses[networkToDelete.id];
          return newStatuses;
        });
      } else {
        showToast("Failed to delete network.", "error");
      }
    } catch (error) {
      showToast(
        "An error occurred while trying to delete the network.",
        "error"
      );
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
        // Inicializar networkStatuses con los estados iniciales
        const statuses: Record<string, "running" | "stopped"> = {};
        data.forEach((network: Network) => {
          statuses[network.id] = network.status || "stopped";
        });
        setNetworkStatuses(statuses);
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

  const handleNetworkEdited = (updatedNetwork: Network) => {
    setNetworks((prevNetworks) => {
      if (!prevNetworks) return prevNetworks;
      return prevNetworks.map((network) =>
        network.id === updatedNetwork.id ? updatedNetwork : network
      );
    });
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
                  const isRunning = networkStatuses[network.id] === "running";
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
                        <NetworkStatusObserver
                          networkId={network.id}
                          className="fs-8 px-2 py-1"
                          isLoading={loadingNetworks.has(network.id)}
                          onStatusChange={(status) => {
                            setNetworkStatuses((prev) => ({
                              ...prev,
                              [network.id]: status,
                            }));
                          }}
                        />
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-3">
                          {networkStatuses[network.id] !== "running" ? (
                            <button
                              onClick={() => startNetworkCall(network.id)}
                              disabled={loadingId === network.id}
                              style={{
                                ...actionButtonStyle,
                                backgroundColor: "#e7f7ed",
                                opacity: loadingId === network.id ? 0.5 : 1,
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
                            onClick={() => restartNetwork(network.id)}
                            disabled={loadingId === network.id}
                            style={{
                              ...actionButtonStyle,
                              backgroundColor: "#fff4e6",
                              opacity: loadingId === network.id ? 0.5 : 1,
                            }}
                          >
                            <RotateCw size={20} className="text-warning" />
                          </button>
                          <button
                            style={{
                              ...actionButtonStyle,
                              backgroundColor: "#f3e8ff", // Color violeta suave
                            }}
                          >
                            <Link to={`/network/${network.id}/faucet/`}>
                            <DollarSign size={20} className="text-purple-600" />
                            </Link>
                          </button>
                          <NetworkSettings
                            network={network}
                            actionButtonStyle={actionButtonStyle}
                            loadingId={loadingId}
                            onNodeAdded={(newNode) => {
                              // Actualizar la lista de nodos cuando se agregue uno nuevo
                              setNetworks((prevNetworks) => {
                                if (!prevNetworks) return prevNetworks;
                                return prevNetworks.map((n) => {
                                  if (n.id === network.id) {
                                    return {
                                      ...n,
                                      nodes: [...n.nodes, newNode],
                                    };
                                  }
                                  return n;
                                });
                              });
                            }}
                            onNetworkEdited={handleNetworkEdited}
                          />
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
