import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Network } from '../../../backend/src/types/network';

export const NetworkList: React.FC = () => {
    const [networks, setNetworks] = useState<Network[] | null>([]);
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
            <td><Link to={`/networkdetails/${network.id}`}>{network.id}</Link></td>
            <td>Up/Down</td>
            <td><button>Start</button></td>
            <td><button>Stop</button></td>
            <td><button>Restart</button></td>
            <td><button>Operations</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
};