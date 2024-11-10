import React, { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';


export const NetworkDetails: React.FC = () => {
    const params = useParams()
    const [network, setNetwork] = useState(null);
    const id = params.id;
    useEffect(() => {
        fetch(`http://localhost:3000/network/${id}`).then((response) => {
          response.json().then((data) => {
            setNetwork(data);
          });
        });
      }, [id]);

      if (!network || network.length === 0){
        return <div>
        <h3>Network Details</h3>
            <p>Empty network details</p>
        </div>
      }

      return <div>
      <h3>Network Details</h3>
              <pre>{JSON.stringify(network, null, 2)}</pre>
      </div>
 
}