import React, { useEffect } from "react";
import { Network } from "../../../backend/src/types/network";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "../components/Toast/Toast";

export const EditNetworkSidebar: React.FC<EditNetworkSidebarProps> = ({
  network,
  onClose,
  show,
  onNetworkEdited,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Network>({
    defaultValues: network,
  });

  // Agregar la destructuración de useFieldArray
  const { fields: allocFields, append: addAlloc } = useFieldArray({
    control,
    name: "alloc",
  });

  const { fields: nodeFields, append: addNode } = useFieldArray({
    control,
    name: "nodes",
  });

  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Función separada para manejar el submit
  const onSubmit = async (data: Network) => {
    try {
      // Validaciones previas
      if (data.alloc.length === 0) {
        showToast("Se requiere al menos una asignación", "error");
        return;
      }

      if (data.nodes.length === 0) {
        showToast("Se requiere al menos un nodo", "error");
        return;
      }

      // Validar tipos de nodos
      const validTypes = ["miner", "rpc", "normal"];
      const invalidNode = data.nodes.find(
        (node) => !validTypes.includes(node.type)
      );
      if (invalidNode) {
        showToast(`Tipo de nodo inválido: ${invalidNode.type}`, "error");
        return;
      }

      // Formatear datos según espera el backend
      const updatedData = {
        id: network.id, // Mantener el ID original
        chainId: Number(data.chainId),
        subnet: data.subnet,
        ipBootNode: data.ipBootNode,
        alloc: data.alloc.map((a) => ({
          address: a.address.startsWith("0x") ? a.address : `0x${a.address}`, // Asegurar formato 0x
          value: Number(a.value),
        })),
        nodes: data.nodes.map((n) => ({
          type: n.type,
          name: n.name,
          ip: n.ip,
          port: n.type === "rpc" ? Number(n.port) : null,
        })),
      };

      console.log("Datos enviados:", updatedData); // Debug

      const response = await fetch(`${apiUrl}/network/edit/${network.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar la red");
      }

      const updatedNetwork = await response.json();
      showToast("Red actualizada correctamente", "success");
      onNetworkEdited(updatedNetwork);
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al actualizar la red",
        "error"
      );
    }
  };

  // Agregar el useEffect para manejar el scroll
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

  // Asegurar que el componente retorna null si no debe mostrarse
  if (!show) return null;

  return (
    <>
      <div
        className="offcanvas offcanvas-end show"
        tabIndex={-1}
        style={{ visibility: "visible" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Edit Network</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label>ID</label>
              <input {...register("id")} className="form-control" disabled />
            </div>

            <div className="mb-3">
              <label>Chain ID</label>
              <input
                {...register("chainId", { required: "Chain ID is required" })}
                type="number"
                className={`form-control ${errors.chainId ? "is-invalid" : ""}`}
              />
              {errors.chainId && (
                <div className="invalid-feedback">{errors.chainId.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label>Subnet</label>
              <input
                {...register("subnet", { required: "Subnet is required" })}
                className={`form-control ${errors.subnet ? "is-invalid" : ""}`}
              />
              {errors.subnet && (
                <div className="invalid-feedback">{errors.subnet.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label>IP Boot Node</label>
              <input
                {...register("ipBootNode", {
                  required: "IP Boot Node is required",
                })}
                className={`form-control ${errors.ipBootNode ? "is-invalid" : ""}`}
              />
              {errors.ipBootNode && (
                <div className="invalid-feedback">
                  {errors.ipBootNode.message}
                </div>
              )}
            </div>

            {/* Sección Alloc */}
            <div className="mb-4">
              <h6>Allocations</h6>
              {allocFields.map((field, index) => (
                <div key={field.id} className="mb-2">
                  <input
                    {...register(`alloc.${index}.address`)}
                    placeholder="Address"
                    className="form-control mb-2"
                  />
                  <input
                    {...register(`alloc.${index}.value`)}
                    type="number"
                    placeholder="Value"
                    className="form-control"
                  />
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-secondary mt-2"
                onClick={() => addAlloc({ address: "", value: 0 })}
              >
                Add Allocation
              </button>
            </div>

            {/* Sección Nodes */}
            <div className="mb-4">
              <h6>Nodes</h6>
              {nodeFields.map((field, index) => (
                <div key={field.id} className="mb-3">
                  <select
                    {...register(`nodes.${index}.type`)}
                    className="form-control mb-2"
                  >
                    <option value="">Select Type</option>
                    <option value="miner">Miner</option>
                    <option value="rpc">RPC</option>
                    <option value="normal">Normal</option>
                  </select>
                  <input
                    {...register(`nodes.${index}.name`)}
                    placeholder="Node Name"
                    className="form-control mb-2"
                  />
                  <input
                    {...register(`nodes.${index}.ip`)}
                    placeholder="IP Address"
                    className="form-control"
                  />
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-secondary mt-2"
                onClick={() =>
                  addNode({ type: "", name: "", ip: "", port: null })
                }
              >
                Add Node
              </button>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Network
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        className="offcanvas-backdrop fade show"
        style={{ visibility: "visible" }}
        onClick={onClose}
      ></div>
    </>
  );
};
