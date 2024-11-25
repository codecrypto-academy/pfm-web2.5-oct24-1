import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

// Tipo de datos para el balance
interface AddressDetails {
  address: string;
  balance: string;
}

// Función para obtener los detalles de la dirección
const fetchAddressDetails = async (id: string, address: string) => {
  const response = await fetch(`http://localhost:3000/network/${id}/explorer/balance/${address}`);
  if (!response.ok) {
    throw new Error('Error al obtener la información de la dirección');
  }
  return response.json();
};

export const Address: React.FC = () => {
  const { id, address } = useParams<{ id: string; address: string }>();

  const { data: addressDetails, isLoading, isError } = useQuery<AddressDetails>(
    ['addressDetails', id, address],
    () => fetchAddressDetails(id!, address!)
  );

  if (isLoading) return <div>Cargando información de la dirección...</div>;
  if (isError || !addressDetails) return <div>Error al cargar los datos de la dirección</div>;

  const balanceNatural = addressDetails.balance.toString();
  return (
    <div className="address-container">
      <h3 className="address-title">Address Balance</h3>
      <div className="address-details">
        <p>
          <strong>Address:</strong> {addressDetails.address}
        </p>
        <p>
          <strong>Balance:</strong> {balanceNatural} ETH
        </p>
      </div>
    </div>
  );
};
