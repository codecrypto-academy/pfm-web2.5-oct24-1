import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

export const Explorer: React.FC = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState<string>('');

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
      <h2 className="explorer-title">Explorer</h2>
      <p className="explorer-description">
        This is the explorer operations. Here you can find transactions, address, or blocks information in the current blockchain network.
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

      <div className="component-container">
        <Outlet />
      </div>
    </div>
  );
};
