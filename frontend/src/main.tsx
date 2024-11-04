import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {Header} from './components/Header'
import { Footer } from './components/Footer';
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header></Header>
    <p> Text to body</p>
    <Footer></Footer>
  </StrictMode>,
)
