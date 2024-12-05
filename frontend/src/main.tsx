import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { App } from './components/App';
import './index.css';
import { NetworkList } from './components/NetworkList';
import { NetworkDetails } from './components/NetworkDetails';
import { AddNetwork } from './components/AddNetwork';
import { LastBlocks } from './components/explorer/LastBlocks';
import { BlockTransactions } from './components/explorer/BlockTransactions';
import { Transaction } from './components/explorer/Transaction';
import { Address } from './components/explorer/Address';
import { Explorer } from './components/explorer/Explorer';
import { Faucet } from './components/Faucet'
import { TeamMembers } from './components/TeamMembers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minut of fresh data
      cacheTime: 5 * 60 * 1000, // 5 minutes in cache
      retry: 2, // Number of retry in case of errors
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<NetworkList />} />
            <Route path="*" element={<h3>404 page not found</h3>} />
            <Route path="/networks" element={<NetworkList />} />
            <Route path="/network/:id" element={<NetworkDetails />} />
            <Route path="/addnetwork" element={<AddNetwork />} />
            <Route path="/network/:id/operation/blocks" element={<LastBlocks />} />
            <Route path="/network/:id/faucet/" element={<Faucet></Faucet>} />
            <Route path="/network/:id/explorer" element={<Explorer />}>
              <Route path="block/:blockId" element={<BlockTransactions />} />
              <Route path="transaction/:txId" element={<Transaction />} />
              <Route path="address/:address" element={<Address />} />
              <Route path="*" element={<Explorer />} />
            </Route>
            <Route path="/team-members" element={<TeamMembers/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
