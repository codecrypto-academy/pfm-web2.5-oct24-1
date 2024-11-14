import React from 'react';
import { Outlet } from "react-router-dom";
import {Header} from './Header';
import {Footer} from './Footer';
import { Sidebar } from './Sidebar';


export const App: React.FC = () => {
    return (<div  className="app-container"> 
            <Header></Header>
            <div className='content-layout'>
                <Sidebar></Sidebar>
                <div className="main-content">
                    <Outlet></Outlet>
                    <Footer></Footer>
                </div>
            </div>   
        </div>
   
    )
}