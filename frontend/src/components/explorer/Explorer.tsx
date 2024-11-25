import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation, Navigate, useParams } from 'react-router-dom';

export const Explorer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { blockId, txId, address } = useParams();
  const [searchData, setSearchData] = useState<string>('');

  // Lista de rutas válidas con sus parámetros requeridos
  const validPathsWithParams = [
    { path: '/block', param: blockId },
    { path: '/transaction', param: txId },
    { path: '/address', param: address },
  ];

  // Validar si la ruta actual tiene los parámetros necesarios
  const isValidPathWithParams = validPathsWithParams.some(
    ({ path, param }) => location.pathname.includes(path) && param
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchData.length === 66) {
      navigate(`transaction/${searchData}`);
    } else if (searchData.length === 42) {
      navigate(`address/${searchData}`);
    } else if (/^\d+\.?\d*$/.test(searchData)) {
      navigate(`block/${searchData}`);
    } else {
      alert('Invalid input. Please enter a valid block number, transaction hash, or address.');
    }
  };

  return (
    <div className="explorer-container">
      <h2 className="explorer-title">Blockchain network explorer</h2>
      <p className="explorer-description">
        This is the explorer operation. Here you can search transactions, address, or blocks information in the current blockchain network.
      </p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter Block Number, Transaction Hash, or Address"
          value={searchData}
          onChange={(e) => setSearchData(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {/* Validación de rutas válidas y redirección */}
      {!isValidPathWithParams && <Navigate to={`/network/${location.pathname.split('/')[2]}/explorer`} replace />}

      <div className="component-container">
        <Outlet />
      </div>
    </div>
  );
};
