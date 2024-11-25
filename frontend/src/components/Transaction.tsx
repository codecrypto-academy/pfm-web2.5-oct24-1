import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';

// Tipo de datos para una transacción
interface TransactionDetails {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  hash: string;
  to: string | null;
  value: string;
  [key: string]: any; // Otros campos ignorados
}

// Función para obtener los datos de la transacción
const fetchTransactionDetails = async (id: string, txId: string) => {
  const response = await fetch(`http://localhost:3000/network/${id}/explorer/transaction/${txId}`);
  if (!response.ok) {
    throw new Error('Error al obtener la transacción');
  }
  return response.json();
};

export const Transaction: React.FC = () => {
  const { id, txId } = useParams<{ id: string; txId: string }>();

  const { data: transaction, isLoading, isError } = useQuery<TransactionDetails>(
    ['transactionDetails', id, txId],
    () => fetchTransactionDetails(id!, txId!)
  );

  if (isLoading) return <div>Loading transaction data...</div>;
  if (isError || !transaction) return <div>Error loading the transaction data</div>;

  // Datos a mostrar
  const displayedFields = [
    { label: 'Hash', value: transaction.hash },
    { 
      label: 'Block Number', 
      value: (
        <Link to={`/network/${id}/operation/block/${transaction.blockNumber}`}>
          {transaction.blockNumber}
        </Link>
      ) 
    },
    { 
      label: 'From', 
      value: (
        <Link to={`/network/${id}/operation/balance/${transaction.from}`}>
          {transaction.from.slice(0, 5)}...{transaction.from.slice(-5)}
        </Link>
      ) 
    },
    { 
      label: 'To', 
      value: transaction.to ? (
        <Link to={`/network/${id}/explorer/balance/${transaction.to}`}>
          {transaction.to.slice(0, 5)}...{transaction.to.slice(-5)}
        </Link>
      ) : 'Contract Creation' 
    },
    { label: 'Gas', value: transaction.gas },
    { label: 'Value', value: `${parseInt(transaction.value, 10) / 1e18} ETH` },
  ];

  return (
    <div className="transaction-details">
      <h3>Tansaction details</h3>
      <table className="transaction-table">
        <tbody>
          {displayedFields.map((field, index) => (
            <tr key={index}>
              <th>{field.label}</th>
              <td>{field.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
