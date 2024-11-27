import React from "react";
import { Network } from "../../../backend/src/types/network";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { ToastContainer, useToast } from "../components/Toast/Toast";


const isValidSubnet = (subnet: string): boolean => {
  const subnetRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(0|8|16|24)$/;
  const match = subnet.match(subnetRegex);
  if (!match) return false;

  const octets = match.slice(1, 5).map(Number);
  return octets.every((octet) => octet >= 0 && octet <= 255);
};

 // Helper function to extract fixed part of the subnet based on the mask
 const getFixedIPPart = (subnet: string) => {
  if (!subnet) return "";
  const [ip, mask] = subnet.split("/");
  const octets = ip.split(".");
  const fixedOctets = parseInt(mask) / 8;
  return octets.slice(0, fixedOctets).join(".") + ".";
};

const validateIPBootNode = (ipBootNode: string, subnet: string): string | true => {
  if (!isValidSubnet(subnet)) {
    return "Invalid subnet format. Please specify a valid subnet.";
  }

  const [_, mask] = subnet.split("/");
  const fixedPart = getFixedIPPart(subnet);

  const maskValue = parseInt(mask);
  const bootNodeParts = ipBootNode.split(".");

  switch (maskValue) {
    case 8: // Expecting num.num.num
      if (bootNodeParts.length !== 3) {
        return "IP Boot Node must follow the format: x.x.x for /8 mask.";
      }
      break;
    case 16: // Expecting num.num
      if (bootNodeParts.length !== 2) {
        return "IP Boot Node must follow the format: x.x for /16 mask.";
      }
      break;
    case 24: // Expecting single num in range 0-255
      if (bootNodeParts.length !== 1 || isNaN(parseInt(bootNodeParts[0])) || parseInt(bootNodeParts[0]) < 0 || parseInt(bootNodeParts[0]) > 255) {
        return "IP Boot Node must be a number between 0 and 255 for /24 mask.";
      }
      break;
    default:
      return "Unsupported subnet mask. Only /8, /16, and /24 are allowed.";
  }

  // Ensure the IP Boot Node matches the fixed part
  const completeIP = fixedPart + ipBootNode;
  const completeParts = completeIP.split(".");
  if (!completeParts.every((part) => parseInt(part) >= 0 && parseInt(part) <= 255)) {
    return "Complete IP Boot Node address is invalid.";
  }

  return true;
};

const isAddress = (value:string) => {
  const regex = /^0x[a-fA-F0-9]{40}$/; // Patrón para direcciones Ethereum
  return regex.test(value);
};

