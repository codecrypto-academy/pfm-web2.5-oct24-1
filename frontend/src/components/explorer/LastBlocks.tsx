import React from 'react';
import { useQuery } from 'react-query';
import { Link, useParams } from 'react-router-dom';

interface Block {
  number: number;
  hash: string;
  difficulty: string;
  timestamp: number;
}

const fetchLastBlocks = async (networkId: string): Promise<Block[]> => {
  const response = await fetch(`http://localhost:3000/network/${networkId}/explorer/blocks`);
  if (!response.ok) {
    throw new Error('Error fetching blocks data');
  }
  return response.json();
};

export const LastBlocks: React.FC = () => {
  const { id: networkId } = useParams<{ id: string }>();

  const { data: blocks, isLoading, error } = useQuery<Block[]>(
    ['lastBlocks', networkId],
    () => fetchLastBlocks(networkId!),
    { enabled: !!networkId } // Solo se ejecuta si networkId está definido
  );

  if (isLoading) {
    return <div className="loading-message">Loading blocks...</div>;
  }

  if (error) {
    return <div className="error-message">Error fetching blocks. Please try again later.</div>;
  }

  if (!blocks || blocks.length === 0) {
    return <div className="empty-message">No blocks found for this network.</div>;
  }

  return (
    <div className="last-blocks-container">
      <h3 className="last-blocks-title">Last blocks of the network</h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Number</th>
            <th>Hash</th>
            <th>Difficulty</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.number}>
              <td>
                <Link to={`/network/${networkId}/explorer/block/${block.number}`} className="link">
                  {block.number}
                </Link>
              </td>
              <td>{block.hash}</td>
              <td>{block.difficulty}</td>
              <td>{new Date(block.timestamp * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
