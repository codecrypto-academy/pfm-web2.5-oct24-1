import React from 'react';
import logo from '../assets/blockchain-logo.png';

export const Header: React.FC = () => (
    <header className="d-flex justify-content-between align-items-center bg-dark text-white p-3">
        <div className="ms-3 d-flex align-items-center">
            <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
        </div>
        <h1 className="m-0 text-center">Ethereum Private Network Creation</h1>
    <div className="me-3"></div> 
  </header>
  );
  