export const AddNetwork: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    watch,
  } = useForm<Network>();
  const apiURL = import.meta.env.VITE_API_URL;
  const { toasts, showToast, removeToast } = useToast();
  const subnet = watch("subnet");
  const ipBootNode = watch("ipBootNode");

  const fixedIPPart = getFixedIPPart(subnet);

  const onSubmit: SubmitHandler<Network> = async (data) => {
    // convert chainId to number
    data.chainId = data.chainId ? Number(data.chainId) : 0;

    // convert each alloc entry's value into number
    data.alloc = data.alloc.map((allocEntry) => ({
      ...allocEntry,
      value: allocEntry.value ? Number(allocEntry.value) : 0,
    }));

    // convert each node's port int number
    data.nodes = data.nodes.map((nodeEntry) => ({
      ...nodeEntry,
      port: nodeEntry.port !== null ? Number(nodeEntry.port) : null, // Convert port to number if not null
    }));

    console.log(data);

    if (data.alloc.length === 0 || data.nodes.length === 0) {
      // Si no hay elementos en alguno de los arreglos, establecemos un error
      setError("alloc", {
        type: "manual",
        message: "At least one alloc entry is required.",
      });
      setError("nodes", {
        type: "manual",
        message: "At least one node entry is required.",
      });
      return; // Detenemos el submit
    }
    try {
      const response = await fetch(`${apiURL}/network/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Enviamos los datos como JSON
      });

        // Procesar respuesta si es exitosa
      if (response.ok) {
        const result = await response.json(); // Extraemos el cuerpo de la respuesta
        console.log("Network created successfully:", result);
        showToast("Network created successfully.");
        // Aquí podrías redirigir o actualizar la UI después de la respuesta exitosa
      } else {
        // Si no es exitosa, obtenemos el cuerpo del error
        const errorData = await response.json();
        console.error("Error creating network:", errorData);
        showToast(
          `Error creating network: ${errorData.error} - ${errorData.details
            .map((detail) =>`${detail.field}: ${detail.message}`)
            .join(", ")}`
            ,"error"
            ,0
        );
      }
    } catch (error) {
      // Manejo de errores inesperados (como problemas de red)
      console.error("Unexpected error:", error);
      showToast(`An unexpected error occurred. Please try again.`,"error");
    }
  };

  const { fields: allocFields, append: addAlloc } = useFieldArray({
    control,
    name: "alloc",
  });
  const { fields: nodeFields, append: addNode } = useFieldArray({
    control,
    name: "nodes",
  });

  return (  
    <div className="mb-2">
    <ToastContainer toasts={toasts} removeToast={removeToast} />
    <h3 className="text-start mb-4">Add new network</h3>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 shadow-lg rounded-3 bg-white"
    >
      <div className="mb-3">
        <label htmlFor="">ID</label>
        <input
          {...register("id", { required: "ID is required" })}
          type="text"
          placeholder="newNetworkId"
          className={`form-control ${errors.id ? "is-invalid" : ""}`}
        />
        {errors.id && <p className="text-danger">{errors.id.message}</p>}
      </div>

      <div className="mb-3">
        <label htmlFor="">Chain ID</label>
        <input
          {...register("chainId", { required: "Chain ID is required" })}
          type="number"
          placeholder="1234456"
          className={`form-control ${errors.chainId ? "is-invalid" : ""}`}
        />
        {errors.chainId && <p className="text-danger">{errors.chainId.message}</p>}
      </div>

      <div className="mb-3">
        <label htmlFor="">Subnet</label>
        <input
          {...register("subnet", { 
            required: "Subnet is required",
            validate: (value) => {
              if (!isValidSubnet(value)) {
                return "Invalid subnet format. Expected format: x.x.x.x/octal(8,16,24).";
              }
              return true;
            }
          })}
          type="text"
          placeholder="e.g., 192.168.0.0/24"
          className={`form-control ${errors.subnet ? "is-invalid" : ""}`}
        />
        {errors.subnet && <p className="text-danger">{errors.subnet.message}</p>}
      </div>

      <div className="mb-3">
        <label htmlFor="">IP Boot Node</label>
        <div className="input-group">
          <span className="input-group-text">{fixedIPPart}</span>
          <input
            {...register("ipBootNode", { 
              required: "Ip Boot Node is required",
              validate: (value) => validateIPBootNode(value, subnet)
            })}
            type="text"
            placeholder="0.0.0 | 0.0 | 0"
            className={`form-control ${errors.ipBootNode ? "is-invalid" : ""}`}
          />
        </div>
        {errors.ipBootNode && <p className="text-danger">{errors.ipBootNode.message}</p>}
      </div>

      {/* Section Alloc */}
      <div className="mb-4">
        <h5>Allocations</h5>
        {allocFields.map((field, index) => (
          <div key={field.id} className="mb-2">
            <div className="d-flex flex-column">
              <input
                type="text"
                {...register(`alloc.${index}.address`, {
                  required: "Address is required",
                  validate: (value) =>
                      isAddress(value) || "Invalid Ethereum address"
                })}
                placeholder="0x3d32324..."
                className={`form-control me-2 ${errors.alloc?.[index]?.address ? "is-invalid" : ""}`}
              />
              {errors.alloc?.[index]?.address && (
                <p className="text-danger">{errors.alloc[index].address.message}</p>
              )}
            </div>
            
            <div className="d-flex flex-column">
              <input
                type="number"
                {...register(`alloc.${index}.value`, {
                  required: "Value is required",
                  validate: (value) => value > 1000 || "Value must be greater than 1000"
                })}
                placeholder="100000"
                className={`form-control me-2 ${errors.alloc?.[index]?.value ? "is-invalid" : ""}`}
              />
              {errors.alloc?.[index]?.value && (
                <p className="text-danger">{errors.alloc[index].value.message}</p>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => addAlloc({ address: "", value: 0 })}
        >
          Add Alloc
        </button>
      </div>

      {/* Section Nodes */}
      <div className="mb-3">
        <h5>Nodes</h5>
        {nodeFields.map((field, index) => (
          <div key={field.id} className="mb-4">
            <select
              {...register(`nodes.${index}.type`, {
                required: "Type is required",
              })}
              className={`form-control mb-1 ${errors.nodes?.[index]?.type ? "is-invalid" : ""}`}
            >
              <option value="">Select Type</option>
              <option value="miner">Miner</option>
              <option value="rpc">RPC</option>
              <option value="normal">Normal</option>
            </select>
            <input
              {...register(`nodes.${index}.name`, {
                required: "Name is required",
              })}
              placeholder="Name"
              className={`form-control mb-1 ${errors.nodes?.[index]?.name ? "is-invalid" : ""}`}
            />
            <input
              {...register(`nodes.${index}.ip`, {
                required: "IP is required",
              })}
              placeholder="0.0.0.0"
              className={`form-control mb-1 ${errors.nodes?.[index]?.ip ? "is-invalid" : ""}`}
            />
            {/* Conditionally render the port input if node type is rpc */}
            {watch(`nodes.${index}.type`) === "rpc" && (
              <input
                type="number"
                {...register(`nodes.${index}.port`)}
                placeholder="1234 (Optional)"
                className="form-control"
              />
            )}
          </div>
        ))}
        {errors.nodes && <p className="text-danger">{errors.nodes.message}</p>}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => addNode({ type: "", name: "", ip: "", port: null })}
        >
          Add Node
        </button>
      </div>

      <button className="btn btn-secondary" type="submit">
        Add Network
      </button>
    </form>
  </div>

   
  )
};