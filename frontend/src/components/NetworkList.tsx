import React from 'react';
import { Link } from 'react-router-dom';


export const NetworkList: React.FC = () => {
    const networks = [
        {
            "id": "red2",
            "chainId": 21,
            "subnet": "172.16.239.0/24",
            "ipBootNode": "172.16.239.10",
            "alloc": [
                {
                    "address": "C077193960479a5e769f27B1ce41469C89Bec299",
                    "value": 100000000
                }
            ],
            "nodes": [
                {
                    "type": "rpc",
                    "name": "rpc1",
                    "ip": "172.16.239.20",
                    "port": 8546
                },
                {
                    "type": "miner",
                    "name": "miner1",
                    "ip": "172.16.239.30",
                    "port": null
                },
                {
                    "type": "rpc",
                    "name": "rpc2",
                    "ip": "172.16.239.40",
                    "port": 8547
                },
                {
                    "type": "normal",
                    "name": "normal1",
                    "ip": "172.16.239.50",
                    "port": null
                }
            ]
        },
        {
            "id": "mired",
            "chainId": 444555,
            "subnet": "172.16.200.0/24",
            "ipBootNode": "172.16.200.10",
            "alloc": [
                {
                    "address": "C077193960479a5e769f27B1ce41469C89Bec299",
                    "value": 100000000
                },
                {
                    "address": "0x17752fF2C194085ffbaA59EA128Fd4bdacd91193",
                    "value": 100000000
                }
            ],
            "nodes": [
                {
                    "type": "miner",
                    "name": "minero1",
                    "ip": "172.16.200.20",
                    "port": null
                },
                {
                    "type": "rpc",
                    "name": "rcp1",
                    "ip": "172.16.200.30",
                    "port": 9988
                }
            ]
        }
    ];

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
                            <td><button>Operations</button></td>
                        </tr>     
            ))}
        </tbody>
        </table>
    </div>
};