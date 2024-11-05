import React from 'react';
import {Header} from './Header';
import {Footer} from './Footer';

export const App: React.FC = () => {
    return (<div> 
            <Header></Header>
            <p> Text to body</p>
            <Footer></Footer>
        </div>
   
    )
}