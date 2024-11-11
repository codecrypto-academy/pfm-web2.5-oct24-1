import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes  } from 'react-router-dom'
import {App} from './components/App'
import { NetworkList } from './components/NetworkList'
import './index.css'
import { NetworkDetails } from './components/NetworkDetails'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
      <Routes>
        <Route path="/" element= {<App></App>}>
            <Route index element={<NetworkList></NetworkList>} />
            <Route path="*" element={<NetworkList></NetworkList>} />
            <Route path="/networks" element={<NetworkList></NetworkList>}></Route>
            <Route path="/network/:id" element={<NetworkDetails></NetworkDetails>}></Route>
        </Route>
      </Routes>
      </BrowserRouter>
  </StrictMode>,
)
