import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Network } from '../../../backend/src/types/network';

export const NetworkList: React.FC = () => {
    const [networks, setNetworks] = useState<Network[] | null>([]);
    const [message, setMessage] = useState<string>();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
        // Función asíncrona para iniciar la red
        const startNetworkCall = async (id: string) => {
          setLoadingId(id); // Activa el estado de carga
          try {
              const response = await fetch(`http://localhost:3000/network/${id}/start`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  }
              });
  
              if (response.ok) {
                  const data = await response.json();
                  setMessage("Network started successfully.");
                  console.log("Response Data:", data); // Muestra la respuesta recibida en la consola
              } else {
                  setMessage("Failed to start network.");
                  console.error("Error:", response.statusText);
              }
          } catch (error) {
              setMessage("An error occurred while trying to start the network.");
              console.error("Error:", error);
          } finally {
            setLoadingId(null); // Desactiva el estado de carga tras completar la llamada
        }
      };


    useEffect(() => {
      fetch("http://localhost:3000/networks").then((response) => {
        response.json().then((data) => {
          setNetworks(data);
        });
      });
    }, []);

    if (!networks || networks.length === 0) {
        return <div>
                    <h3>Networks List</h3>
                    <p>No hay redes disponibles.</p>
            </div>
      }

    return <div>
      
    <h3>Networks List</h3>
    {message && <h5 className="text-success">{message}</h5>}
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Chain ID</th>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
          <th scope="col">Start</th>
          <th scope="col">Stop</th>
          <th scope="col">Restart</th>
          <th scope="col">Operations</th>
        </tr>
      </thead>
      <tbody>
        {networks.map((network, index) => (
          <tr key={index}>
            <td>{network.chainId}</td>
            <td><Link to={`/network/${network.id}`}>{network.id}</Link></td>
            <td>Up/Down</td>
            <td><button className="btn btn-secondary" disabled={loadingId === network.id || disabledIds.has(network.id)} onClick={() => startNetworkCall(network.id)}>{loadingId === network.id ? "Starting..." : "Start Network"}</button></td>
            <td><button className="btn btn-secondary">Stop</button></td>
            <td><button className="btn btn-secondary">Restart</button></td>
            <td><button className="btn btn-secondary">Operations</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
};