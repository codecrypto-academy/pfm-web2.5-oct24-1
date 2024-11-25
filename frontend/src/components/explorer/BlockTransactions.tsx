import React, {useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';

interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
}

interface Block {
  number: string;
  hash: string;
  difficulty: string;
  timestamp: string;
  transactions: Transaction[];
  [key: string]: any; // Permite incluir propiedades adicionales para el JSON desplegable
}

const truncateString = (string: string): string => {
    if (!string) return '';
    if (string.length <= 10) return string;
    return `${string.slice(0, 5)}...${string.slice(-5)}`;
};

export const BlockTransactions: React.FC = () => {
    const { id, blockId } = useParams<{ id: string; blockId: string }>();

    const [isJsonVisible, setJsonVisible] = useState<boolean>(false);
    const toggleJsonVisibility = () => setJsonVisible((prev) => !prev);

  // Fetch de datos del bloque
  const { data: block, error, isLoading } = useQuery<Block>(
    ['blockDetails', id, blockId],
    async () => {
      const response = await fetch(
        `http://localhost:3000/network/${id}/explorer/block/${blockId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch block details');
      }
      return response.json();
    }
  );

  if (isLoading) return <div>Loading block details...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  if (!block) return <div>No block data found.</div>;

  return (
    <div className="block-container">
      <h3 className="block-title">Block Transactions</h3>

      {/* Información del bloque */}
      <div className="block-details">
        <p>
          <strong>Block Number:</strong> {block.number}
        </p>
        <p>
          <strong>Hash:</strong> {block.hash}
        </p>
        <p>
          <strong>Difficulty:</strong> {block.difficulty}
        </p>
        <p>
          <strong>Timestamp:</strong>{' '}
          {new Date(parseInt(block.timestamp, 10) * 1000).toLocaleString()}
        </p>
      </div>

      {/* Lista de transacciones */}
      <h4>Transactions</h4>
      {block.transactions.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {block.transactions.map((tx, index) => (
              <tr key={index}>
                <td className="hash-column">
                  <Link to={`/network/${id}/explorer/transaction/${tx.hash}`}>
                    {truncateString(tx.hash)}
                  </Link>
                </td>
                <td>
                  <Link to={`/network/${id}/explorer/address/${tx.from}`}>
                    {truncateString(tx.from)}
                  </Link>
                </td>
                <td>
                  {tx.to ? (
                    <Link to={`/network/${id}/explorer/address/${tx.to}`}>
                      {truncateString(tx.to)}
                    </Link>
                  ) : (
                    'Contract Creation'
                  )}
                </td>
                <td>{parseInt(tx.value, 10) / 1e18} ETH</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found in this block.</p>
      )}

      {/* Desplegable del JSON completo */}
      <div className="json-toggle-container">
        <button className="btn btn-secondary" onClick={toggleJsonVisibility}>
          {isJsonVisible ? 'Hide Raw JSON' : 'Show Raw JSON'}
        </button>
        {isJsonVisible && (
          <pre className="json-display">{JSON.stringify(block, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};
