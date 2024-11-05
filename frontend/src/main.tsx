import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes  } from 'react-router-dom'
import {App} from './components/App'
import { NetworkList } from './components/NetworkList'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
      <Routes>
        <Route path="/" element= {<App></App>}>
            <Route path="/networklist" element={<NetworkList></NetworkList>}></Route>
        </Route>
      </Routes>
      </BrowserRouter>
  </StrictMode>,
)
