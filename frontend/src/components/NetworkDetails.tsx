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
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  title,
  message,
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
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
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

export const NetworkDetails: React.FC = () => {
  const [network, setNetwork] = useState<Network | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"network" | "node">("network");
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const apiUrl = import.meta.env.VITE_API_URL;
  const id = window.location.pathname.split("/").pop();

  useEffect(() => {
    fetch(`${apiUrl}/network/${id}`).then((response) => {
      response.json().then((data) => {
        setNetwork(data);
        setIsRunning(data.status === "running");
      });
    });
  }, [id]);

  const startNetwork = async () => {
    setLoadingId("start");
    try {
      const response = await fetch(`${apiUrl}/network/start/${id}`, {
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

  const stopNetwork = async () => {
    setLoadingId("stop");
    try {
      const response = await fetch(`${apiUrl}/network/stop/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        showToast("Network stopped successfully.");
        setIsRunning(false);
      } else {
        showToast("Failed to stop network.", "error");
      }
    } catch (error) {
      showToast("An error occurred while stopping the network.", "error");
    }
    setLoadingId(null);
  };

  const deleteNetwork = async () => {
    setLoadingId("delete");
    try {
      const response = await fetch(`${apiUrl}/network/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        showToast("Network deleted successfully.");
        window.location.href = "/networks";
      } else {
        showToast("Failed to delete network.", "error");
      }
    } catch (error) {
      showToast("An error occurred while deleting the network.", "error");
    }
    setLoadingId(null);
    setShowDeleteModal(false);
  };

  const deleteNode = async () => {
    if (!nodeToDelete || !network) return;

    setLoadingId(nodeToDelete);
    try {
      const response = await fetch(
        `${apiUrl}/node/delete/${nodeToDelete}/${network.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        showToast("Node deleted successfully.");
        setNetwork((prev) =>
          prev
            ? {
                ...prev,
                nodes: prev.nodes.filter((node) => node.name !== nodeToDelete),
              }
            : null
        );
      } else {
        showToast("Failed to delete node.", "error");
      }
    } catch (error) {
      showToast("An error occurred while deleting the node.", "error");
    }
    setLoadingId(null);
    setShowDeleteModal(false);
    setNodeToDelete(null);
  };

  const handleDeleteClick = (type: "network" | "node", nodeName?: string) => {
    setDeleteType(type);
    if (type === "node" && nodeName) {
      setNodeToDelete(nodeName);
    }
    setShowDeleteModal(true);
  };

  if (!network) {
    return (
      <div className="container mt-4">
        <h3>Network Details</h3>
        <p>Empty network details</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Network Details</h3>
        <div className="d-flex gap-2">
          {!isRunning ? (
            <button
              onClick={startNetwork}
              disabled={loadingId === "start"}
              className="btn btn-outline-success btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "38px", height: "38px" }}
            >
              <Play size={20} />
            </button>
          ) : (
            <button
              onClick={stopNetwork}
              disabled={loadingId === "stop"}
              className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "38px", height: "38px" }}
            >
              <Square size={18} fill="currentColor" />
            </button>
          )}
          <button
            className="btn btn-outline-warning btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "38px", height: "38px" }}
          >
            <RotateCw size={20} />
          </button>
          <button
            className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "38px", height: "38px" }}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => handleDeleteClick("network")}
            className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "38px", height: "38px" }}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <section className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">General information</h5>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <strong className="me-2">ID:</strong>
              {network.id}
            </li>
            <li className="mb-2">
              <strong className="me-2">Chain ID:</strong>
              {network.chainId}
            </li>
            <li className="mb-2">
              <strong className="me-2">Subnet:</strong>
              {network.subnet}
            </li>
            <li>
              <strong className="me-2">IP Boot Node:</strong>
              {network.ipBootNode}
            </li>
          </ul>
        </div>
      </section>

      <section className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Allocations</h5>
          {network.alloc.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {network.alloc.map((item, index) => (
                <li key={index} className="mb-2">
                  <strong className="me-2">Address:</strong>
                  {item.address} <br />
                  <strong className="me-2">Value:</strong>
                  {item.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-0">No allocations available</p>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-body">
          <h5 className="card-title">Nodes</h5>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>IP</th>
                  <th>Port</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {network.nodes.map((node, index) => (
                  <tr key={index}>
                    <td>{node.type}</td>
                    <td>{node.name}</td>
                    <td>{node.ip}</td>
                    <td>{node.port ?? "N/A"}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteClick("node", node.name)}
                        className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: "32px", height: "32px" }}
                        disabled={loadingId === node.name}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <DeleteModal
        show={showDeleteModal}
        title={deleteType === "network" ? "Delete Network" : "Delete Node"}
        message={
          deleteType === "network"
            ? `¿Estás seguro que deseas eliminar la red ${network.id}?`
            : `¿Estás seguro que deseas eliminar el nodo ${nodeToDelete}?`
        }
        onClose={() => {
          setShowDeleteModal(false);
          setNodeToDelete(null);
        }}
        onConfirm={deleteType === "network" ? deleteNetwork : deleteNode}
      />
    </div>
  );
};

export default NetworkDetails;
