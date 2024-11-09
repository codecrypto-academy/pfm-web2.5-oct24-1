import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

export const NetworkList: React.FC = () => {
    const [networks, setNetworks] = useState([]);
    useEffect(() => {
      fetch("http://localhost:3000/networks").then((response) => {
        response.json().then((data) => {
          setNetworks(data);
        });
      });
    }, []);


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
        {networks.map((network,index) =>(
                        <tr key={index}>
                            <td> {network.chainId}</td>
                            <td><Link to={`/network/${network.id}`}>{network.id}</Link></td>
                            <td> Up/Down</td>
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