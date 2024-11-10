import React, { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { Network } from '../../../backend/src/types/network';



export const NetworkDetails: React.FC = () => {
    const params = useParams()
    const [network, setNetwork] = useState<Network | null>(null);
    const id = params.id;
    useEffect(() => {
        fetch(`http://localhost:3000/network/${id}`).then((response) => {
          response.json().then((data) => {
            setNetwork(data);
          });
        });
      }, [id]);

      if (!network ){
        return <div className="container mt-4">
        <h3>Network Details</h3>
            <p>Empty network details</p>
        </div>
      }

      return <div className="container mt-4">
      <h3>Network Details</h3>
        <section className="border p-3 mb-4 rounded bg-light">
            <h5>General information </h5>
            <ul className="list-unstyled">
                <li><strong>ID:</strong>{network.id}</li>
                <li><strong>Chain ID:</strong>{network.chainId}</li>
                <li><strong>Subnet:</strong>{network.subnet}</li>
                <li><strong>IP Boot Node:</strong>{network.ipBootNode}</li>
            </ul>
        </section>

        <section className="border p-3 mb-4 rounded bg-light">
            <h5>Allocations</h5>
            { network.alloc.length > 0 ? (
                <ul className="list-unstyled">
                    {network.alloc.map((item,index)=>(
                        <li key={index} className="mb-2">
                            <strong>Address:</strong>{item.address} <br />
                            <strong>Value:</strong>{item.value}
                        </li>
                    ))}
                </ul>) : <p>No allocations avalaible</p>

            }
        </section>

        <section className="border p-3 rounded bg-lightn mb-2">
            <h5></h5>
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>IP</th>
                            <th>Port</th>
                        </tr>
                    </thead>
                    <tbody>
                        {network.nodes.map((node, index)=>(
                            <tr key={index}>
                                <td>{node.type}</td>
                                <td>{node.id}</td>
                                <td>{node.ip}</td>
                                <td>{node.port || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      </div>
 
}