import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { App } from './components/App';
import { NetworkList } from './components/NetworkList';
import { NetworkDetails } from './components/NetworkDetails';
import { AddNetwork } from './components/AddNetwork';
import { LastBlocks } from './components/LastBlocks';
import { BlockTransactions } from './components/BlockTransactions';
import { Transaction } from './components/Transaction';
import './index.css';

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
            <Route path="*" element={<NetworkList />} />
            <Route path="/networks" element={<NetworkList />} />
            <Route path="/network/:id" element={<NetworkDetails />} />
            <Route path="/addnetwork" element={<AddNetwork />} />
            <Route path="/network/:id/operation/blocks" element={<LastBlocks />} />
            <Route path="/network/:id/operation/block/:blockId" element={<BlockTransactions />} />
            <Route path="/network/:id/operation/transaction/:txId" element={<Transaction />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
