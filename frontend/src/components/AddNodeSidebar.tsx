import React, { useState, useEffect } from "react";
import { useToast } from "../components/Toast/Toast";

interface AddNodeSidebarProps {
  networkId: string;
  subnet: string;
  onNodeAdded: (newNode: NodeData) => void;
  onClose: () => void;
  show: boolean;
}

interface NodeData {
  type: string;
  name: string;
  ip: string;
  port: number | null;
}

export const AddNodeSidebar: React.FC<AddNodeSidebarProps> = ({
  networkId,
  subnet,
  onNodeAdded,
  onClose,
  show,
}) => {
  const [formData, setFormData] = useState<NodeData>({
    type: "",
    name: "",
    ip: "",
    port: null,
  });

  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;
  const baseIp = subnet.split(".").slice(0, 3).join(".");

  const resetForm = () => {
    setFormData({
      type: "",
      name: "",
      ip: "",
      port: null,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "17px";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [show]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "ip") {
      const numValue = value.replace(/\D/g, "");
      if (
        numValue === "" ||
        (parseInt(numValue) >= 0 && parseInt(numValue) <= 255)
      ) {
        setFormData((prev) => ({ ...prev, [name]: numValue }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "port" ? (value ? parseInt(value) : null) : value,
    }));

    if (name === "type" && value !== "rpc") {
      setFormData((prev) => ({ ...prev, port: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type) {
      showToast("Please select a node type.", "error");
      return;
    }

    if (!formData.name) {
      showToast("Please enter a node name.", "error");
      return;
    }

    const ipValue = parseInt(formData.ip);
    if (isNaN(ipValue) || ipValue < 0 || ipValue > 255) {
      showToast(
        "Invalid IP address. Last number must be between 0 and 255.",
        "error"
      );
      return;
    }

    if (
      formData.type === "rpc" &&
      (!formData.port || formData.port < 1 || formData.port > 65535)
    ) {
      showToast("Invalid port number. Must be between 1 and 65535.", "error");
      return;
    }

    const fullIp = `${baseIp}.${formData.ip}`;
    const nodeData = { ...formData, ip: fullIp };

    try {
      const response = await fetch(`${apiUrl}/node/create/${networkId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nodeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add node");
      }

      const newNode = await response.json();
      showToast("Node added successfully!", "success");
      onNodeAdded(newNode);
      onClose();
      setFormData({ type: "", name: "", ip: "", port: null });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error adding node",
        "error"
      );
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="offcanvas offcanvas-end show"
        tabIndex={-1}
        style={{ visibility: "visible" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Add New Node</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">
                Type
              </label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                <option value="miner">Miner</option>
                <option value="rpc">RPC</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Node name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="ip" className="form-label">
                IP
              </label>
              <div className="input-group">
                <span className="input-group-text">{baseIp}.</span>
                <input
                  type="text"
                  className="form-control"
                  id="ip"
                  name="ip"
                  value={formData.ip}
                  onChange={handleInputChange}
                  placeholder="Last octet"
                  required
                  maxLength={3}
                />
              </div>
              <div className="form-text">
                Enter the last number of the IP address (0-255)
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="port" className="form-label">
                Port
              </label>
              <input
                type="number"
                className="form-control"
                id="port"
                name="port"
                value={formData.port || ""}
                onChange={handleInputChange}
                disabled={formData.type !== "rpc"}
                min="1"
                max="65535"
                placeholder={
                  formData.type === "rpc"
                    ? "Port number"
                    : "Disabled for this node type"
                }
              />
              {formData.type === "rpc" && (
                <div className="form-text">
                  Enter a port number between 1 and 65535
                </div>
              )}
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Node
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        className="offcanvas-backdrop fade show"
        style={{ position: "fixed" }}
        onClick={onClose}
      ></div>
    </>
  );
};
